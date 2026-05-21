import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import { ClipboardList, ChevronDown } from 'lucide-react'

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-blue',
  shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red',
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function BuyerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/orders/').then(r => setOrders(r.data.results || r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={24} className="text-blue-400" /> My Orders
          </h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} orders placed</p>
        </div>

        {loading ? <div className="flex justify-center h-40 items-center"><div className="spinner" /></div>
          : orders.length === 0 ? (
            <div className="glass p-16 text-center">
              <ClipboardList size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No orders yet. Start shopping!</p>
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
                        <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
                      {/* Progress tracker */}
                      {order.status !== 'cancelled' && (
                        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                          {STATUS_STEPS.map((step, i) => {
                            const currentIdx = STATUS_STEPS.indexOf(order.status)
                            const done = i <= currentIdx
                            return (
                              <div key={step} className="flex items-center gap-1 flex-shrink-0">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-600 text-slate-500'}`}>
                                  {done ? '✓' : i + 1}
                                </div>
                                <span className={`text-xs capitalize ${done ? 'text-green-400' : 'text-slate-500'}`}>{step}</span>
                                {i < STATUS_STEPS.length - 1 && <div className={`w-8 h-0.5 mx-1 ${i < currentIdx ? 'bg-green-500' : 'bg-slate-700'}`} />}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-slate-300">{item.product_name} × {item.quantity} {item.unit}</span>
                            <span className="text-white font-medium">₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">📍 {order.delivery_address}{order.delivery_city ? `, ${order.delivery_city}` : ''}</p>
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
