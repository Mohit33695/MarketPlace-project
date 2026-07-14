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
 HEAD

   Copyright (c) (2026) Mohit S Gaonkar, Nandan A Divate, Nandan M Chinchali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
=======
This is our project
 3334168 (Readme Update)
---

## 📊 Dashboard Features

The platform provides interactive dashboards for different users.

### Farmer Dashboard

* View total products listed
* Track pending and completed orders
* Monitor monthly sales
* View AI-based price suggestions
* Analyze demand trends

### Buyer Dashboard

* Browse available products
* Manage shopping cart
* Track placed orders
* View recommended products
* Check purchase history

### Admin Dashboard

* Manage users
* Manage products
* View overall marketplace statistics
* Monitor transactions
* Generate reports

---

## 🔒 Security Features

The application implements multiple security mechanisms to ensure safe and reliable access.

* JWT Authentication
* Password Hashing
* Role-Based Access Control
* Protected REST APIs
* Secure User Registration and Login
* Input Validation
* Error Handling

---

## 📈 AI Workflow

The AI engine processes agricultural data through the following steps:

1. Collect historical crop price data.
2. Clean and preprocess the dataset.
3. Train the Machine Learning model.
4. Generate price predictions.
5. Forecast future demand.
6. Recommend similar products to buyers.
7. Display AI insights through the dashboard.

---

## 📦 Database Models

The project consists of the following major database entities:

* User
* Farmer
* Buyer
* Product
* Category
* Cart
* Order
* Order Items
* Analytics
* Recommendations

---

## 📋 Key Functionalities

### Product Management

* Add new products
* Update product information
* Delete products
* Upload product images
* Manage stock quantity

### Order Management

* Add products to cart
* Place orders
* Track order status
* View order history

### Analytics

* Total Revenue
* Total Orders
* Total Products
* Best Selling Products
* Monthly Sales Report

---

## 📚 Machine Learning Libraries

The AI modules are developed using:

* Scikit-learn
* Pandas
* NumPy

These libraries are used for data preprocessing, model training, prediction, and recommendation generation.

---

## 🧪 Testing

The project has been tested for:

* User Authentication
* Product CRUD Operations
* Cart Functionality
* Order Placement
* API Responses
* AI Prediction Modules
* Dashboard Statistics

---

## ⚡ Performance

The application is designed to provide:

* Fast API responses
* Efficient database queries
* Optimized frontend rendering
* Lightweight Machine Learning models
* Responsive user interface

---

## 🌱 Future Scope

The project can be extended with several advanced features:

* Real-time Market Price Integration
* Weather Forecast API
* Payment Gateway Integration
* Crop Disease Detection using Deep Learning
* Voice Assistant for Farmers
* Mobile Application
* SMS and Email Notifications
* GPS-based Farmer Verification
* Multi-language Support
* Blockchain-based Supply Chain Tracking

---

## 🎯 Project Outcomes

After successful implementation, the system is expected to:

* Reduce dependency on intermediaries.
* Improve transparency in agricultural trading.
* Help farmers obtain better market prices.
* Assist buyers in finding quality products.
* Provide intelligent insights using Machine Learning.
* Support data-driven agricultural decision making.

---

## 🤝 Contribution

Contributions, suggestions, and improvements are always welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

Please follow clean coding practices and provide meaningful commit messages.

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

Your support helps improve the project and motivates future development.
