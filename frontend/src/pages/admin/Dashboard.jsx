import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import StatCard from '../../components/StatCard'
import api from '../../api/axios'
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, PieChart, Activity, Zap } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(7,19,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 16px 32px rgba(0,0,0,0.4)' }}>
        {label && <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#EEF2FF', fontSize: '14px', fontWeight: 800 }}>
            {p.name === 'revenue' ? '₹' : ''}{p.value?.toLocaleString()} {p.name !== 'revenue' ? p.name : ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  if (percent < 0.08) return null
  const R = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + R * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + R * Math.sin(-midAngle * Math.PI / 180)
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '11px', fontWeight: 800, fill: '#fff' }}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export default function AdminDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/admin/').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    </div>
  )

  const s = data?.summary || {}

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="page-content">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: '32px' }} className="animate-fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))',
              border: '1px solid rgba(139,92,246,0.3)',
            }}>
              <Activity size={18} style={{ color: '#C4B5FD' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 800, color: '#EEF2FF', lineHeight: 1 }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Platform overview & analytics
              </p>
            </div>
          </div>
        </div>

        {/* ── Stat cards ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}
          className="stagger">
          <StatCard icon={Users}       label="Total Farmers"   value={s.total_farmers || 0} sub={`${s.pending_farmers || 0} pending approval`} color="#10B981" />
          <StatCard icon={Users}       label="Total Buyers"    value={s.total_buyers   || 0} color="#3B82F6" />
          <StatCard icon={Package}     label="Active Products" value={s.total_products  || 0} color="#F59E0B" />
          <StatCard icon={DollarSign}  label="Total Revenue"   value={`₹${(s.total_revenue || 0).toLocaleString()}`} color="#8B5CF6" trend={15} />
        </div>

        {/* ── Charts row 1 ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Revenue area */}
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <TrendingUp size={17} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>Monthly Revenue</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Earnings over time</p>
                </div>
              </div>
              <span className="badge badge-purple"><Zap size={9} /> Live</span>
            </div>
            {data?.monthly_revenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.monthly_revenue}>
                  <defs>
                    <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#8B5CF6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#violetGrad)" dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '40px' }}>📊</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No revenue data yet</p>
              </div>
            )}
          </div>

          {/* Category pie */}
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <PieChart size={17} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>By Category</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Product distribution</p>
              </div>
            </div>
            {data?.category_distribution?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <RPieChart>
                    <Pie data={data.category_distribution} dataKey="count" nameKey="category__name"
                      cx="50%" cy="50%" outerRadius={70} innerRadius={32} labelLine={false} label={<CustomLabel />}>
                      {data.category_distribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </RPieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                  {data.category_distribution.slice(0, 5).map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-sec)' }}>{c.category__name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Charts row 2 ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Orders by status */}
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <ShoppingBag size={17} style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>Orders by Status</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Order pipeline overview</p>
              </div>
            </div>
            {data?.order_status?.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.order_status} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="status" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-sec)' }} width={76} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="url(#blueGrad)" radius={[0,6,6,0]} />
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No orders yet</p>
              </div>
            )}
          </div>

          {/* Top products leaderboard */}
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Package size={17} style={{ color: '#10B981' }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>Top Products</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Best sellers by volume</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(data?.top_products || []).slice(0, 5).map((p, i) => {
                const max  = data?.top_products?.[0]?.total_qty || 1
                const pct  = Math.min(100, (p.total_qty / max) * 100)
                const color = CHART_COLORS[i % CHART_COLORS.length]
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', width: '16px' }}>#{i+1}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#EEF2FF' }}>{p.product_name}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color }}>
                        {p.total_qty} units
                      </span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '99px', width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        transition: 'width 0.8s cubic-bezier(.25,.8,.25,1)',
                      }} />
                    </div>
                  </div>
                )
              })}
              {!data?.top_products?.length && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📦</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No product data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
