"""
AI Engine — Product Recommender
Content-based filtering using cosine similarity on product features
(category, price range, organic flag) + purchase history collaborative signals.
"""
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)


def _build_feature_vector(product) -> list:
    """Encode product into a numeric feature vector."""
    price_normalized = min(float(product.price) / 1000.0, 1.0)
    is_organic = 1.0 if product.is_organic else 0.0
    category_id = (product.category_id or 0) / 20.0  # Normalize
    quantity_score = min(product.quantity / 500.0, 1.0)
    avg_rating = 0.0
    if product.reviews.exists():
        avg_rating = product.reviews.aggregate(avg=__import__('django.db.models', fromlist=['Avg']).Avg('rating'))['avg'] or 0.0
    rating_normalized = avg_rating / 5.0
    return [price_normalized, is_organic, category_id, quantity_score, rating_normalized]


def get_recommendations(buyer_id: int, limit: int = 6) -> list:
    """
    Returns recommended product IDs for a buyer.
    Strategy:
    1. If buyer has order history → collaborative: find similar products to purchased ones
    2. Fallback → content-based: return top-rated products in popular categories
    """
    try:
        from apps.products.models import Product
        from apps.orders.models import OrderItem

        all_products = list(Product.objects.filter(is_active=True, quantity__gt=0)
                            .prefetch_related('reviews').select_related('category'))

        if not all_products:
            return []

        # Get buyer's purchased product IDs
        purchased_ids = set(
            OrderItem.objects.filter(farmer__isnull=False)
            .filter(order__buyer_id=buyer_id)
            .values_list('product_id', flat=True)
        )

        # Build feature matrix
        product_ids = [p.id for p in all_products]
        feature_matrix = np.array([_build_feature_vector(p) for p in all_products])

        if purchased_ids:
            # Collaborative: average feature vector of purchased products
            purchased_indices = [i for i, pid in enumerate(product_ids) if pid in purchased_ids]
            if purchased_indices:
                purchased_vectors = feature_matrix[purchased_indices]
                avg_vector = np.mean(purchased_vectors, axis=0).reshape(1, -1)
                similarities = cosine_similarity(avg_vector, feature_matrix)[0]

                # Exclude already purchased
                for i, pid in enumerate(product_ids):
                    if pid in purchased_ids:
                        similarities[i] = -1

                top_indices = np.argsort(similarities)[::-1][:limit]
                return [product_ids[i] for i in top_indices if similarities[i] > 0]

        # Fallback: top-rated products
        sorted_products = sorted(all_products, key=lambda p: (
            p.reviews.aggregate(avg=__import__('django.db.models', fromlist=['Avg']).Avg('rating'))['avg'] or 0,
            p.quantity
        ), reverse=True)
        return [p.id for p in sorted_products[:limit]]

    except Exception as e:
        logger.error(f'Recommendation failed: {e}')
        return []
