import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import { Warehouse, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FarmerInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = () => {
    setLoading(true)
    api.get('/products/my/').then(r => setProducts(r.data.results || r.data))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false))
  }

  const updateStock = async (id, qty) => {
    if (qty < 0) { toast.error('Quantity cannot be negative'); return }
    setUpdating(id)
    try {
      await api.patch(`/products/${id}/`, { quantity: qty })
      setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p))
      toast.success('Stock updated successfully! 📦')
    } catch { 
      toast.error('Failed to update stock level') 
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="page-content">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }} className="animate-fade-in-up">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <Warehouse size={18} style={{ color: '#FCD34D' }} />
              </div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '26px', fontWeight: 800, color: '#EEF2FF' }}>
                Inventory Management
              </h1>
            </div>
            <p style={{ color: 'var(--text-sec)', fontSize: '14px', marginLeft: '50px' }}>Monitor stock levels and quickly replenish your items</p>
          </div>
          <button onClick={fetchInventory} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Warehouse size={36} style={{ color: '#FCD34D' }} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#EEF2FF', marginBottom: '8px' }}>No products listed</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Please list a product in My Listings before managing inventory.</p>
          </div>
        ) : (
          <div className="glass" style={{ overflow: 'hidden' }} className="animate-fade-in-up">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Product</th>
                  <th>Current Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th style={{ paddingRight: '24px', width: '320px' }}>Update Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.quantity < 10
                  const isOutOfStock = p.quantity === 0
                  const isUpdating = updating === p.id

                  return (
                    <tr key={p.id} style={{ opacity: isUpdating ? 0.6 : 1 }}>
                      <td style={{ paddingLeft: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface-3)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {p.image_url 
                              ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              : <span style={{ fontSize: '18px' }}>🌾</span>}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: '#EEF2FF', fontSize: '14px', marginBottom: '2px' }}>{p.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-sec)' }}>₹{p.price}/{p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '18px', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
                          color: isOutOfStock ? '#FCA5A5' : (isLow ? '#FCD34D' : '#34D399')
                        }}>
                          {p.quantity}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 500 }}>
                          {p.unit}
                        </span>
                      </td>
                      <td>
                        {isOutOfStock ? (
                          <span className="badge badge-red" style={{ fontSize: '9px' }}>Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-yellow" style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={10} /> Low Stock
                          </span>
                        ) : (
                          <span className="badge badge-green" style={{ fontSize: '9px' }}>In Stock</span>
                        )}
                      </td>
                      <td style={{ paddingRight: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number" min="0"
                            defaultValue={p.quantity}
                            className="input-field"
                            style={{ width: '110px', padding: '8px 12px', fontSize: '13px', textAlign: 'center' }}
                            id={`stock-${p.id}`}
                            disabled={isUpdating}
                          />
                          <button className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            disabled={isUpdating}
                            onClick={() => {
                              const val = parseInt(document.getElementById(`stock-${p.id}`).value)
                              if (!isNaN(val)) updateStock(p.id, val)
                            }}>
                            {isUpdating ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} style={{ color: '#34D399' }} />
                            )}
                            Save
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
