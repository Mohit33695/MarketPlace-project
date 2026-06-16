import { Bell, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NavLink } from 'react-router-dom'

const ROLE_THEME = {
  farmer: { color: '#10B981', gradient: 'linear-gradient(135deg,#10B981,#059669)' },
  buyer:  { color: '#F59E0B', gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  admin:  { color: '#34D399', gradient: 'linear-gradient(135deg,#34D399,#10B981)' },
}

/**
 * Persistent top header bar. Accepts:
 *  - title: string — main page name shown as breadcrumb leaf
 *  - subtitle: string (optional) — secondary label
 *  - actions: ReactNode (optional) — right-side action buttons
 */
export default function Header({ title, subtitle, actions }) {
  const { user } = useAuth()
  const theme = ROLE_THEME[user?.role] || ROLE_THEME.farmer
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`

  return (
    <header className="topbar">

      {/* ── Left: breadcrumb / title ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div>
          {subtitle && (
            <p style={{
              fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1,
              marginBottom: '3px',
            }}>
              {subtitle}
            </p>
          )}
          <h1 className="page-title" style={{ fontSize: '18px' }}>{title}</h1>
        </div>
      </div>

      {/* ── Center: optional actions ── */}
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {actions}
        </div>
      )}

      {/* ── Right: utility icons + avatar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        {/* Notification bell */}
        <button
          style={{
            width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.18s', color: 'var(--text-muted)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Bell size={15} />
        </button>

        {/* Thin separator */}
        <div style={{ width: '1px', height: '28px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Avatar + name */}
        <NavLink to="/profile"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
            padding: '5px 10px 5px 6px', borderRadius: 'var(--radius-md)',
            transition: 'background 0.18s', border: '1px solid transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '9px',
            background: theme.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0,
            boxShadow: `0 2px 8px ${theme.color}40`,
          }}>
            {initials}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#EEF2FF', lineHeight: 1.2 }}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1 }}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>
          </div>
        </NavLink>
      </div>
    </header>
  )
}
