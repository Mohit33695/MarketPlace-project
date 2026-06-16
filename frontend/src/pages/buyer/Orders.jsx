import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import api from '../../api/axios'
import { ClipboardList, ChevronDown, Calendar, MapPin, Package, Truck, CheckCircle2, ShoppingBag, ShieldCheck, AlertCircle } from 'lucide-react'

const STATUS_COLORS = {
  pending: 'badge-yellow',
  confirmed: 'badge-blue',
  processing: 'badge-blue',
  shipped: 'badge-purple',
  delivered: 'badge-green',
  cancelled: 'badge-red',
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', icon: ClockIcon },
  { key: 'confirmed', label: 'Confirmed', icon: ShieldCheck },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

function ClockIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function BuyerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/orders/')
      .then(r => setOrders(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header title="My Orders" />
        <div className="content-area">

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <div className="spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ClipboardList size={36} style={{ color: '#93C5FD' }} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#EEF2FF', marginBottom: '8px' }}>No orders yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Your purchase history will appear here once you buy fresh produce</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="stagger">
            {orders.map(order => {
              const totalAmount = parseFloat(order.total_amount || 0)
              const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
              const isExpanded = expanded === order.id

              return (
                <div key={order.id} className="glass" style={{
                  overflow: 'hidden',
                  transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  border: isExpanded ? '1px solid rgba(16,185,129,0.22)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isExpanded ? '0 16px 36px rgba(0,0,0,0.3)' : 'none',
                }}>
                  {/* Order header row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', cursor: 'pointer',
                    background: isExpanded ? 'rgba(255,255,255,0.015)' : 'transparent',
                    flexWrap: 'wrap', gap: '16px'
                  }} onClick={() => setExpanded(isExpanded ? null : order.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={18} style={{ color: 'var(--text-sec)' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <p style={{ fontWeight: 800, fontSize: '15px', color: '#EEF2FF' }}>Order #{order.id}</p>
                          <span className={`badge ${STATUS_COLORS[order.status] || 'badge-blue'}`} style={{ fontSize: '10px' }}>
                            {order.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '18px', fontWeight: 900, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
                          ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-sec)' }}>{order.item_count} items</p>
                      </div>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: isExpanded ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isExpanded ? '#34D399' : 'var(--text-sec)',
                        transition: 'all 0.2s',
                      }}>
                        <ChevronDown size={15} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div style={{
                      padding: '24px', borderTop: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(7,19,42,0.2)'
                    }} className="animate-fade-in-up">
                      
                      {/* Step Progress Tracker */}
                      {order.status !== 'cancelled' ? (
                        <div style={{ marginBottom: '28px' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                            Delivery Status
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: '10px', gap: '8px' }}>
                            {STATUS_STEPS.map((step, idx) => {
                              const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status)
                              const isCompleted = idx <= currentIdx
                              const isActive = idx === currentIdx
                              const StepIcon = step.icon

                              return (
                                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{
                                      width: '32px', height: '32px', borderRadius: '50%',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '12px', fontWeight: 800, transition: 'all 0.3s',
                                      background: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                                      border: isCompleted 
                                        ? (isActive ? '2px solid #34D399' : '1px solid rgba(52,211,153,0.4)')
                                        : '1px solid rgba(255,255,255,0.08)',
                                      color: isCompleted ? '#34D399' : 'var(--text-sec)',
                                      boxShadow: isActive ? '0 0 12px rgba(52,211,153,0.3)' : 'none'
                                    }}>
                                      {isCompleted && !isActive ? '✓' : <StepIcon size={14} />}
                                    </div>
                                    <span style={{
                                      fontSize: '11px', fontWeight: isCompleted ? 700 : 500,
                                      color: isCompleted ? (isActive ? '#34D399' : '#EEF2FF') : 'var(--text-muted)'
                                    }}>{step.label}</span>
                                  </div>
                                  {idx < STATUS_STEPS.length - 1 && (
                                    <div style={{
                                      width: '40px', height: '2px', margin: '0 8px',
                                      background: idx < currentIdx ? '#10B981' : 'rgba(255,255,255,0.07)',
                                      alignSelf: 'flex-start', marginTop: '16px'
                                    }} />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '12px 16px', borderRadius: '12px',
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                          color: '#FCA5A5', fontSize: '13px', fontWeight: 600, marginBottom: '24px'
                        }}>
                          <AlertCircle size={16} />
                          <span>This order has been cancelled.</span>
                        </div>
                      )}

                      {/* Items and Address grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                        
                        {/* Items list */}
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                            Items Ordered
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {order.items?.map(item => (
                              <div key={item.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '20px' }}>🌾</span>
                                  <div>
                                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#EEF2FF' }}>{item.product_name}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-sec)' }}>₹{item.price_at_purchase}/{item.unit} × {item.quantity}</p>
                                  </div>
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 800, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
                                  ₹{(item.price_at_purchase * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Details */}
                        <div style={{ borderRadius: '16px', padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                            Delivery Information
                          </p>
                          <div style={{ display: 'flex', gap: '8px', color: 'var(--text-sec)', fontSize: '12px', lineHeight: 1.4 }}>
                            <MapPin size={14} style={{ color: 'var(--blue-light)', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <p style={{ fontWeight: 600, color: '#EEF2FF', marginBottom: '4px' }}>Delivery Address</p>
                              <p style={{ color: 'var(--text-sec)' }}>
                                {order.delivery_address}
                                {order.delivery_city ? `, ${order.delivery_city}` : ''}
                                {order.delivery_pincode ? ` - ${order.delivery_pincode}` : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>

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
