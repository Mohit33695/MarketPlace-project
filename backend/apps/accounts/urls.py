from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('admin/users/', views.AdminUsersView.as_view(), name='admin-users'),
    path('admin/farmers/<int:pk>/approve/', views.ApproveFarmerView.as_view(), name='approve-farmer'),
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),
]
