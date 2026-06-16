import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
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
      <div style={{
        background: 'rgba(7,14,9,0.96)', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '12px', padding: '10px 14px', boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#34D399', fontSize: '16px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
          ₹{payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export default function FarmerDashboard() {
  const { user } = useAuth()
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
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">

        {/* ── Topbar ─────────────────────────────────────────────── */}
        <Header
          title="Dashboard"
          subtitle={`${greeting}, ${user?.first_name || 'Farmer'} 🌾`}
          actions={
            <a href="/farmer/ai-pricing" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                <Zap size={14} style={{ color: '#C4B5FD' }} />
                AI Pricing
              </button>
            </a>
          }
        />

        <div className="content-area">

          {/* ── Approval banner ──────────────────────────────────── */}
          {!approved && (
            <div className="alert-banner alert-warning animate-fade-in-up" style={{ marginBottom: '24px' }}>
              <AlertCircle size={19} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontWeight: 700, color: '#FCD34D', fontSize: '14px', marginBottom: '4px' }}>
                  Account Pending Approval
                </p>
                <p style={{ color: 'rgba(252,211,77,0.65)', fontSize: '13px', lineHeight: '1.55' }}>
                  An admin will review and approve your farmer account. You'll be able to list products after approval. This usually takes 24 hours.
                </p>
              </div>
            </div>
          )}

          {/* ── Stat cards ───────────────────────────────────────── */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '130px' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
              <StatCard icon={DollarSign} label="Total Revenue"    value={`₹${(stats?.total_revenue || 0).toLocaleString()}`} color="#10B981" trend={12} />
              <StatCard icon={ShoppingBag} label="Total Orders"    value={stats?.total_orders || 0}                          color="#3B82F6"  trend={8} />
              <StatCard icon={Package}     label="Active Products" value={stats?.active_products || 0}                       color="#F59E0B" />
              <StatCard icon={Star}        label="Avg Rating"      value={`${stats?.avg_rating?.toFixed?.(1) || '4.5'} ★`}   color="#8B5CF6" />
            </div>
          )}

          {/* ── Charts ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

            {/* Revenue area chart */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TrendingUp size={16} style={{ color: '#10B981' }} />
                  </div>
                  <div>
                    <p className="section-title" style={{ fontSize: '14px' }}>Revenue Trend</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Daily earnings</p>
                  </div>
                </div>
                <span className="badge badge-green">Live</span>
              </div>
              {stats?.daily_sales?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.daily_sales}>
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#10B981" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.035)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#greenGrad)" dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '32px' }}>📊</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No sales data yet</p>
                </div>
              )}
            </div>

            {/* Top products bar chart */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Package size={16} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <p className="section-title" style={{ fontSize: '14px' }}>Top Products</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Best sellers by quantity</p>
                  </div>
                </div>
              </div>
              {stats?.top_products?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.top_products} layout="vertical" barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.035)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="product_name" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-sec)' }} width={88} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'rgba(7,14,9,0.96)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} />
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
                  <span style={{ fontSize: '32px' }}>📦</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No product data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Low stock alerts ──────────────────────────────────── */}
          {lowStock.length > 0 && (
            <div className="alert-banner alert-warning animate-fade-in-up" style={{ flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={17} style={{ color: '#F59E0B' }} />
                <p style={{ fontWeight: 700, color: '#FCD34D', fontSize: '13.5px' }}>
                  Low Stock Alert — {lowStock.length} product{lowStock.length > 1 ? 's' : ''} need attention
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {lowStock.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 11px',
                    borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
                  }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: '14px' }}>🌾</span>}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#EEF2FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: p.quantity === 0 ? '#FCA5A5' : '#FCD34D' }}>
                        {p.quantity === 0 ? 'Out of stock' : `${p.quantity} ${p.unit} left`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/farmer/inventory" style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', fontWeight: 700, color: '#F59E0B', textDecoration: 'none',
              }}>Update inventory <ArrowRight size={12} /></a>
            </div>
          )}

          {/* ── AI tip banner ─────────────────────────────────────── */}
          <div className="alert-banner alert-violet animate-fade-in-up" style={{ alignItems: 'center', gap: '20px', padding: '20px 24px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(59,130,246,0.22))',
              border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(139,92,246,0.18)',
            }}>
              <Brain size={22} style={{ color: '#C4B5FD' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <p style={{ fontWeight: 800, color: '#EEF2FF', fontSize: '14px', fontFamily: 'Outfit, sans-serif' }}>AI Pricing Assistant</p>
                <span className="ai-chip">🤖 ML Powered</span>
              </div>
              <p style={{ color: 'var(--text-sec)', fontSize: '13px', lineHeight: '1.55' }}>
                Visit the <strong style={{ color: '#34D399' }}>AI Pricing</strong> tab for real-time price predictions and 7-day demand forecasts to maximize your earnings.
              </p>
            </div>
            <a href="/farmer/ai-pricing" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <button className="btn-secondary" style={{ fontSize: '13px', padding: '9px 16px', whiteSpace: 'nowrap' }}>
                Try AI Pricing <ArrowRight size={13} />
              </button>
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
