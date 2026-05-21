from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg
from .models import Product, Category, PriceHistory, ProductReview
from .serializers import ProductSerializer, CategorySerializer, PriceHistorySerializer, ProductReviewSerializer


class IsFarmerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'farmer'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.farmer == request.user


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsFarmerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_organic', 'farmer']
    search_fields = ['name', 'description', 'farmer__first_name']
    ordering_fields = ['price', 'created_at', 'name']

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('farmer', 'category')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsFarmerPermission()]
        return [permissions.AllowAny()]


class IsFarmerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'farmer' and request.user.is_approved


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsFarmerOrReadOnly]

    def get_queryset(self):
        return Product.objects.select_related('farmer', 'category')


class FarmerProductsView(generics.ListAPIView):
    """Products belonging to the logged-in farmer."""
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(farmer=self.request.user).select_related('category')


class ProductPriceHistoryView(generics.ListAPIView):
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        product_id = self.kwargs['pk']
        return PriceHistory.objects.filter(product_id=product_id)[:30]


class ProductReviewView(generics.ListCreateAPIView):
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return ProductReview.objects.filter(product_id=self.kwargs['pk'])

    def perform_create(self, serializer):
        product = Product.objects.get(pk=self.kwargs['pk'])
        serializer.save(buyer=self.request.user, product=product)
