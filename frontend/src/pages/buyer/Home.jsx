import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import ProductCard from '../../components/ProductCard'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { Search, Sparkles, SlidersHorizontal, X, Leaf, TrendingUp, ShoppingBag } from 'lucide-react'

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

  const [products, setProducts]             = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [categories, setCategories]         = useState([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [category, setCategory]             = useState('')
  const [organic, setOrganic]               = useState(false)
  const [ordering, setOrdering]             = useState('-created_at')

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
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="page-content">

        {/* ── Hero header ──────────────────────────────────────────── */}
        <div style={{ marginBottom: '32px' }} className="animate-fade-in-up">
          <div style={{
            borderRadius: '24px', padding: '32px 36px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.06) 50%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'180px', height:'180px', borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:'-30px', right:'30%', width:'120px', height:'120px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                Welcome back, {user?.first_name} 👋
              </p>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '30px', fontWeight: 800, color: '#EEF2FF', lineHeight: 1.2, marginBottom: '12px' }}>
                Fresh from the farm,
                <span className="gradient-text"> straight to you</span>
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-sec)', marginBottom: '24px', maxWidth: '400px' }}>
                Browse AI-curated products from verified farmers. Freshest picks, best prices.
              </p>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '28px' }}>
                {[
                  { icon: ShoppingBag, value: `${products.length}+`, label: 'Products', color: '#10B981' },
                  { icon: Leaf,        value: `${categories.length}`,  label: 'Categories', color: '#34D399' },
                  { icon: TrendingUp,  value: 'AI',                   label: 'Recommendations', color: '#8B5CF6' },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={15} style={{ color }} />
                    <span style={{ fontWeight: 800, color: '#EEF2FF', fontSize: '14px' }}>{value}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── AI Recommendations ───────────────────────────────────── */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: '36px' }} className="animate-fade-in-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, color: '#EEF2FF' }}>
                  Recommended For You
                </h2>
                <span className="ai-chip"><Sparkles size={10} /> AI Picks</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }} className="stagger">
              {recommendations.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart}
                  onClick={() => navigate(`/buyer/product/${p.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: '24px' }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '14px' }}>
            <button onClick={() => setCategory('')}
              style={{
                padding: '7px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 700,
                border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                ...(category === ''
                  ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-sec)', borderColor: 'rgba(255,255,255,0.08)' }
                )
              }}>
              All
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategory(category === String(c.id) ? '' : String(c.id))}
                style={{
                  padding: '7px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 700,
                  border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  ...(category === String(c.id)
                    ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }
                    : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-sec)', borderColor: 'rgba(255,255,255,0.08)' }
                  )
                }}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          {/* Search + sort row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input ref={searchRef} className="input-field" style={{ paddingLeft: '42px' }}
                placeholder="Search products, farmers..."
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <select className="input-field" style={{ width: '180px' }}
              value={ordering} onChange={e => setOrdering(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <label style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px', borderRadius: '14px', cursor: 'pointer',
              border: `1px solid ${organic ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: organic ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>
              <input type="checkbox" checked={organic} onChange={e => setOrganic(e.target.checked)}
                style={{ accentColor: '#10B981', width: '14px', height: '14px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: organic ? '#34D399' : 'var(--text-sec)' }}>
                🌿 Organic Only
              </span>
            </label>

            {hasFilters && (
              <button onClick={clearFilters}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '11px 16px', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.2)',
                  background: 'rgba(239,68,68,0.06)', color: '#FCA5A5', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}>
                <X size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Products grid ────────────────────────────────────────── */}
        <div>
          {!loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-sec)' }}>{products.length}</strong> products found
                {category && categories.find(c => String(c.id) === category)
                  ? ` in ${categories.find(c => String(c.id) === category).name}` : ''}
              </p>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div className="spinner" />
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🌾</span>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#EEF2FF', marginBottom: '8px' }}>No products found</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="btn-secondary">Clear All Filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '18px' }} className="stagger">
              {products.map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart}
                  onClick={() => navigate(`/buyer/product/${p.id}`)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
