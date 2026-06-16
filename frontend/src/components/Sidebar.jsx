import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import api from '../api/axios'
import {
  LayoutDashboard, Package, Warehouse, ShoppingBag, Brain,
  Home, ShoppingCart, ClipboardList, Users, UserCheck,
  BarChart3, LogOut, Leaf, ChevronRight, UserCircle, Settings
} from 'lucide-react'

const NAV = {
  farmer: [
    { to: '/farmer',            icon: LayoutDashboard, label: 'dashboard',   end: true },
    { to: '/farmer/products',   icon: Package,         label: 'myProducts' },
    { to: '/farmer/inventory',  icon: Warehouse,       label: 'inventory' },
    { to: '/farmer/orders',     icon: ShoppingBag,     label: 'orders' },
    { to: '/farmer/ai-pricing', icon: Brain,           label: 'aiPricing',  ai: true },
  ],
  buyer: [
    { to: '/buyer',        icon: Home,          label: 'Marketplace', end: true },
    { to: '/buyer/cart',   icon: ShoppingCart,  label: 'My Cart',     badge: true },
    { to: '/buyer/orders', icon: ClipboardList, label: 'My Orders' },
  ],
  admin: [
    { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
    { to: '/admin/users',        icon: Users,           label: 'Users' },
    { to: '/admin/farmers',      icon: UserCheck,       label: 'Farmers' },
    { to: '/admin/transactions', icon: BarChart3,       label: 'Transactions' },
  ],
}

const ROLE_THEME = {
  farmer: { color: '#10B981', gradient: 'linear-gradient(135deg,#10B981,#059669)', label: 'Farmer Portal', glow: 'rgba(16,185,129,0.3)' },
  buyer:  { color: '#F59E0B', gradient: 'linear-gradient(135deg,#F59E0B,#D97706)', label: 'Marketplace',   glow: 'rgba(245,158,11,0.3)' },
  admin:  { color: '#34D399', gradient: 'linear-gradient(135deg,#34D399,#10B981)', label: 'Admin Panel',   glow: 'rgba(52,211,153,0.3)' },
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
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

  const links   = NAV[user?.role] || []
  const theme   = ROLE_THEME[user?.role] || ROLE_THEME.farmer
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`

  return (
    <aside className="sidebar">

      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: theme.gradient,
            boxShadow: `0 4px 14px ${theme.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Leaf size={18} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '16px', color: '#EEF2FF', letterSpacing: '-0.01em' }}>
                AgriMarket
              </span>
              <span style={{
                fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '5px',
                background: 'linear-gradient(135deg,rgba(139,92,246,0.22),rgba(59,130,246,0.22))',
                color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.28)', letterSpacing: '0.04em',
              }}>AI</span>
            </div>
            <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '1px', fontWeight: 500 }}>{theme.label}</p>
          </div>
        </div>
      </div>

      {/* ── User card ─────────────────────────────────────────────── */}
      <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid var(--border)' }}>
        <NavLink to="/profile"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 11px', borderRadius: '13px',
            background: `${theme.color}0C`,
            border: `1px solid ${theme.color}18`,
            textDecoration: 'none', transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${theme.color}16`; e.currentTarget.style.borderColor = `${theme.color}28`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${theme.color}0C`; e.currentTarget.style.borderColor = `${theme.color}18`; }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: theme.gradient,
            boxShadow: `0 3px 10px ${theme.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#EEF2FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
              {user?.email}
            </p>
          </div>
          <Settings size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.7 }} />
        </NavLink>
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
        <p style={{ padding: '0 18px', marginBottom: '6px', fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>
          Menu
        </p>

        {links.map(({ to, icon: Icon, label, end, badge, ai }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Icon size={16} />
              {badge && cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-7px', right: '-7px',
                  minWidth: '15px', height: '15px', borderRadius: '99px',
                  background: theme.gradient,
                  color: '#fff', fontSize: '9px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px', boxShadow: `0 2px 6px ${theme.glow}`,
                }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span style={{ flex: 1 }}>{t(label)}</span>
            {ai && (
              <span style={{
                fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '5px',
                background: 'linear-gradient(135deg,rgba(139,92,246,0.18),rgba(59,130,246,0.18))',
                color: '#C4B5FD', border: '1px solid rgba(139,92,246,0.22)',
              }}>AI</span>
            )}
            {badge && cartCount > 0 && (
              <span style={{
                fontSize: '11px', fontWeight: 800, padding: '1px 7px', borderRadius: '99px',
                background: theme.gradient, color: '#fff',
              }}>
                {cartCount}
              </span>
            )}
            {!ai && !badge && <ChevronRight size={12} style={{ opacity: 0.28, flexShrink: 0 }} />}
          </NavLink>
        ))}

        {/* Profile link */}
        <div style={{ margin: '10px 8px 0', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <UserCircle size={17} />
            <span style={{ flex: 1 }}>{t('myProfile')}</span>
            <ChevronRight size={13} style={{ opacity: 0.35 }} />
          </NavLink>
        </div>
      </nav>

      {/* ── Footer / Logout ────────────────────────────────────────── */}
      <div style={{ padding: '10px 12px 18px', borderTop: '1px solid var(--border)' }}>
        {/* Role pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 11px', borderRadius: '10px', marginBottom: '6px',
          background: `${theme.color}08`, border: `1px solid ${theme.color}12`,
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.color, flexShrink: 0,
            boxShadow: `0 0 6px ${theme.color}` }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: theme.color, textTransform: 'capitalize' }}>
            {user?.role}
          </span>
          {user?.is_approved && (
            <span style={{ marginLeft: 'auto', fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>✓ Verified</span>
          )}
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <LanguageSwitcher />
        </div>

        <button onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
            padding: '9px 13px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--text-muted)',
            fontSize: '13.5px', fontWeight: 600, transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#FCA5A5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-sec)'; }}>
          <LogOut size={17} />
          {t('signOut')}
        </button>
      </div>
    </aside>
  )
}
