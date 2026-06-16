import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import api from '../../api/axios'
import { Users, Search, ShieldCheck, Mail, Calendar } from 'lucide-react'

const ROLE_META = {
  farmer: { cls: 'badge-green',  color: '#10B981', bg: 'rgba(16,185,129,0.12)',  label: 'Farmer' },
  buyer:  { cls: 'badge-blue',   color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  label: 'Buyer' },
  admin:  { cls: 'badge-purple', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: 'Admin' },
}

const ROLE_TABS = ['all', 'farmer', 'buyer', 'admin']

export default function AdminUsers() {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (roleFilter) params.set('role', roleFilter)
    api.get(`/auth/admin/users/?${params}`)
      .then(r => setUsers(r.data.results || r.data))
      .finally(() => setLoading(false))
  }, [roleFilter])

  const filtered = users.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const counts = { all: users.length }
  users.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1 })

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header title="User Management" />
        <div className="content-area">

        {/* ── Role tab filters ─────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {ROLE_TABS.map(tab => {
            const meta = ROLE_META[tab]
            const active = roleFilter === (tab === 'all' ? '' : tab)
            return (
              <button key={tab} onClick={() => setRoleFilter(tab === 'all' ? '' : tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                  border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                  ...(active
                    ? { background: meta ? meta.bg : 'rgba(16,185,129,0.12)', color: meta ? meta.color : '#34D399', borderColor: meta ? `${meta.color}30` : 'rgba(16,185,129,0.3)' }
                    : { background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.07)' }
                  )
                }}>
                {tab === 'all' ? '👥' : tab === 'farmer' ? '🌾' : tab === 'buyer' ? '🛒' : '⚙️'}
                {tab === 'all' ? 'All Users' : ROLE_META[tab]?.label}
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-sec)' }}>
                  {counts[tab === 'all' ? 'all' : tab] || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Search ──────────────────────────────────────────────── */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: '42px' }}
            placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(12,29,58,0.5)', backdropFilter: 'blur(16px)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const meta = ROLE_META[u.role] || ROLE_META.buyer
                  const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                            background: meta.bg, border: `1px solid ${meta.color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 800, color: meta.color,
                          }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#EEF2FF' }}>
                              {u.first_name} {u.last_name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                              <Mail size={11} style={{ color: 'var(--text-muted)' }} />
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${meta.cls}`} style={{ textTransform: 'capitalize' }}>
                          {u.role === 'farmer' ? '🌾' : u.role === 'buyer' ? '🛒' : '⚙️'} {meta.label}
                        </span>
                      </td>
                      <td>
                        {u.role === 'farmer' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.is_approved ? '#10B981' : '#F59E0B', boxShadow: `0 0 6px ${u.is_approved ? '#10B981' : '#F59E0B'}` }} />
                            <span className={u.is_approved ? 'badge badge-green' : 'badge badge-yellow'}>
                              {u.is_approved ? <><ShieldCheck size={10} /> Verified</> : 'Pending'}
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                            <span className="badge badge-green">Active</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '13px', color: 'var(--text-sec)' }}>
                            {new Date(u.date_joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>👥</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No users match your search</p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
