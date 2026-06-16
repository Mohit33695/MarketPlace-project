import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { ShoppingCart, Star, Leaf, ArrowLeft, Package, Send } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const fetchReviews = () => {
    api.get(`/products/${id}/reviews/`).then(r => setReviews(r.data.results || r.data))
  }

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}/`),
      api.get(`/products/${id}/reviews/`),
    ]).then(([p, r]) => {
      setProduct(p.data)
      setReviews(r.data.results || r.data)
    }).finally(() => setLoading(false))
  }, [id])

  const submitReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return }
    setSubmittingReview(true)
    try {
      await api.post(`/products/${id}/reviews/`, reviewForm)
      toast.success('Review submitted! 🌟')
      setReviewForm({ rating: 5, comment: '' })
      fetchReviews()
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0]
      toast.error(msg || 'You may have already reviewed this product')
    } finally {
      setSubmittingReview(false)
    }
  }

  const addToCart = async () => {
    setAddingToCart(true)
    try {
      await api.post('/orders/cart/add/', { product_id: id, quantity: qty })
      toast.success(`${qty} × ${product.name} added to cart!`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header title="Product" />
        <div className="content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div className="spinner" />
        </div>
      </div>
    </div>
  )
  if (!product) return null

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Header title={product?.name || 'Product Detail'} />
        <div className="content-area">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="glass overflow-hidden rounded-2xl">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-80 object-cover" />
            ) : (
              <div className="w-full h-80 flex items-center justify-center bg-slate-800 text-7xl">🌾</div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start gap-2 mb-2">
              <span className="badge badge-blue text-xs">{product.category_name}</span>
              {product.is_organic && <span className="badge badge-green"><Leaf size={10} /> Organic</span>}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{product.name}</h1>
            <p className="text-sm text-slate-400 mb-1">By <span className="text-green-400">{product.farmer_name}</span> · {product.farmer_farm}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                ))}
              </div>
              <span className="text-sm text-slate-400">{avgRating} ({reviews.length} reviews)</span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Price */}
            <div className="glass p-4 mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-green-400">₹{product.price}</span>
                <span className="text-slate-400 text-sm">per {product.unit}</span>
              </div>
              {product.ai_suggested_price && (
                <p className="text-xs text-violet-300 flex items-center gap-1">
                  🤖 AI suggests ₹{product.ai_suggested_price}/{product.unit}
                </p>
              )}
              <p className={`text-xs mt-2 ${product.quantity < 10 ? 'text-red-400' : 'text-slate-500'}`}>
                {product.quantity <= 0 ? '❌ Out of stock' : `✓ ${product.quantity} ${product.unit} available`}
              </p>
            </div>

            {/* Add to cart */}
            {product.quantity > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-600 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors">−</button>
                  <span className="px-4 py-3 font-bold text-white min-w-12 text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.quantity, q + 1))}
                    className="px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors">+</button>
                </div>
                <button onClick={addToCart} disabled={addingToCart} className="btn-primary flex-1 justify-center py-3">
                  {addingToCart ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShoppingCart size={16} />}
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            )}

            {product.harvest_date && (
              <p className="text-xs text-slate-500 mt-3">🗓 Harvested: {new Date(product.harvest_date).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-400" /> Customer Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="glass p-8 text-center text-slate-400 text-sm">No reviews yet. Be the first to review!</div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="glass p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-white">{r.buyer_name}</span>
                    <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-300">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write a Review — only for buyers */}
        {user?.role === 'buyer' && (
          <div className="mt-6 glass p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Send size={16} className="text-green-400" /> Write a Review
            </h3>
            <form onSubmit={submitReview} className="space-y-4">
              {/* Star picker */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Your Rating *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          s <= (hoverRating || reviewForm.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-slate-400 self-center">{reviewForm.rating}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Your Comment *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Share your experience with this product..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary">
                {submittingReview
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send size={14} />}
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
