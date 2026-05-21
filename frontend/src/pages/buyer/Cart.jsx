import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  const fetchCart = () => {
    api.get('/orders/cart/').then(r => setCart(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const updateQty = async (itemId, qty) => {
    await api.patch(`/orders/cart/${itemId}/`, { quantity: qty })
    fetchCart()
  }

  const removeItem = async (itemId) => {
    await api.delete(`/orders/cart/${itemId}/`)
    toast.success('Item removed')
    fetchCart()
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart size={24} className="text-blue-400" /> My Cart
          </h1>
          <p className="text-slate-400 text-sm mt-1">{cart.count} items</p>
        </div>

        {loading ? (
          <div className="flex justify-center h-40 items-center"><div className="spinner" /></div>
        ) : cart.items?.length === 0 ? (
          <div className="glass p-16 text-center">
            <ShoppingCart size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-4">Your cart is empty</p>
            <button onClick={() => navigate('/buyer')} className="btn-primary">Browse Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Items */}
            <div className="col-span-2 space-y-3">
              {cart.items?.map(item => (
                <div key={item.id} className="glass p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {item.product_image ? <img src={item.product_image} className="w-full h-full object-cover" /> : <span className="text-2xl">🌾</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{item.product_name}</p>
                    <p className="text-xs text-slate-400">{item.farmer_name} · ₹{item.product_price}/{item.product_unit}</p>
                    <p className="text-green-400 font-bold mt-1">₹{parseFloat(item.subtotal).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center border border-slate-600 rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="px-3 py-2 text-slate-300 hover:bg-slate-700 text-sm">−</button>
                    <span className="px-3 py-2 font-bold text-white text-sm min-w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="px-3 py-2 text-slate-300 hover:bg-slate-700 text-sm">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="glass p-6 sticky top-8">
                <h3 className="font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({cart.count} items)</span>
                    <span>₹{parseFloat(cart.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery</span>
                    <span className="text-green-400">Free</span>
                  </div>
                </div>
                <div className="border-t border-slate-700 pt-4 mb-5">
                  <div className="flex justify-between font-bold text-white">
                    <span>Total</span>
                    <span className="text-green-400 text-xl">₹{parseFloat(cart.total).toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => navigate('/buyer/checkout')} className="btn-primary w-full justify-center py-3">
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
