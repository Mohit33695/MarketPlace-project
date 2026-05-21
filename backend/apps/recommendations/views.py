from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from ai_engine.price_predictor import predict_price
from ai_engine.demand_forecaster import forecast_demand
from ai_engine.recommender import get_recommendations


class PriceSuggestionView(APIView):
    """GET /api/ai/price-suggest/<product_id>/ — AI price suggestion for a product."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        if request.user.role == 'farmer' and product.farmer != request.user:
            return Response({'error': 'You can only get price suggestions for your own products.'}, status=403)

        result = predict_price(pk, float(product.price))

        # Update ai_suggested_price on product
        product.ai_suggested_price = result['suggested_price']
        product.save(update_fields=['ai_suggested_price'])

        return Response(result)


class DemandForecastView(APIView):
    """GET /api/ai/demand/<product_id>/ — Demand forecast for next 7 days."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        days = int(request.query_params.get('days', 7))
        days = min(max(days, 3), 30)  # Clamp between 3 and 30

        result = forecast_demand(pk, days)
        result['product_name'] = product.name
        return Response(result)


class RecommendationsView(APIView):
    """GET /api/ai/recommendations/ — Personalized product recommendations for buyer."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ('buyer', 'admin'):
            return Response({'error': 'Only buyers can get recommendations.'}, status=403)

        limit = int(request.query_params.get('limit', 6))
        product_ids = get_recommendations(request.user.id, limit=limit)

        products = Product.objects.filter(id__in=product_ids, is_active=True)
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response({'recommendations': serializer.data, 'count': len(serializer.data)})
