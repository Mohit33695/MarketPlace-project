"""
AI Engine — Demand Forecaster
Forecasts next 7-day demand for a product using rolling averages
and trend analysis on historical demand scores.
"""
import numpy as np
import logging

logger = logging.getLogger(__name__)


def _seasonal_factor(day_of_year: int) -> float:
    """Returns a seasonal multiplier based on Indian agricultural seasons."""
    # Rabi (Oct–Mar) and Kharif (Jun–Sep) peaks
    if 150 <= day_of_year <= 240:   # Kharif harvest
        return 1.15
    elif 270 <= day_of_year <= 360:  # Rabi harvest
        return 1.20
    return 1.0


def forecast_demand(product_id: int, days: int = 7) -> dict:
    """
    Forecast demand for the next `days` days.
    Returns list of {date, demand_score} forecasts.
    """
    from datetime import datetime, timedelta

    try:
        from apps.products.models import PriceHistory
        history = list(
            PriceHistory.objects.filter(product_id=product_id)
            .order_by('recorded_at')
            .values_list('demand_score', 'recorded_at')
        )

        if len(history) < 3:
            # Cold start — use synthetic demand
            base = 60.0
            demands = [base + 5 * np.sin(2 * np.pi * i / 14) for i in range(14)]
        else:
            demands = [float(h[0]) for h in history[-30:]]

        # Rolling 7-day average
        window = min(7, len(demands))
        rolling_avg = float(np.mean(demands[-window:]))

        # Simple linear trend
        if len(demands) >= 2:
            trend_per_day = (demands[-1] - demands[0]) / len(demands)
        else:
            trend_per_day = 0.0

        today = datetime.now()
        forecast = []
        for d in range(1, days + 1):
            date = today + timedelta(days=d)
            seasonal = _seasonal_factor(date.timetuple().tm_yday)
            score = rolling_avg + trend_per_day * d
            score = round(min(100, max(0, score * seasonal)), 1)
            forecast.append({
                'date': date.strftime('%Y-%m-%d'),
                'demand_score': score,
                'day': date.strftime('%a'),
            })

        overall = round(float(np.mean([f['demand_score'] for f in forecast])), 1)
        level = 'High' if overall >= 70 else ('Medium' if overall >= 40 else 'Low')

        return {
            'forecast': forecast,
            'average_demand': overall,
            'demand_level': level,
            'trend': 'increasing' if trend_per_day > 0 else ('decreasing' if trend_per_day < 0 else 'stable'),
        }

    except Exception as e:
        logger.error(f'Demand forecast failed: {e}')
        today = datetime.now()
        from datetime import timedelta
        return {
            'forecast': [
                {'date': (today + timedelta(days=d)).strftime('%Y-%m-%d'),
                 'demand_score': 60.0,
                 'day': (today + timedelta(days=d)).strftime('%a')}
                for d in range(1, days + 1)
            ],
            'average_demand': 60.0,
            'demand_level': 'Medium',
            'trend': 'stable',
        }
