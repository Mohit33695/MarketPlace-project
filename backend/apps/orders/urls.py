from django.urls import path
from . import views

urlpatterns = [
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/add/', views.CartAddView.as_view(), name='cart-add'),
    path('cart/<int:pk>/', views.CartUpdateView.as_view(), name='cart-update'),
    path('cart/clear/', views.CartClearView.as_view(), name='cart-clear'),
    path('place/', views.PlaceOrderView.as_view(), name='place-order'),
    path('', views.BuyerOrdersView.as_view(), name='buyer-orders'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/status/', views.UpdateOrderStatusView.as_view(), name='update-order-status'),
    path('farmer/', views.FarmerOrdersView.as_view(), name='farmer-orders'),
    path('admin/all/', views.AdminOrdersView.as_view(), name='admin-orders'),
]
