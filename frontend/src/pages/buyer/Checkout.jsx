import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { CheckCircle, MapPin } from 'lucide-react'
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
    if (!form.delivery_address) { toast.error('Please enter delivery address'); return }
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

  if (success) return (
    <div className="flex">
      <Sidebar />
      <main className="page-content flex items-center justify-center">
        <div className="glass p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6 animate-pulse-green">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed! 🎉</h2>
          <p className="text-slate-400 text-sm mb-6">Your order has been confirmed. The farmer will process it shortly.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/buyer/orders')} className="btn-primary">View Orders</button>
            <button onClick={() => navigate('/buyer')} className="btn-secondary">Continue Shopping</button>
          </div>
        </div>
      </main>
    </div>
  )

  return (
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin size={24} className="text-green-400" /> Checkout
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="glass p-6">
              <h3 className="font-semibold text-white mb-5 flex items-center gap-2"><MapPin size={16} /> Delivery Address</h3>
              <form onSubmit={placeOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Address *</label>
                  <textarea className="input-field" rows={3} required
                    placeholder="House No., Street, Area"
                    value={form.delivery_address}
                    onChange={e => setForm({ ...form, delivery_address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                    <input className="input-field" placeholder="Mumbai"
                      value={form.delivery_city}
                      onChange={e => setForm({ ...form, delivery_city: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">PIN Code</label>
                    <input className="input-field" placeholder="400001"
                      value={form.delivery_pincode}
                      onChange={e => setForm({ ...form, delivery_pincode: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Special Instructions</label>
                  <input className="input-field" placeholder="Delivery instructions..."
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-sm text-slate-300">
                  💵 <strong>Cash on Delivery</strong> — Pay when your order arrives
                </div>
                <button type="submit" disabled={placing} className="btn-primary w-full justify-center py-3 text-base">
                  {placing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={18} />}
                  {placing ? 'Placing Order...' : `Place Order · ₹${parseFloat(cart?.total || 0).toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Cart summary */}
          <div>
            <div className="glass p-5 sticky top-8">
              <h3 className="font-semibold text-white mb-4 text-sm">Items in Cart</h3>
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {cart?.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-slate-400 truncate flex-1">{item.product_name} ×{item.quantity}</span>
                    <span className="text-white ml-3">₹{parseFloat(item.subtotal).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-white">
                <span>Total</span>
                <span className="text-green-400">₹{parseFloat(cart?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
