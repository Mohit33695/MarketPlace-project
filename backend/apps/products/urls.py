from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('my/', views.FarmerProductsView.as_view(), name='farmer-products'),
    path('<int:pk>/price-history/', views.ProductPriceHistoryView.as_view(), name='price-history'),
    path('<int:pk>/reviews/', views.ProductReviewView.as_view(), name='product-reviews'),
    path('categories/', views.CategoryListView.as_view(), name='categories'),
]
