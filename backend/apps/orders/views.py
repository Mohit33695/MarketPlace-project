from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import CartItem, Order, OrderItem
from .serializers import CartItemSerializer, OrderSerializer, PlaceOrderSerializer
from apps.products.models import Product


class IsBuyer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'buyer'


# ─── Cart Views ────────────────────────────────────────────────────────────────

class CartView(generics.ListAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsBuyer]

    def get_queryset(self):
        return CartItem.objects.filter(buyer=self.request.user).select_related('product')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = CartItemSerializer(qs, many=True, context={'request': request})
        cart_total = sum(item.subtotal for item in qs)
        return Response({
            'items': serializer.data,
            'total': float(cart_total),
            'count': qs.count()
        })


class CartAddView(APIView):
    permission_classes = [IsBuyer]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        try:
            product = Product.objects.get(pk=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        if quantity > product.quantity:
            return Response({'error': f'Only {product.quantity} {product.unit} available.'}, status=400)

        cart_item, created = CartItem.objects.get_or_create(
            buyer=request.user, product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity = min(cart_item.quantity + quantity, product.quantity)
            cart_item.save()

        return Response({'message': 'Added to cart.', 'created': created}, status=status.HTTP_200_OK)


class CartUpdateView(APIView):
    permission_classes = [IsBuyer]

    def patch(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, buyer=request.user)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=404)
        quantity = request.data.get('quantity', item.quantity)
        if int(quantity) <= 0:
            item.delete()
            return Response({'message': 'Item removed.'})
        item.quantity = quantity
        item.save()
        return Response(CartItemSerializer(item, context={'request': request}).data)

    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, buyer=request.user)
            item.delete()
        except CartItem.DoesNotExist:
            pass
        return Response({'message': 'Removed from cart.'}, status=status.HTTP_204_NO_CONTENT)


class CartClearView(APIView):
    permission_classes = [IsBuyer]

    def delete(self, request):
        CartItem.objects.filter(buyer=request.user).delete()
        return Response({'message': 'Cart cleared.'})


# ─── Order Views ───────────────────────────────────────────────────────────────

class PlaceOrderView(APIView):
    permission_classes = [IsBuyer]

    @transaction.atomic
    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        cart_items = CartItem.objects.filter(buyer=request.user).select_related('product')
        if not cart_items.exists():
            return Response({'error': 'Cart is empty.'}, status=400)

        # Validate stock
        for item in cart_items:
            if item.quantity > item.product.quantity:
                return Response({'error': f'Insufficient stock for {item.product.name}.'}, status=400)

        order = Order.objects.create(
            buyer=request.user,
            delivery_address=serializer.validated_data['delivery_address'],
            delivery_city=serializer.validated_data.get('delivery_city', ''),
            delivery_pincode=serializer.validated_data.get('delivery_pincode', ''),
            notes=serializer.validated_data.get('notes', ''),
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                farmer=item.product.farmer,
                quantity=item.quantity,
                price_at_purchase=item.product.price,
                unit=item.product.unit,
            )
            # Deduct inventory
            item.product.quantity -= item.quantity
            item.product.save()

        order.calculate_total()
        cart_items.delete()

        return Response({
            'message': 'Order placed successfully!',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


class BuyerOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).prefetch_related('items')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'buyer':
            return Order.objects.filter(buyer=self.request.user)
        return Order.objects.all()


class FarmerOrdersView(generics.ListAPIView):
    """Orders containing the farmer's products."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farmer = self.request.user
        order_ids = OrderItem.objects.filter(farmer=farmer).values_list('order_id', flat=True)
        return Order.objects.filter(id__in=order_ids).distinct()


class UpdateOrderStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)
        new_status = request.data.get('status')
        valid = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': f'Invalid status. Choose from {valid}'}, status=400)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)


class AdminOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Order.objects.all().prefetch_related('items')
