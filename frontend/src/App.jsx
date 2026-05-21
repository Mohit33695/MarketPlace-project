import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './utils/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Farmer Pages
import FarmerDashboard from './pages/farmer/Dashboard'
import FarmerProducts from './pages/farmer/Products'
import FarmerInventory from './pages/farmer/Inventory'
import FarmerOrders from './pages/farmer/Orders'
import FarmerAIPricing from './pages/farmer/AIPricing'

// Buyer Pages
import BuyerHome from './pages/buyer/Home'
import ProductDetail from './pages/buyer/ProductDetail'
import Cart from './pages/buyer/Cart'
import Checkout from './pages/buyer/Checkout'
import BuyerOrders from './pages/buyer/Orders'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminFarmers from './pages/admin/Farmers'
import AdminTransactions from './pages/admin/Transactions'

// Profile
import ProfilePage from './pages/profile/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Farmer */}
          <Route element={<ProtectedRoute roles={['farmer']} />}>
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/farmer/products" element={<FarmerProducts />} />
            <Route path="/farmer/inventory" element={<FarmerInventory />} />
            <Route path="/farmer/orders" element={<FarmerOrders />} />
            <Route path="/farmer/ai-pricing" element={<FarmerAIPricing />} />
          </Route>

          {/* Buyer */}
          <Route element={<ProtectedRoute roles={['buyer']} />}>
            <Route path="/buyer" element={<BuyerHome />} />
            <Route path="/buyer/product/:id" element={<ProductDetail />} />
            <Route path="/buyer/cart" element={<Cart />} />
            <Route path="/buyer/checkout" element={<Checkout />} />
            <Route path="/buyer/orders" element={<BuyerOrders />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/farmers" element={<AdminFarmers />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
          </Route>

          {/* Shared Profile */}
          <Route element={<ProtectedRoute roles={['farmer', 'buyer', 'admin']} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <div className="flex flex-col items-center justify-center h-screen gap-4">
              <h1 className="text-3xl font-bold text-red-400">Access Denied</h1>
              <p className="text-slate-400">You don't have permission to view this page.</p>
            </div>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
