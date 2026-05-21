from django.urls import path
from . import views

urlpatterns = [
    path('admin/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('farmer/', views.FarmerAnalyticsView.as_view(), name='farmer-analytics'),
]
