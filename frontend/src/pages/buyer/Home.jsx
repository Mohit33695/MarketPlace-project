import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import ProductCard from '../../components/ProductCard'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { Search, Sparkles, X, Leaf, SlidersHorizontal } from 'lucide-react'

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'price',       label: 'Price: Low → High' },
  { value: '-price',      label: 'Price: High → Low' },
  { value: 'name',        label: 'Name A-Z' },
]

export default function BuyerHome() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const searchRef = useRef(null)

  const [products, setProducts]               = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [categories, setCategories]           = useState([])
  const [loading, setLoading]                 = useState(true)
  const [search, setSearch]                   = useState('')
  const [category, setCategory]               = useState('')
  const [organic, setOrganic]                 = useState(false)
  const [ordering, setOrdering]               = useState('-created_at')

  useEffect(() => {
    api.get('/products/categories/').then(r => setCategories(r.data.results || r.data))
    api.get('/ai/recommendations/').then(r => setRecommendations(r.data.recommendations || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)   params.set('search', search)
    if (category) params.set('category', category)
    if (organic)  params.set('is_organic', 'true')
    if (ordering) params.set('ordering', ordering)
    api.get(`/products/?${params}`).then(r => setProducts(r.data.results || r.data))
      .finally(() => setLoading(false))
  }, [search, category, organic, ordering])

  const addToCart = async (product) => {
    try {
      await api.post('/orders/cart/add/', { product_id: product.id, quantity: 1 })
      toast.success(`${product.name} added to cart! 🛒`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart')
    }
  }

  const clearFilters = () => { setSearch(''); setCategory(''); setOrganic(false); setOrdering('-created_at') }
  const hasFilters = search || category || organic

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">

        {/* ── Topbar ──────────────────────────────────────────────── */}
        <Header title="Marketplace" subtitle={`Welcome back, ${user?.first_name || ''}`} />

        <div className="content-area">

          {/* ── AI Recommendations ──────────────────────────────────── */}
          {recommendations.length > 0 && (
            <div style={{ marginBottom: '32px' }} className="animate-fade-in-up">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 className="section-title">Recommended For You</h2>
                  <span className="ai-chip"><Sparkles size={10} /> AI Picks</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }} className="stagger">
                {recommendations.slice(0, 4).map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart}
                    onClick={() => navigate(`/buyer/product/${p.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* ── Filters bar ─────────────────────────────────────────── */}
          <div style={{ marginBottom: '24px' }}>

            {/* Search + sort row */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input ref={searchRef} className="input-field" style={{ paddingLeft: '40px', paddingRight: search ? '40px' : '16px' }}
                  placeholder="Search products, farmers..."
                  value={search} onChange={e => setSearch(e.target.value)} />
                {search && (
                  <button onClick={() => setSearch('')}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <select className="input-field" style={{ width: '185px' }}
                value={ordering} onChange={e => setOrdering(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Organic toggle */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `1px solid ${organic ? 'rgba(16,185,129,0.36)' : 'var(--border-mid)'}`,
                background: organic ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.04)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
                <input type="checkbox" checked={organic} onChange={e => setOrganic(e.target.checked)}
                  style={{ accentColor: '#10B981', width: '13px', height: '13px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: organic ? '#34D399' : 'var(--text-sec)' }}>
                  <Leaf size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />Organic
                </span>
              </label>

              {/* Clear filters */}
              {hasFilters && (
                <button onClick={clearFilters}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 15px', borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    background: 'rgba(239,68,68,0.06)', color: '#FCA5A5',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}>
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: '7px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button onClick={() => setCategory('')}
                style={{
                  padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                  border: '1px solid', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
                  ...(category === ''
                    ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', borderColor: 'transparent', boxShadow: '0 3px 10px rgba(16,185,129,0.28)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-sec)', borderColor: 'var(--border-mid)' }
                  )
                }}>
                All
              </button>
              {categories.map(c => (
                <button key={c.id} onClick={() => setCategory(category === String(c.id) ? '' : String(c.id))}
                  style={{
                    padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                    border: '1px solid', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
                    ...(category === String(c.id)
                      ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', borderColor: 'transparent', boxShadow: '0 3px 10px rgba(16,185,129,0.28)' }
                      : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-sec)', borderColor: 'var(--border-mid)' }
                    )
                  }}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── Products grid ────────────────────────────────────────── */}
          <div>
            {!loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-sec)', fontWeight: 700 }}>{products.length}</strong> products found
                  {category && categories.find(c => String(c.id) === category)
                    ? ` in ${categories.find(c => String(c.id) === category).name}` : ''}
                </p>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
                <div className="spinner" />
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <span style={{ fontSize: '44px', display: 'block', marginBottom: '14px' }}>🌾</span>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#EEF2FF', marginBottom: '7px' }}>No products found</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-secondary">Clear All Filters</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px' }} className="stagger">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart}
                    onClick={() => navigate(`/buyer/product/${p.id}`)} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
