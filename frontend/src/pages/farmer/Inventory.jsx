import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import { Warehouse, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FarmerInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products/my/').then(r => setProducts(r.data.results || r.data))
      .finally(() => setLoading(false))
  }, [])

  const updateStock = async (id, qty) => {
    try {
      await api.patch(`/products/${id}/`, { quantity: qty })
      setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p))
      toast.success('Stock updated')
    } catch { toast.error('Failed to update') }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Warehouse size={24} className="text-amber-400" /> Inventory Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and update your stock levels</p>
        </div>

        {loading ? <div className="flex justify-center h-40 items-center"><div className="spinner" /></div> : (
          <div className="glass overflow-hidden">
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>Current Stock</th><th>Unit</th><th>Status</th><th>Update Stock</th></tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const low = p.quantity < 10
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center">
                            {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <span>🌾</span>}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{p.name}</p>
                            <p className="text-xs text-slate-500">₹{p.price}/{p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`text-lg font-bold ${low ? 'text-red-400' : 'text-white'}`}>{p.quantity}</span>
                      </td>
                      <td className="text-slate-400 text-sm">{p.unit}</td>
                      <td>
                        {p.quantity === 0
                          ? <span className="badge badge-red">Out of Stock</span>
                          : low
                          ? <span className="badge badge-yellow flex items-center gap-1"><AlertTriangle size={10} /> Low Stock</span>
                          : <span className="badge badge-green">In Stock</span>}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min="0"
                            defaultValue={p.quantity}
                            className="input-field w-24 py-2 text-sm"
                            id={`stock-${p.id}`}
                          />
                          <button className="btn-secondary py-2 px-3 text-xs"
                            onClick={() => {
                              const val = parseInt(document.getElementById(`stock-${p.id}`).value)
                              if (!isNaN(val)) updateStock(p.id, val)
                            }}>
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
