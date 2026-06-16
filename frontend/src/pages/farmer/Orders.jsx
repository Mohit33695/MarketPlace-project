import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ShoppingBag, ChevronDown, MapPin, Package, ArrowRight } from 'lucide-react'

const STATUS_META = {
  pending:    { cls: 'badge-yellow', color: '#F59E0B', next: ['confirmed', 'cancelled'] },
  confirmed:  { cls: 'badge-blue',   color: '#3B82F6', next: ['processing', 'cancelled'] },
  processing: { cls: 'badge-blue',   color: '#3B82F6', next: ['shipped', 'cancelled'] },
  shipped:    { cls: 'badge-purple', color: '#8B5CF6', next: ['delivered'] },
  delivered:  { cls: 'badge-green',  color: '#10B981', next: [] },
  cancelled:  { cls: 'badge-red',    color: '#EF4444', next: [] },
}

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function FarmerOrders() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/orders/farmer/')
      .then(r => setOrders(r.data.results || r.data))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status/`, { status })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    toast.success(`Order #${id} → ${status}`)
  }

  const pending   = orders.filter(o => o.status === 'pending').length
  const totalRev  = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + parseFloat(o.total_amount), 0)

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header title="Orders" />
        <div className="content-area">

        {/* Quick stats */}
        {orders.length > 0 && (
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }} className="animate-fade-in-up">
            <div style={{ padding: '14px 20px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#EEF2FF', fontFamily: 'Outfit, sans-serif' }}>{orders.length}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Total orders</p>
            </div>
            {pending > 0 && (
              <div style={{ padding: '14px 20px', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#FCD34D', fontFamily: 'Outfit, sans-serif' }}>{pending}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Awaiting action</p>
              </div>
            )}
            <div style={{ padding: '14px 20px', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}>
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>₹{totalRev.toLocaleString()}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Revenue delivered</p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <div className="spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📦</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#EEF2FF', marginBottom: '6px' }}>No orders yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Orders will appear here once buyers start purchasing</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {orders.map(order => {
              const meta    = STATUS_META[order.status] || STATUS_META.pending
              const isOpen  = expanded === order.id
              const stepIdx = STATUS_ORDER.indexOf(order.status)

              return (
                <div key={order.id} style={{ borderRadius: '18px', overflow: 'hidden', border: `1px solid ${isOpen ? `${meta.color}25` : 'rgba(255,255,255,0.07)'}`, background: 'rgba(12,29,58,0.55)', backdropFilter: 'blur(16px)', transition: 'border-color 0.25s' }}>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : order.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Status dot */}
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: meta.color, boxShadow: `0 0 8px ${meta.color}`, flexShrink: 0 }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#EEF2FF' }}>Order #{String(order.id).padStart(4,'0')}</p>
                          <span className={`badge ${meta.cls}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {order.buyer_name} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '16px', fontWeight: 800, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
                          ₹{parseFloat(order.total_amount).toLocaleString()}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <ChevronDown size={16} style={{ color: 'var(--text-muted)', transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </div>
                  </div>

                  {/* ── Expanded panel ── */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '18px 20px 20px' }}>

                      {order.status !== 'cancelled' && (
                        <div style={{ marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: '480px' }}>
                            {STATUS_ORDER.map((s, i) => {
                              const done    = i <= stepIdx
                              const isCur   = i === stepIdx
                              const sm      = STATUS_META[s]
                              return (
                                <React.Fragment key={s}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i < STATUS_ORDER.length - 1 ? '1' : '0' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, transition: 'all 0.3s', background: done ? sm.color : 'rgba(255,255,255,0.05)', color: done ? '#fff' : 'var(--text-muted)', boxShadow: isCur ? `0 0 12px ${sm.color}60` : 'none', border: `2px solid ${done ? sm.color : 'rgba(255,255,255,0.08)'}` }}>
                                      {i + 1}
                                    </div>
                                    <p style={{ fontSize: '10px', fontWeight: 600, marginTop: '5px', color: done ? sm.color : 'var(--text-muted)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{s}</p>
                                  </div>
                                  {i < STATUS_ORDER.length - 1 && (
                                    <div style={{ flex: 1, height: '2px', background: i < stepIdx ? '#10B981' : 'rgba(255,255,255,0.06)', transition: 'background 0.3s', marginBottom: '18px' }} />
                                  )}
                                </React.Fragment>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>Items</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {order.items?.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={13} style={{ color: 'var(--text-muted)' }} />
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
                      {(order.delivery_address || order.delivery_city) && (
                        <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', marginBottom: '16px' }}>
                          <MapPin size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                          <p style={{ fontSize: '12px', color: 'var(--text-sec)', lineHeight: '1.5' }}>
                            {[order.delivery_address, order.delivery_city, order.delivery_pincode].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Status actions */}
                      {meta.next.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Move to:</p>
                          {meta.next.map(s => {
                            const sm = STATUS_META[s]
                            return (
                              <button key={s} onClick={() => updateStatus(order.id, s)}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '9px', border: `1px solid ${sm.color}30`, background: `${sm.color}10`, color: sm.color, fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}
                                onMouseEnter={e => { e.currentTarget.style.background = `${sm.color}20`; e.currentTarget.style.transform = 'translateY(-1px)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = `${sm.color}10`; e.currentTarget.style.transform = 'translateY(0)' }}>
                                <ArrowRight size={12} /> {s}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
