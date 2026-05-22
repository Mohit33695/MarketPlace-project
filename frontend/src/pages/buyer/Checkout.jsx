import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { CheckCircle, MapPin, ArrowLeft, ShieldCheck, Truck, ShoppingBag, CreditCard, Tag } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    delivery_address: user?.buyer_profile?.address || '',
    delivery_city: user?.buyer_profile?.city || '',
    delivery_pincode: user?.buyer_profile?.pincode || '',
    notes: '',
  })

  useEffect(() => {
    api.get('/orders/cart/').then(r => setCart(r.data))
  }, [])

  const placeOrder = async (e) => {
    e.preventDefault()
    if (!form.delivery_address.trim()) { toast.error('Please enter delivery address'); return }
    setPlacing(true)
    try {
      await api.post('/orders/place/', form)
      setSuccess(true)
      toast.success('🎉 Order placed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const total = parseFloat(cart?.total || 0)

  if (success) return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass animate-fade-in-up" style={{ padding: '48px', textAlign: 'center', maxWidth: '440px', margin: '40px auto' }}>
          <div className="animate-pulse-green" style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <CheckCircle size={36} style={{ color: '#34D399' }} />
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 800, color: '#EEF2FF', marginBottom: '8px' }}>
            Order Confirmed! 🎉
          </h2>
          <p style={{ color: 'var(--text-sec)', fontSize: '14px', marginBottom: '32px', lineHeight: 1.5 }}>
            Your order has been sent to the farmer. You can track its shipment status in your dashboard.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/buyer/orders')} className="btn-primary" style={{ fontSize: '14px' }}>
              Track Order
            </button>
            <button onClick={() => navigate('/buyer')} className="btn-secondary" style={{ fontSize: '14px' }}>
              Shop More
            </button>
          </div>
        </div>
      </main>
    </div>
  )

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="page-content">

        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          marginBottom: '20px', transition: 'color 0.2s', padding: 0
        }} onMouseEnter={e => e.currentTarget.style.color = '#EEF2FF'}
           onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ArrowLeft size={14} /> Back to Cart
        </button>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <MapPin size={18} style={{ color: '#34D399' }} />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '26px', fontWeight: 800, color: '#EEF2FF' }}>
              Checkout
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          
          {/* Main Form */}
          <div className="glass" style={{ padding: '28px' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: '#EEF2FF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} style={{ color: '#34D399' }} /> Delivery Details
            </h3>

            <form onSubmit={placeOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="field-label">Full Shipping Address *</label>
                <textarea className="input-field" rows={3} required
                  placeholder="House No., Building Name, Street Area"
                  value={form.delivery_address}
                  onChange={e => setForm({ ...form, delivery_address: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                <div>
                  <label className="field-label">City / Town *</label>
                  <input className="input-field" required placeholder="e.g. Nashik"
                    value={form.delivery_city}
                    onChange={e => setForm({ ...form, delivery_city: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">PIN Code *</label>
                  <input className="input-field" required placeholder="e.g. 422001"
                    value={form.delivery_pincode}
                    onChange={e => setForm({ ...form, delivery_pincode: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="field-label">Delivery Note / Instructions</label>
                <input className="input-field" placeholder="Leave at gate, call before delivery, etc."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>

              {/* Payment Info */}
              <div style={{
                borderRadius: '14px', padding: '16px',
                background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93C5FD' }}>
                  <CreditCard size={15} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#EEF2FF' }}>Cash on Delivery (COD)</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-sec)' }}>Pay via cash or UPI when the farmer delivers your items.</p>
                </div>
              </div>

              <button type="submit" disabled={placing || !cart?.items?.length} className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '8px' }}>
                {placing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShieldCheck size={18} />
                )}
                {placing ? 'Placing Order...' : `Confirm Order · ₹${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Right Summary Column */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div className="glass" style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 800, color: '#EEF2FF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={14} style={{ color: 'var(--text-sec)' }} /> Items to Buy
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                {cart?.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontWeight: 700, color: '#EEF2FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product_name}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Qty: {item.quantity} {item.product_unit}</p>
                    </div>
                    <span style={{ fontWeight: 700, color: '#EEF2FF', marginLeft: '12px' }}>
                      ₹{parseFloat(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '14px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-sec)' }}>Subtotal</span>
                  <span style={{ color: '#EEF2FF', fontWeight: 600 }}>₹{total.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-sec)' }}>Shipping</span>
                  <span style={{ color: '#34D399', fontWeight: 700 }}>FREE</span>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '14px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#EEF2FF' }}>Grand Total</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#34D399', fontFamily: 'Outfit, sans-serif' }}>
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
