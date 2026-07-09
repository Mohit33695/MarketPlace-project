# AgriMarket AI — Smart Agricultural Marketplace

A full-stack AI-powered agricultural marketplace connecting farmers directly with buyers.

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS v4 (Vite) |
| Backend | Django REST Framework |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (djangorestframework-simplejwt) |
| AI | scikit-learn, pandas, numpy |
| Charts | Recharts |

## 📁 Folder Structure

```
farmer/
├── frontend/          # React + Tailwind (Vite)
└── backend/           # Django REST Framework
    ├── agrimarket/    # Project settings
    ├── apps/
    │   ├── accounts/      # Auth, User, Farmer, Buyer
    │   ├── products/      # Products, Categories
    │   ├── orders/        # Cart, Orders
    │   ├── analytics/     # Dashboard analytics
    │   └── recommendations/  # AI endpoints
    ├── ai_engine/     # ML models
    │   ├── price_predictor.py
    │   ├── demand_forecaster.py
    │   └── recommender.py
    └── seed.py        # Demo data seed
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations accounts products orders analytics recommendations
python manage.py migrate

# Seed demo data
python seed.py

# Start server
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🌾 Farmer | farmer@demo.com | demo1234 |
| 🛒 Buyer | buyer@demo.com | demo1234 |
| ⚙️ Admin | admin@demo.com | demo1234 |

## 🤖 AI Features

1. **Price Prediction** — Linear Regression on historical price + demand data
2. **Demand Forecasting** — 7-day rolling forecast with Indian seasonal factors  
3. **Product Recommendations** — Cosine similarity content-based filtering

## 🌐 API Endpoints

```
POST /api/auth/register/
POST /api/auth/login/
GET  /api/products/
POST /api/orders/cart/add/
POST /api/orders/place/
GET  /api/ai/price-suggest/<id>/
GET  /api/ai/demand/<id>/
GET  /api/ai/recommendations/
GET  /api/analytics/admin/
```

## 🗄 PostgreSQL Setup (Production)

1. Create a PostgreSQL database named `agrimarket`
2. Create `.env` in `backend/`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/agrimarket
   SECRET_KEY=your-secret-key
   DEBUG=False
   ```
3. Uncomment the `dj_database_url` block in `settings.py`
This is our project