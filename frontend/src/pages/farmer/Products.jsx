import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, Package, Leaf, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react'

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
    setForm({ name: p.name, description: p.description, price: p.price, quantity: p.quantity,
      unit: p.unit, category: p.category || '', is_organic: p.is_organic, harvest_date: p.harvest_date || '', image: null })
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
        toast.success('Product updated!')
      } else {
        await api.post('/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product added!')
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
    if (!confirm('Delete this product?')) return
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
    <div className="flex">
      <Sidebar />
      <main className="page-content">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package size={24} className="text-green-400" /> My Products
            </h1>
            <p className="text-slate-400 text-sm mt-1">{products.length} products listed</p>
          </div>
          <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Product</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="glass p-16 text-center">
            <Package size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No products yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first product to start selling</p>
            <button className="btn-primary mt-4" onClick={openAdd}><Plus size={15} /> Add First Product</button>
          </div>
        ) : (
          <div className="glass overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Price</th>
                  <th>Stock</th><th>AI Price</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden flex items-center justify-center">
                          {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <span>🌾</span>}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{p.name}</p>
                          {p.is_organic && <span className="badge badge-green text-xs"><Leaf size={9} /> Organic</span>}
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-400 text-sm">{p.category_name || '—'}</td>
                    <td className="text-green-400 font-semibold">₹{p.price}/{p.unit}</td>
                    <td>
                      <span className={`text-sm font-medium ${p.quantity < 10 ? 'text-red-400' : 'text-white'}`}>
                        {p.quantity} {p.unit}
                      </span>
                    </td>
                    <td>
                      {p.ai_suggested_price
                        ? <span className="ai-chip text-xs">🤖 ₹{p.ai_suggested_price}</span>
                        : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => toggleActive(p)}
                          className={`p-2 rounded-lg transition-colors ${p.is_active ? 'hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400' : 'hover:bg-green-500/10 text-slate-400 hover:text-green-400'}`}
                          title={p.is_active ? 'Deactivate' : 'Activate'}>
                          {p.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Product Name *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description *</label>
                  <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Price (₹) *</label>
                    <input type="number" className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Unit</label>
                    <select className="input-field" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Quantity *</label>
                    <input type="number" className="input-field" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required min="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                    <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Product Image</label>
                  <input type="file" accept="image/*" className="input-field"
                    onChange={e => setForm({...form, image: e.target.files[0]})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Harvest Date</label>
                    <input type="date" className="input-field" value={form.harvest_date} onChange={e => setForm({...form, harvest_date: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <input type="checkbox" id="organic" checked={form.is_organic} onChange={e => setForm({...form, is_organic: e.target.checked})}
                      className="w-4 h-4 accent-green-500" />
                    <label htmlFor="organic" className="text-sm text-slate-300 flex items-center gap-1"><Leaf size={13} className="text-green-400" /> Organic</label>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={saving}>
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                  {saving ? 'Saving...' : (editing ? 'Update Product' : 'Add Product')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
