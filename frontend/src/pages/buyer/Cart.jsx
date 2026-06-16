import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ShoppingCart, Trash2, ArrowRight, Plus, Minus, Tag, Truck, Shield } from 'lucide-react'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart]     = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchCart = () => {
    api.get('/orders/cart/').then(r => setCart(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { fetchCart() }, [])

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return
    setUpdating(itemId)
    await api.patch(`/orders/cart/${itemId}/`, { quantity: qty })
    fetchCart()
    setUpdating(null)
  }

  const removeItem = async (itemId) => {
    setUpdating(itemId)
    await api.delete(`/orders/cart/${itemId}/`)
    toast.success('Item removed from cart')
    fetchCart()
    setUpdating(null)
  }

  const total = parseFloat(cart.total || 0)

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header title="My Cart" />
        <div className="content-area">

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <div className="spinner" />
          </div>
        ) : !cart.items?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShoppingCart size={36} style={{ color: '#93C5FD' }} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#EEF2FF', marginBottom: '8px' }}>Your cart is empty</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Add fresh products from our marketplace</p>
            <button onClick={() => navigate('/buyer')} className="btn-primary" style={{ fontSize: '14px' }}>
              Browse Products <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* ── Items list ────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 18px',
                  borderRadius: '18px', background: 'rgba(12,29,58,0.55)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s',
                  opacity: updating === item.id ? 0.6 : 1,
                }}>
                  {/* Product image */}
                  <div style={{ width: '68px', height: '68px', borderRadius: '14px', overflow: 'hidden', background: 'var(--surface-3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.product_image
                      ? <img src={item.product_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <span style={{ fontSize: '28px' }}>🌾</span>}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product_name}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {item.farmer_name} · ₹{item.product_price}/{item.product_unit}
                    </p>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
                      ₹{parseFloat(item.subtotal).toFixed(2)}
                    </p>
                  </div>

                  {/* Qty stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={updating === item.id || item.quantity <= 1}
                      style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sec)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 800, fontSize: '14px', color: '#EEF2FF' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={updating === item.id}
                      style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sec)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeItem(item.id)} disabled={updating === item.id}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', color: '#FCA5A5', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* ── Order summary ─────────────────────────────────────── */}
            <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{ borderRadius: '22px', padding: '24px', background: 'rgba(12,29,58,0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 56px rgba(0,0,0,0.35)' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: 800, color: '#EEF2FF', marginBottom: '20px' }}>
                  Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-sec)' }}>Subtotal ({cart.count} items)</span>
                    <span style={{ fontSize: '13px', color: '#EEF2FF', fontWeight: 600 }}>₹{total.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-sec)' }}>Delivery</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#34D399', fontWeight: 700 }}>FREE</span>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '18px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#EEF2FF' }}>Total</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <button onClick={() => navigate('/buyer/checkout')} className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
                  Proceed to Checkout <ArrowRight size={16} />
                </button>

                {/* Trust badges */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginTop: '18px' }}>
                  {[[Shield, 'Secure'], [Truck, 'Free Delivery'], [Tag, 'Best Price']].map(([Icon, label]) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <Icon size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
