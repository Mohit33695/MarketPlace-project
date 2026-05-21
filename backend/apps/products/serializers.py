from rest_framework import serializers
from .models import Product, Category, PriceHistory, ProductReview
from apps.accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description']


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = ['price', 'demand_score', 'recorded_at']


class ProductReviewSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'buyer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['buyer_name', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    farmer_farm = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'farmer', 'farmer_name', 'farmer_farm', 'category', 'category_name',
                  'name', 'description', 'price', 'ai_suggested_price', 'quantity', 'unit',
                  'image', 'image_url', 'is_active', 'is_organic', 'harvest_date',
                  'average_rating', 'review_count', 'created_at', 'updated_at']
        read_only_fields = ['farmer', 'ai_suggested_price', 'created_at', 'updated_at']

    def get_farmer_farm(self, obj):
        if hasattr(obj.farmer, 'farmer_profile'):
            return obj.farmer.farmer_profile.farm_name
        return ''

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def create(self, validated_data):
        validated_data['farmer'] = self.context['request'].user
        product = super().create(validated_data)
        # Record initial price history
        PriceHistory.objects.create(product=product, price=product.price)
        return product

    def update(self, instance, validated_data):
        old_price = instance.price
        product = super().update(instance, validated_data)
        # Record price change
        if product.price != old_price:
            PriceHistory.objects.create(product=product, price=product.price)
        return product
