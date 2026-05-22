import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { UserCheck, CheckCircle, XCircle, Clock, MapPin, Phone, Search } from 'lucide-react'

const TABS = ['all', 'pending', 'approved']

export default function AdminFarmers() {
  const [farmers, setFarmers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  const fetchFarmers = () => {
    api.get('/auth/admin/users/?role=farmer')
      .then(r => setFarmers(r.data.results || r.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchFarmers() }, [])

  const handleAction = async (id, action) => {
    try {
      const { data } = await api.patch(`/auth/admin/farmers/${id}/approve/`, { action })
      toast.success(data.message)
      fetchFarmers()
    } catch { toast.error('Action failed') }
  }

  const base = farmers.filter(f =>
    `${f.first_name} ${f.last_name} ${f.email} ${f.farmer_profile?.farm_name || ''}`.toLowerCase().includes(search.toLowerCase())
  )
  const filtered = filter === 'pending' ? base.filter(f => !f.is_approved)
    : filter === 'approved' ? base.filter(f => f.is_approved) : base

  const pendingCount  = farmers.filter(f => !f.is_approved).length
  const approvedCount = farmers.filter(f => f.is_approved).length

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="page-content">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }} className="animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <UserCheck size={18} style={{ color: '#34D399' }} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '26px', fontWeight: 800, color: '#EEF2FF' }}>
              Farmer Management
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '20px', paddingLeft: '50px' }}>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>{farmers.length}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total farmers</p>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#FCD34D', fontFamily: 'Outfit, sans-serif' }}>{pendingCount}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending review</p>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>{approvedCount}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified</p>
            </div>
          </div>
        </div>

        {/* ── Pending alert ────────────────────────────────────────── */}
        {pendingCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '14px', marginBottom: '20px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderLeft: '4px solid #F59E0B' }}>
            <Clock size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: '#FCD34D', fontWeight: 600 }}>
              {pendingCount} farmer{pendingCount > 1 ? 's are' : ' is'} waiting for approval
            </p>
            <button onClick={() => setFilter('pending')} style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.12)', color: '#FCD34D', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Review Now
            </button>
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', padding: '4px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setFilter(tab)}
                style={{
                  padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                  ...(filter === tab
                    ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }
                    : { background: 'transparent', color: 'var(--text-muted)' }
                  )
                }}>
                {tab === 'all' ? `All (${farmers.length})` : tab === 'pending' ? `Pending (${pendingCount})` : `Verified (${approvedCount})`}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" style={{ paddingLeft: '40px' }}
              placeholder="Search farmers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* ── Farmer cards ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🌾</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No {filter !== 'all' ? filter : ''} farmers found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(f => {
              const initials = `${f.first_name?.[0] || ''}${f.last_name?.[0] || ''}`
              return (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px',
                  borderRadius: '18px', gap: '16px',
                  background: 'rgba(12,29,58,0.55)', backdropFilter: 'blur(16px)',
                  border: `1px solid ${f.is_approved ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'}`,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.border = `1px solid ${f.is_approved ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.28)'}`}
                  onMouseLeave={e => e.currentTarget.style.border = `1px solid ${f.is_approved ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'}`}>

                  {/* Avatar + Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                      background: f.is_approved ? 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.08))' : 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.08))',
                      border: `1px solid ${f.is_approved ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 800, color: f.is_approved ? '#34D399' : '#FCD34D',
                    }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF' }}>
                          {f.first_name} {f.last_name}
                        </p>
                        <span className={f.is_approved ? 'badge badge-green' : 'badge badge-yellow'}>
                          {f.is_approved ? <><CheckCircle size={10} /> Verified</> : <><Clock size={10} /> Pending</>}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{f.email}</p>
                      {f.farmer_profile && (
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '13px' }}>🌾</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-sec)', fontWeight: 600 }}>{f.farmer_profile.farm_name}</span>
                          </div>
                          {f.farmer_profile.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <MapPin size={11} style={{ color: 'var(--text-muted)' }} />
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.farmer_profile.location}</span>
                            </div>
                          )}
                          {f.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Phone size={11} style={{ color: 'var(--text-muted)' }} />
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {!f.is_approved ? (
                      <>
                        <button onClick={() => handleAction(f.id, 'approve')}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button onClick={() => handleAction(f.id, 'reject')}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', transition: 'all 0.2s' }}>
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleAction(f.id, 'reject')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', background: 'rgba(239,68,68,0.06)', color: '#FCA5A5', transition: 'all 0.2s' }}>
                        <XCircle size={14} /> Revoke
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
