#!/usr/bin/env python3
"""
Seed script — Creates demo users, categories, and products with real product images.
Run after migrations: python seed.py
"""
import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrimarket.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.conf import settings
from apps.accounts.models import User, FarmerProfile, BuyerProfile
from apps.products.models import Category, Product, PriceHistory

print('[*] Seeding database...')

# ── Categories ──────────────────────────────────────────────────────────────────
categories_data = [
    {'name': 'Vegetables', 'slug': 'vegetables', 'icon': '🥦'},
    {'name': 'Fruits', 'slug': 'fruits', 'icon': '🍎'},
    {'name': 'Grains & Cereals', 'slug': 'grains', 'icon': '🌾'},
    {'name': 'Spices & Herbs', 'slug': 'spices', 'icon': '🌶️'},
    {'name': 'Dairy', 'slug': 'dairy', 'icon': '🥛'},
    {'name': 'Pulses', 'slug': 'pulses', 'icon': '🫘'},
]
cats = {}
for c in categories_data:
    obj, _ = Category.objects.get_or_create(slug=c['slug'], defaults=c)
    cats[c['slug']] = obj
print(f'  [OK] {len(cats)} categories')

# ── Users ───────────────────────────────────────────────────────────────────────
# Admin
admin, _ = User.objects.get_or_create(email='admin@demo.com', defaults={
    'first_name': 'Admin', 'last_name': 'User', 'role': 'admin',
    'is_staff': True, 'is_superuser': True, 'is_approved': True
})
if _: admin.set_password('demo1234'); admin.save()

# Farmer
farmer, created = User.objects.get_or_create(email='farmer@demo.com', defaults={
    'first_name': 'Ramesh', 'last_name': 'Patel', 'role': 'farmer', 'is_approved': True
})
if created:
    farmer.set_password('demo1234'); farmer.save()
    FarmerProfile.objects.create(user=farmer, farm_name='Green Valley Farm',
                                  location='Nashik, Maharashtra', phone='9876543210', is_verified=True)
elif not hasattr(farmer, 'farmer_profile'):
    FarmerProfile.objects.get_or_create(user=farmer, defaults={
        'farm_name': 'Green Valley Farm', 'location': 'Nashik, Maharashtra',
        'phone': '9876543210', 'is_verified': True
    })

# Buyer
buyer, created = User.objects.get_or_create(email='buyer@demo.com', defaults={
    'first_name': 'Priya', 'last_name': 'Sharma', 'role': 'buyer', 'is_approved': True
})
if created:
    buyer.set_password('demo1234'); buyer.save()
    BuyerProfile.objects.create(user=buyer, phone='9123456789', city='Mumbai', pincode='400001')
elif not hasattr(buyer, 'buyer_profile'):
    BuyerProfile.objects.get_or_create(user=buyer, defaults={
        'phone': '9123456789', 'city': 'Mumbai', 'pincode': '400001'
    })

print('  [OK] 3 demo users (admin, farmer, buyer) - password: demo1234')

# ── Image Downloader Helper ─────────────────────────────────────────────────────
def download_image(url, filename):
    import urllib.request
    media_path = os.path.join(settings.MEDIA_ROOT, 'products')
    os.makedirs(media_path, exist_ok=True)
    full_path = os.path.join(media_path, filename)
    if not os.path.exists(full_path):
        try:
            print(f"    Downloading {filename}...")
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            )
            with urllib.request.urlopen(req) as response:
                with open(full_path, 'wb') as f:
                    f.write(response.read())
            print(f"    [OK] Downloaded {filename}")
        except Exception as e:
            print(f"    [ERR] Failed to download {filename}: {e}")
            return None
    return f"products/{filename}"

# ── Products ────────────────────────────────────────────────────────────────────
products_data = [
    {
        'name': 'Fresh Tomatoes', 
        'category': 'vegetables', 
        'price': 35, 
        'quantity': 200, 
        'unit': 'kg', 
        'is_organic': False, 
        'description': 'Farm-fresh red tomatoes, perfect for cooking.',
        'img_url': 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
        'img_file': 'tomatoes.jpg'
    },
    {
        'name': 'Organic Spinach', 
        'category': 'vegetables', 
        'price': 55, 
        'quantity': 80, 
        'unit': 'kg', 
        'is_organic': True, 
        'description': 'Pesticide-free organic spinach, rich in iron.',
        'img_url': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
        'img_file': 'spinach.jpg'
    },
    {
        'name': 'Alphonso Mangoes', 
        'category': 'fruits', 
        'price': 420, 
        'quantity': 50, 
        'unit': 'dozen', 
        'is_organic': False, 
        'description': 'Premium Alphonso mangoes from Ratnagiri.',
        'img_url': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
        'img_file': 'mangoes.jpg'
    },
    {
        'name': 'Basmati Rice', 
        'category': 'grains', 
        'price': 85, 
        'quantity': 500, 
        'unit': 'kg', 
        'is_organic': False, 
        'description': 'Long-grain aromatic Basmati rice.',
        'img_url': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        'img_file': 'rice.jpg'
    },
    {
        'name': 'Turmeric Powder', 
        'category': 'spices', 
        'price': 180, 
        'quantity': 30, 
        'unit': 'kg', 
        'is_organic': True, 
        'description': 'Pure organic turmeric with high curcumin content.',
        'img_url': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
        'img_file': 'turmeric.jpg'
    },
    {
        'name': 'Toor Dal', 
        'category': 'pulses', 
        'price': 120, 
        'quantity': 150, 
        'unit': 'kg', 
        'is_organic': False, 
        'description': 'Premium quality Toor dal (split pigeon peas).',
        'img_url': 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80',
        'img_file': 'toor_dal.jpg'
    },
    {
        'name': 'Fresh Carrots', 
        'category': 'vegetables', 
        'price': 40, 
        'quantity': 120, 
        'unit': 'kg', 
        'is_organic': False, 
        'description': 'Crunchy fresh carrots from the farm.',
        'img_url': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
        'img_file': 'carrots.jpg'
    },
    {
        'name': 'Organic Bananas', 
        'category': 'fruits', 
        'price': 60, 
        'quantity': 100, 
        'unit': 'dozen', 
        'is_organic': True, 
        'description': 'Organic bananas, naturally ripened.',
        'img_url': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
        'img_file': 'bananas.jpg'
    },
]

for pd in products_data:
    cat = cats.get(pd.pop('category'))
    img_url = pd.pop('img_url')
    img_file = pd.pop('img_file')
    
    # Download the image
    img_path = download_image(img_url, img_file)
    
    p, created = Product.objects.get_or_create(
        name=pd['name'], farmer=farmer,
        defaults={**pd, 'category': cat}
    )
    
    # Always ensure the image field is filled
    if img_path:
        p.image = img_path
        p.save()
        
    if created:
        # Add some price history for AI training
        import random
        for i in range(10):
            PriceHistory.objects.create(
                product=p,
                price=p.price * (0.9 + random.random() * 0.2),
                recorded_at=django.utils.timezone.now() if hasattr(django.utils, 'timezone') else django.utils.timezone.now(),
                demand_score=random.uniform(40, 85),
            )

print(f'  [OK] {len(products_data)} products seeded/updated with real photos')
print('')
print('[DONE] Seed complete!')
