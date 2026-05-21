import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ShoppingBag, ChevronDown } from 'lucide-react'

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-blue',
  shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
}

export default function FarmerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/orders/farmer/').then(r => setOrders(r.data.results || r.data))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status/`, { status })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    toast.success(`Order #${id} marked as ${status}`)
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag size={24} className="text-blue-400" /> Orders
          </h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} total orders</p>
        </div>

        {loading ? <div className="flex justify-center h-40 items-center"><div className="spinner" /></div> : orders.length === 0 ? (
          <div className="glass p-16 text-center">
            <ShoppingBag size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="glass overflow-hidden">
                <div className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-white text-sm">Order #{order.id}</p>
                      <p className="text-xs text-slate-400">{order.buyer_name} · {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[order.status] || 'badge-blue'}`}>{order.status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-green-400">₹{parseFloat(order.total_amount).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{order.item_count} items</p>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expanded === order.id && (
                  <div className="border-t border-slate-700 p-5">
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Delivery Address</p>
                      <p className="text-sm text-slate-300">{order.delivery_address}, {order.delivery_city} {order.delivery_pincode}</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-300">{item.product_name} × {item.quantity} {item.unit}</span>
                          <span className="text-white font-medium">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-400">Update Status:</p>
                      {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <button key={s} disabled={order.status === s}
                          onClick={() => updateStatus(order.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${order.status === s
                            ? 'bg-green-500/20 border-green-500/40 text-green-400'
                            : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
