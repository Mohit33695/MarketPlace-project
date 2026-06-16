import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import api from '../../api/axios'
import { BarChart3, ChevronDown, Search, Package, MapPin, DollarSign } from 'lucide-react'

const STATUS_META = {
  pending:    { cls: 'badge-yellow', dot: '#F59E0B', label: 'Pending' },
  confirmed:  { cls: 'badge-blue',   dot: '#3B82F6', label: 'Confirmed' },
  processing: { cls: 'badge-blue',   dot: '#3B82F6', label: 'Processing' },
  shipped:    { cls: 'badge-purple', dot: '#8B5CF6', label: 'Shipped' },
  delivered:  { cls: 'badge-green',  dot: '#10B981', label: 'Delivered' },
  cancelled:  { cls: 'badge-red',    dot: '#EF4444', label: 'Cancelled' },
}

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled']

export default function AdminTransactions() {
  const [orders, setOrders]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [expanded, setExpanded]       = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]           = useState('')

  useEffect(() => {
    api.get('/orders/admin/all/').then(r => setOrders(r.data.results || r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = orders
    .filter(o => !statusFilter || o.status === statusFilter)
    .filter(o => !search || o.buyer_name?.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search))

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + parseFloat(o.total_amount), 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header title="Transactions" />
        <div className="content-area">

        {/* ── Filter bar ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" style={{ paddingLeft: '40px' }}
              placeholder="Search by buyer name or order ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Status pill filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setStatusFilter('')}
              style={{
                padding: '8px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
                border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                ...(statusFilter === ''
                  ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', borderColor: 'transparent' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-sec)', borderColor: 'rgba(255,255,255,0.08)' }
                )
              }}>All</button>
            {STATUSES.map(s => {
              const m = STATUS_META[s]
              return (
                <button key={s} onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
                  style={{
                    padding: '8px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
                    border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                    ...(statusFilter === s
                      ? { background: `${m.dot}20`, color: m.dot, borderColor: `${m.dot}40` }
                      : { background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.06)' }
                    )
                  }}>{s}</button>
              )
            })}
          </div>
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
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const meta = STATUS_META[order.status] || STATUS_META.pending
                  const isOpen = expanded === order.id
                  return (
                    <React.Fragment key={order.id}>
                      <tr
                        style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                        onClick={() => setExpanded(isOpen ? null : order.id)}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#8BA3C4' }}>
                            #{String(order.id).padStart(4, '0')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                              {order.buyer_name?.[0] || 'B'}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#EEF2FF' }}>{order.buyer_name}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Package size={13} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-sec)' }}>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
                            ₹{parseFloat(order.total_amount).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.dot, boxShadow: `0 0 6px ${meta.dot}` }} />
                            <span className={`badge ${meta.cls}`}>{meta.label}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </span>
                        </td>
                        <td>
                          <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={7} style={{ padding: 0 }}>
                            <div style={{
                              padding: '16px 24px 18px',
                              background: 'rgba(16,185,129,0.03)',
                              borderTop: '1px solid rgba(255,255,255,0.05)',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                            }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                                {/* Items list */}
                                <div>
                                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                    Order Items
                                  </p>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {(order.items || []).map(item => (
                                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontSize: '14px' }}>🌾</span>
                                          <span style={{ fontSize: '13px', color: '#EEF2FF', fontWeight: 500 }}>{item.product_name}</span>
                                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>× {item.quantity} {item.unit}</span>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#34D399' }}>
                                          ₹{(item.price_at_purchase * item.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {/* Delivery */}
                                <div style={{ minWidth: '200px' }}>
                                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                    Delivery
                                  </p>
                                  <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                                    <MapPin size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                                    <p style={{ fontSize: '12px', color: 'var(--text-sec)', lineHeight: '1.5' }}>{order.delivery_address || '—'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>🔍</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No transactions match your filters</p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
