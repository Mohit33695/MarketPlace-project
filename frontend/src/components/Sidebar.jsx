import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import api from '../api/axios'
import {
  LayoutDashboard, Package, Warehouse, ShoppingBag, Brain,
  Home, ShoppingCart, ClipboardList, Users, UserCheck,
  BarChart3, LogOut, Leaf, ChevronRight, UserCircle, Settings
} from 'lucide-react'

const NAV = {
  farmer: [
    { to: '/farmer',            icon: LayoutDashboard, label: 'Dashboard',   end: true },
    { to: '/farmer/products',   icon: Package,         label: 'My Products' },
    { to: '/farmer/inventory',  icon: Warehouse,       label: 'Inventory' },
    { to: '/farmer/orders',     icon: ShoppingBag,     label: 'Orders' },
    { to: '/farmer/ai-pricing', icon: Brain,           label: 'AI Pricing',  ai: true },
  ],
  buyer: [
    { to: '/buyer',       icon: Home,          label: 'Marketplace', end: true },
    { to: '/buyer/cart',  icon: ShoppingCart,  label: 'My Cart',     badge: true },
    { to: '/buyer/orders',icon: ClipboardList, label: 'My Orders' },
  ],
  admin: [
    { to: '/admin',                icon: LayoutDashboard, label: 'Dashboard',    end: true },
    { to: '/admin/users',          icon: Users,           label: 'Users' },
    { to: '/admin/farmers',        icon: UserCheck,       label: 'Farmers' },
    { to: '/admin/transactions',   icon: BarChart3,       label: 'Transactions' },
  ],
}

const ROLE_THEME = {
  farmer: { color: '#10B981', gradient: 'linear-gradient(135deg,#10B981,#059669)', label: 'Farmer Portal', glow: 'rgba(16,185,129,0.35)' },
  buyer:  { color: '#3B82F6', gradient: 'linear-gradient(135deg,#3B82F6,#2563EB)', label: 'Marketplace',   glow: 'rgba(59,130,246,0.35)' },
  admin:  { color: '#8B5CF6', gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', label: 'Admin Panel',   glow: 'rgba(139,92,246,0.35)' },
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (user?.role === 'buyer') {
      api.get('/orders/cart/').then(r => setCartCount(r.data.count || 0)).catch(() => {})
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out. See you soon! 👋')
    navigate('/login')
  }

  const links  = NAV[user?.role] || []
  const theme  = ROLE_THEME[user?.role] || ROLE_THEME.farmer
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '14px',
            background: theme.gradient,
            boxShadow: `0 6px 18px ${theme.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Leaf size={20} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '17px', color: '#EEF2FF' }}>
                AgriMarket
              </span>
              <span style={{
                fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px',
                background: 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(59,130,246,0.25))',
                color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.3)', letterSpacing: '0.05em'
              }}>AI</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{theme.label}</p>
          </div>
        </div>
      </div>

      {/* ── User card ─────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <NavLink to="/profile"
          style={{
            display: 'flex', alignItems: 'center', gap: '11px',
            padding: '10px 12px', borderRadius: '16px',
            background: `${theme.color}0D`,
            border: `1px solid ${theme.color}18`,
            textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${theme.color}18`; e.currentTarget.style.borderColor = `${theme.color}30`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${theme.color}0D`; e.currentTarget.style.borderColor = `${theme.color}18`; }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '12px',
            background: theme.gradient,
            boxShadow: `0 4px 12px ${theme.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#EEF2FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <Settings size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </NavLink>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <p style={{ padding: '0 20px', marginBottom: '8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Navigation
        </p>

        {links.map(({ to, icon: Icon, label, end, badge, ai }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Icon size={17} />
              {badge && cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  minWidth: '16px', height: '16px', borderRadius: '99px',
                  background: theme.gradient,
                  color: '#fff', fontSize: '10px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', boxShadow: `0 2px 8px ${theme.glow}`,
                }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span style={{ flex: 1 }}>{label}</span>
            {ai && (
              <span style={{
                fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '6px',
                background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.2))',
                color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.25)',
              }}>AI</span>
            )}
            {badge && cartCount > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px',
                background: theme.gradient, color: '#fff',
              }}>
                {cartCount}
              </span>
            )}
            {!ai && !badge && <ChevronRight size={13} style={{ opacity: 0.35, flexShrink: 0 }} />}
          </NavLink>
        ))}

        {/* Profile link */}
        <div style={{ margin: '12px 10px 0', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <UserCircle size={17} />
            <span style={{ flex: 1 }}>My Profile</span>
            <ChevronRight size={13} style={{ opacity: 0.35 }} />
          </NavLink>
        </div>
      </nav>

      {/* ── Logout ────────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Role indicator pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
          borderRadius: '12px', marginBottom: '8px',
          background: `${theme.color}08`, border: `1px solid ${theme.color}14`,
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.color, boxShadow: `0 0 8px ${theme.color}` }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: theme.color, textTransform: 'capitalize' }}>
            {user?.role}
          </span>
          {user?.is_approved && (
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>✓ Verified</span>
          )}
        </div>

        <button onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-sec)',
            fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#FCA5A5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-sec)'; }}>
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
