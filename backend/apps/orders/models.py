from django.db import models
from apps.accounts.models import User
from apps.products.models import Product


class CartItem(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items',
                               limit_choices_to={'role': 'buyer'})
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cart_items'
        unique_together = ['buyer', 'product']

    def __str__(self):
        return f'{self.buyer.email} → {self.product.name} x{self.quantity}'

    @property
    def subtotal(self):
        return self.product.price * self.quantity


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders',
                               limit_choices_to={'role': 'buyer'})
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_address = models.TextField()
    delivery_city = models.CharField(max_length=100, blank=True)
    delivery_pincode = models.CharField(max_length=10, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.id} by {self.buyer.email}'

    def calculate_total(self):
        self.total_amount = sum(item.subtotal for item in self.items.all())
        self.save()


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)  # Snapshot at time of order
    farmer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
                                limit_choices_to={'role': 'farmer'})
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='kg')

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f'{self.product_name} x{self.quantity}'

    @property
    def subtotal(self):
        return self.price_at_purchase * self.quantity
