from django.urls import path
from . import views

urlpatterns = [
    path('price-suggest/<int:pk>/', views.PriceSuggestionView.as_view(), name='price-suggest'),
    path('demand/<int:pk>/', views.DemandForecastView.as_view(), name='demand-forecast'),
    path('recommendations/', views.RecommendationsView.as_view(), name='recommendations'),
]
