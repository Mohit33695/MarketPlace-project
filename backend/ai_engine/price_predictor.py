"""
AI Engine — Price Predictor
Uses historical price data and demand scores to suggest optimal pricing
via Linear Regression (scikit-learn).
"""
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)


def _generate_synthetic_history(base_price: float, n: int = 30):
    """Generate synthetic price history with seasonal variation for cold-start."""
    np.random.seed(42)
    prices = []
    for i in range(n):
        # Seasonal oscillation + random noise
        seasonal = 0.1 * base_price * np.sin(2 * np.pi * i / 30)
        noise = np.random.normal(0, base_price * 0.05)
        prices.append(max(base_price * 0.5, base_price + seasonal + noise))
    return prices


def predict_price(product_id: int, current_price: float) -> dict:
    """
    Predict optimal price for a product based on its price history.
    Returns suggested price, trend direction, and confidence score.
    """
    try:
        from apps.products.models import PriceHistory
        history = list(
            PriceHistory.objects.filter(product_id=product_id)
            .order_by('recorded_at')
            .values_list('price', 'demand_score')
        )

        if len(history) < 5:
            # Cold start — generate synthetic training data
            synthetic_prices = _generate_synthetic_history(current_price)
            prices = synthetic_prices
            demands = [50.0] * len(prices)
        else:
            prices = [float(h[0]) for h in history]
            demands = [float(h[1]) for h in history]

        n = len(prices)
        X = np.array([[i, demands[i]] for i in range(n)])
        y = np.array(prices)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = LinearRegression()
        model.fit(X_scaled, y)

        # Predict next period
        next_X = scaler.transform([[n, np.mean(demands)]])
        predicted = float(model.predict(next_X)[0])
        predicted = max(predicted, current_price * 0.5)  # Floor at 50% of current

        # Trend
        trend = 'up' if predicted > current_price else ('down' if predicted < current_price else 'stable')
        confidence = min(95, max(60, int(model.score(X_scaled, y) * 100)))

        return {
            'suggested_price': round(predicted, 2),
            'current_price': round(current_price, 2),
            'trend': trend,
            'confidence': confidence,
            'data_points': n,
        }

    except Exception as e:
        logger.error(f'Price prediction failed: {e}')
        # Fallback heuristic
        suggested = round(current_price * 1.05, 2)
        return {
            'suggested_price': suggested,
            'current_price': round(current_price, 2),
            'trend': 'stable',
            'confidence': 60,
            'data_points': 0,
        }
