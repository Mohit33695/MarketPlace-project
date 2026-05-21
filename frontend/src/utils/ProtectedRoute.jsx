import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}

export function PublicRoute() {
  const { user } = useAuth()
  if (user) {
    if (user.role === 'farmer') return <Navigate to="/farmer" replace />
    if (user.role === 'buyer') return <Navigate to="/buyer" replace />
    if (user.role === 'admin') return <Navigate to="/admin" replace />
  }
  return <Outlet />
}
