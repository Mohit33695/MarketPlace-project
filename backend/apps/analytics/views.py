from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth, TruncDay
from apps.accounts.models import User
from apps.products.models import Product, Category
from apps.orders.models import Order, OrderItem
import json


class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Revenue by month (last 6 months)
        monthly = (
            Order.objects.filter(status='delivered')
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total_amount'), count=Count('id'))
            .order_by('month')
        )
        monthly_data = [
            {
                'month': m['month'].strftime('%b %Y'),
                'revenue': float(m['revenue'] or 0),
                'orders': m['count'],
            }
            for m in monthly
        ]

        # Top products by order volume
        top_products = (
            OrderItem.objects.values('product_name')
            .annotate(total_qty=Sum('quantity'), total_revenue=Sum('price_at_purchase'))
            .order_by('-total_qty')[:5]
        )

        # Category distribution
        categories = (
            Product.objects.filter(is_active=True)
            .values('category__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Orders by status
        order_status = (
            Order.objects.values('status')
            .annotate(count=Count('id'))
        )

        return Response({
            'monthly_revenue': monthly_data,
            'top_products': list(top_products),
            'category_distribution': list(categories),
            'order_status': list(order_status),
            'summary': {
                'total_farmers': User.objects.filter(role='farmer').count(),
                'total_buyers': User.objects.filter(role='buyer').count(),
                'total_products': Product.objects.filter(is_active=True).count(),
                'total_orders': Order.objects.count(),
                'total_revenue': float(Order.objects.filter(status='delivered').aggregate(
                    total=Sum('total_amount'))['total'] or 0),
                'pending_farmers': User.objects.filter(role='farmer', is_approved=False).count(),
            }
        })


class FarmerAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        farmer = request.user
        farmer_orders = OrderItem.objects.filter(farmer=farmer)

        # Daily sales last 14 days
        daily = (
            farmer_orders
            .annotate(day=TruncDay('order__created_at'))
            .values('day')
            .annotate(sales=Sum('quantity'), revenue=Sum('price_at_purchase'))
            .order_by('day')
        )

        # Top products
        top = (
            farmer_orders
            .values('product_name')
            .annotate(qty=Sum('quantity'), rev=Sum('price_at_purchase'))
            .order_by('-qty')[:5]
        )

        return Response({
            'daily_sales': [
                {'day': d['day'].strftime('%d %b'), 'sales': d['sales'],
                 'revenue': float(d['revenue'] or 0)}
                for d in daily
            ],
            'top_products': list(top),
            'total_revenue': float(farmer_orders.aggregate(
                total=Sum('price_at_purchase'))['total'] or 0),
            'total_orders': farmer_orders.values('order').distinct().count(),
            'active_products': Product.objects.filter(farmer=farmer, is_active=True).count(),
        })
