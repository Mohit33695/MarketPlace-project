from django.db import models
from apps.accounts.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, default='🌾')
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('quintal', 'Quintal'),
        ('ton', 'Ton'),
        ('piece', 'Piece'),
        ('dozen', 'Dozen'),
        ('liter', 'Liter'),
        ('bundle', 'Bundle'),
    ]

    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products',
                                limit_choices_to={'role': 'farmer'})
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    ai_suggested_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='kg')
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_organic = models.BooleanField(default=False)
    harvest_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.farmer.email}'


class PriceHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='price_history')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    demand_score = models.FloatField(default=0.0)  # 0-100 scale
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'price_history'
        ordering = ['-recorded_at']

    def __str__(self):
        return f'{self.product.name} - ₹{self.price} at {self.recorded_at}'


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'buyer'})
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'product_reviews'
        unique_together = ['product', 'buyer']

    def __str__(self):
        return f'Review by {self.buyer.email} on {self.product.name}'
