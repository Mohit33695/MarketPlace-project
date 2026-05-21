from rest_framework import serializers
from .models import CartItem, Order, OrderItem
from apps.products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_unit = serializers.CharField(source='product.unit', read_only=True)
    product_image = serializers.SerializerMethodField()
    farmer_name = serializers.CharField(source='product.farmer.full_name', read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'product_unit',
                  'product_image', 'farmer_name', 'quantity', 'subtotal', 'added_at']
        read_only_fields = ['added_at']

    def get_product_image(self, obj):
        request = self.context.get('request')
        if obj.product.image and request:
            return request.build_absolute_uri(obj.product.image.url)
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'farmer', 'quantity',
                  'price_at_purchase', 'unit', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'buyer_name', 'status', 'total_amount',
                  'delivery_address', 'delivery_city', 'delivery_pincode',
                  'notes', 'items', 'item_count', 'created_at', 'updated_at']
        read_only_fields = ['buyer', 'total_amount', 'created_at', 'updated_at']

    def get_item_count(self, obj):
        return obj.items.count()


class PlaceOrderSerializer(serializers.Serializer):
    delivery_address = serializers.CharField()
    delivery_city = serializers.CharField(required=False, allow_blank=True)
    delivery_pincode = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
