import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../../components/Sidebar'
import StatCard from '../../components/StatCard'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { Package, ShoppingBag, TrendingUp, DollarSign, Brain, AlertCircle, Star, Zap, ArrowRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(7,19,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#34D399', fontSize: '15px', fontWeight: 800 }}>₹{payload[0]?.value?.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function FarmerDashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/farmer/'),
      api.get('/products/my/'),
    ]).then(([r, products]) => {
      setStats(r.data)
      const all = products.data.results || products.data
      setLowStock(all.filter(p => p.quantity < 10 && p.is_active))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const approved = user?.is_approved
  const greeting = t('goodEvening')

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="page-content">

        {/* ── Hero header ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '36px' }} className="animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {greeting} 🌾
                </p>
              </div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: 800, color: '#EEF2FF', lineHeight: 1.1, marginBottom: '8px' }}>
                {user?.first_name} {user?.last_name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-sec)' }}>
                  {user?.farmer_profile?.farm_name || 'Your Farm'} · {user?.farmer_profile?.location || 'Location not set'}
                </p>
                {approved
                  ? <span className="badge badge-green">✓ Verified</span>
                  : <span className="badge badge-yellow">⏳ Pending</span>}
              </div>
            </div>
            <a href="/farmer/ai-pricing" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px',
                borderRadius: '14px', cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))',
                border: '1px solid rgba(139,92,246,0.25)',
              }}>
                <Zap size={18} style={{ color: '#C4B5FD' }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#C4B5FD' }}>AI Pricing</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Get price suggestions</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </a>
          </div>
        </div>

        {/* ── Approval banner ──────────────────────────────────────── */}
        {!approved && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px',
            borderRadius: '16px', marginBottom: '28px',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderLeft: '4px solid #F59E0B',
          }} className="animate-fade-in-up">
            <AlertCircle size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontWeight: 700, color: '#FCD34D', fontSize: '14px', marginBottom: '4px' }}>Account Pending Approval</p>
              <p style={{ color: 'rgba(252,211,77,0.65)', fontSize: '13px', lineHeight: '1.5' }}>
                An admin will review and approve your farmer account. You'll be able to list products after approval. This usually takes 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* ── Stat cards ───────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            <StatCard icon={DollarSign} label={t('totalRevenue')} value={`₹${(stats?.total_revenue || 0).toLocaleString()}`} color="#10B981" trend={12} />
            <StatCard icon={ShoppingBag} label={t('totalOrders')}   value={stats?.total_orders || 0}     color="#3B82F6"  trend={8} />
            <StatCard icon={Package}    label={t('activeProducts')} value={stats?.active_products || 0}   color="#F59E0B" />
            <StatCard icon={Star}       label={t('avgRating')}      value={`${stats?.avg_rating?.toFixed?.(1) || '4.5'} ★`} color="#8B5CF6" />
          </div>
        )}

        {/* ── Charts ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Revenue area chart */}
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={17} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>Revenue Trend</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily earnings overview</p>
                </div>
              </div>
              <span className="badge badge-green">Live</span>
            </div>
            {stats?.daily_sales?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.daily_sales}>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#greenGrad)" dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '36px' }}>📊</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No sales data yet</p>
              </div>
            )}
          </div>

          {/* Top products bar chart */}
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={17} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>Top Products</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Best sellers by quantity</p>
                </div>
              </div>
            </div>
            {stats?.top_products?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.top_products} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="product_name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-sec)' }} width={88} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(7,19,42,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  <Bar dataKey="qty" fill="url(#amberGrad)" radius={[0,6,6,0]} />
                  <defs>
                    <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '36px' }}>📦</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No product data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Low stock alerts ─────────────────────────────────────── */}
        {lowStock.length > 0 && (
          <div style={{
            marginBottom: '24px', padding: '20px 22px', borderRadius: '16px',
            background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)',
            borderLeft: '4px solid #F59E0B',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AlertCircle size={18} style={{ color: '#F59E0B' }} />
              <p style={{ fontWeight: 700, color: '#FCD34D', fontSize: '14px' }}>
                Low Stock Alert — {lowStock.length} product{lowStock.length > 1 ? 's' : ''} need attention
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {lowStock.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: '16px' }}>🌾</span>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#EEF2FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: p.quantity === 0 ? '#FCA5A5' : '#FCD34D' }}>
                      {p.quantity === 0 ? 'Out of stock' : `${p.quantity} ${p.unit} left`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <a href="/farmer/inventory" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '14px', fontSize: '12px', fontWeight: 700, color: '#F59E0B',
              textDecoration: 'none',
            }}>Update inventory <ArrowRight size={13} /></a>
          </div>
        )}

        {/* ── AI tip ──────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px', padding: '22px 24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.08))',
          border: '1px solid rgba(139,92,246,0.2)',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25))',
            border: '1px solid rgba(139,92,246,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(139,92,246,0.2)',
          }}>
            <Brain size={24} style={{ color: '#C4B5FD' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <p style={{ fontWeight: 800, color: '#EEF2FF', fontSize: '15px', fontFamily: 'Outfit, sans-serif' }}>AI Pricing Assistant</p>
              <span className="ai-chip">🤖 Powered by ML</span>
            </div>
            <p style={{ color: 'var(--text-sec)', fontSize: '13px', lineHeight: '1.6' }}>
              Visit the <strong style={{ color: '#34D399' }}>AI Pricing</strong> tab to get real-time price predictions and 7-day demand forecasts. Our machine learning models analyze market trends to maximize your earnings.
            </p>
          </div>
          <a href="/farmer/ai-pricing" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button className="btn-secondary" style={{ fontSize: '13px', padding: '9px 16px', whiteSpace: 'nowrap' }}>
              Try AI Pricing <ArrowRight size={14} />
            </button>
          </a>
        </div>

      </main>
    </div>
  )
}
