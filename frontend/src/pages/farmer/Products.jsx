import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, Package, Leaf, ToggleLeft, ToggleRight, Info, AlertTriangle, Calendar, DollarSign } from 'lucide-react'

const UNITS = ['kg', 'quintal', 'ton', 'piece', 'dozen', 'liter', 'bundle']

const emptyForm = {
  name: '', description: '', price: '', quantity: '', unit: 'kg',
  category: '', is_organic: false, harvest_date: '', image: null,
}

export default function FarmerProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProducts()
    api.get('/products/categories/').then(r => setCategories(r.data.results || r.data))
  }, [])

  const fetchProducts = () => {
    setLoading(true)
    api.get('/products/my/').then(r => setProducts(r.data.results || r.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description, price: p.price, quantity: p.quantity,
      unit: p.unit, category: p.category || '', is_organic: p.is_organic, harvest_date: p.harvest_date || '', image: null
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v)
      })
      if (editing) {
        await api.patch(`/products/${editing.id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated! ✨')
      } else {
        await api.post('/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product added! 🌾')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      const errors = err.response?.data
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    await api.delete(`/products/${id}/`)
    toast.success('Product deleted')
    fetchProducts()
  }

  const toggleActive = async (p) => {
    try {
      await api.patch(`/products/${p.id}/`, { is_active: !p.is_active })
      toast.success(`Product ${p.is_active ? 'deactivated' : 'activated'}`)
      fetchProducts()
    } catch { toast.error('Failed to update status') }
  }

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header
          title="My Products"
          actions={
            <button className="btn-primary" onClick={openAdd} style={{ fontSize: '13px' }}>
              <Plus size={15} /> Add Product
            </button>
          }
        />
        <div className="content-area">

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px' }}>
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Package size={36} style={{ color: '#34D399' }} />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#EEF2FF', marginBottom: '8px' }}>No products listed</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Add your first farm listing to start selling to buyers</p>
            <button className="btn-primary" onClick={openAdd} style={{ fontSize: '14px' }}>
              <Plus size={15} /> Add First Product
            </button>
          </div>
        ) : (
          <div className="glass" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>AI Price</th>
                  <th>Status</th>
                  <th style={{ paddingRight: '24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const lowStock = p.quantity < 10
                  return (
                    <tr key={p.id}>
                      <td style={{ paddingLeft: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--surface-3)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {p.image_url 
                              ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              : <span style={{ fontSize: '20px' }}>🌾</span>}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <p style={{ fontWeight: 700, color: '#EEF2FF', fontSize: '14px' }}>{p.name}</p>
                              {p.is_organic && (
                                <span className="badge badge-green" style={{ fontSize: '9px', padding: '2px 6px' }}>
                                  <Leaf size={8} /> Organic
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-sec)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--text-sec)', fontWeight: 500 }}>
                          {p.category_name || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#34D399' }}>
                          ₹{p.price}/{p.unit}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: lowStock ? '#FCA5A5' : '#EEF2FF' }}>
                          {p.quantity} {p.unit}
                        </span>
                        {lowStock && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#FCD34D' }}>
                            <AlertTriangle size={10} />
                            <span style={{ fontSize: '10px', fontWeight: 600 }}>Low Stock</span>
                          </div>
                        )}
                      </td>
                      <td>
                        {p.ai_suggested_price ? (
                          <span className="ai-chip" style={{ fontSize: '10px', padding: '3px 8px' }}>
                            🤖 Suggested: ₹{p.ai_suggested_price}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No Data</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '10px' }}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button onClick={() => openEdit(p)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-sec)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#93C5FD' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-sec)' }}
                            title="Edit Product">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => toggleActive(p)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-sec)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = p.is_active ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = p.is_active ? '#FCD34D' : '#34D399' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-sec)' }}
                            title={p.is_active ? 'Deactivate Listing' : 'Activate Listing'}>
                            {p.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-sec)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#FCA5A5' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-sec)' }}
                            title="Delete Product">
                            <Trash2 size={14} />
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

        {/* Custom Glassmorphic Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#EEF2FF' }}>
                  {editing ? 'Edit Listing' : 'Add New Listing'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-sec)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EEF2FF'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sec)'}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="field-label">Product Name *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Alphonso Mangoes" />
                </div>

                <div>
                  <label className="field-label">Description *</label>
                  <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Describe the quality, harvest details, etc." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="field-label">Price (₹) *</label>
                    <input type="number" className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0" step="0.01" placeholder="Price per unit" />
                  </div>
                  <div>
                    <label className="field-label">Unit</label>
                    <select className="input-field" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="field-label">Quantity Available *</label>
                    <input type="number" className="input-field" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required min="0" placeholder="e.g. 150" />
                  </div>
                  <div>
                    <label className="field-label">Category</label>
                    <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label">Harvest Date</label>
                  <input type="date" className="input-field" value={form.harvest_date} onChange={e => setForm({...form, harvest_date: e.target.value})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <div>
                    <label className="field-label">Product Image</label>
                    <input type="file" accept="image/*" className="input-field"
                      onChange={e => setForm({...form, image: e.target.files[0]})} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                    <input type="checkbox" id="organic" checked={form.is_organic} onChange={e => setForm({...form, is_organic: e.target.checked})}
                      style={{ accentColor: '#10B981', width: '15px', height: '15px', cursor: 'pointer' }} />
                    <label htmlFor="organic" style={{ fontSize: '13px', fontWeight: 600, color: '#EEF2FF', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <Leaf size={14} style={{ color: '#34D399' }} /> This product is Organic
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '12px' }} disabled={saving}>
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {saving ? 'Saving listing...' : (editing ? 'Update Listing' : 'Publish Listing')}
                </button>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
