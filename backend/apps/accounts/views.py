from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from .models import User, FarmerProfile, BuyerProfile
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, TokenResponseSerializer


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = TokenResponseSerializer.get_tokens(user)
            message = 'Registration successful!'
            if user.role == 'farmer':
                message = 'Registration successful! Your account is pending admin approval.'
            return Response({
                'message': message,
                **tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = TokenResponseSerializer.get_tokens(user)
            return Response(tokens, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Update nested profile
        if instance.role == 'farmer' and hasattr(instance, 'farmer_profile'):
            farmer_data = {k: v for k, v in request.data.items()
                          if k in ['farm_name', 'location', 'state', 'phone', 'bio']}
            if farmer_data:
                for attr, value in farmer_data.items():
                    setattr(instance.farmer_profile, attr, value)
                instance.farmer_profile.save()
        elif instance.role == 'buyer' and hasattr(instance, 'buyer_profile'):
            buyer_data = {k: v for k, v in request.data.items()
                         if k in ['phone', 'address', 'city', 'state', 'pincode']}
            if buyer_data:
                for attr, value in buyer_data.items():
                    setattr(instance.buyer_profile, attr, value)
                instance.buyer_profile.save()

        return Response(UserSerializer(instance).data)


# Admin-only views
class AdminUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        qs = User.objects.all().order_by('-date_joined')
        if role:
            qs = qs.filter(role=role)
        return qs


class ApproveFarmerView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk, role='farmer')
        except User.DoesNotExist:
            return Response({'error': 'Farmer not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')  # 'approve' or 'reject'
        if action == 'approve':
            user.is_approved = True
            if hasattr(user, 'farmer_profile'):
                user.farmer_profile.is_verified = True
                user.farmer_profile.save()
            user.save()
            return Response({'message': f'Farmer {user.email} approved.'})
        elif action == 'reject':
            user.is_approved = False
            user.save()
            return Response({'message': f'Farmer {user.email} rejected.'})
        return Response({'error': 'Invalid action. Use "approve" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from apps.products.models import Product
        from apps.orders.models import Order
        total_farmers = User.objects.filter(role='farmer').count()
        pending_farmers = User.objects.filter(role='farmer', is_approved=False).count()
        total_buyers = User.objects.filter(role='buyer').count()
        total_products = Product.objects.filter(is_active=True).count()
        total_orders = Order.objects.count()
        total_revenue = sum(o.total_amount for o in Order.objects.filter(status='delivered'))
        return Response({
            'total_farmers': total_farmers,
            'pending_farmers': pending_farmers,
            'total_buyers': total_buyers,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
        })
