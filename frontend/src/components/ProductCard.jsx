import { ShoppingCart, Star, Leaf, Zap } from 'lucide-react'

const CATEGORY_EMOJI = {
  'Vegetables': '🥦', 'Fruits': '🍎', 'Grains & Cereals': '🌾',
  'Spices & Herbs': '🌶️', 'Dairy': '🥛', 'Pulses': '🫘',
}

export default function ProductCard({ product, onAddToCart, onClick }) {
  const emoji = CATEGORY_EMOJI[product.category_name] || '🌾'
  const avgRating = product.average_rating || 0
  const isLowStock = product.quantity > 0 && product.quantity < 10
  const isOutOfStock = product.quantity <= 0
  const hasAISuggestion = product.ai_suggested_price &&
    Math.abs(parseFloat(product.ai_suggested_price) - parseFloat(product.price)) > 0.5

  return (
    <div className="product-card" onClick={onClick}>

      {/* ── Image / thumbnail ── */}
      <div style={{ position: 'relative', height: '196px', overflow: 'hidden', background: 'var(--surface-3)' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '60px',
            background: 'linear-gradient(145deg, var(--surface-3), var(--surface-2))',
          }}>
            {emoji}
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(6,12,8,0.65) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        {/* Top-left badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {product.is_organic && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 9px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
              background: 'rgba(16,185,129,0.88)', color: '#fff',
              backdropFilter: 'blur(8px)', letterSpacing: '0.02em',
            }}>
              <Leaf size={9} /> Organic
            </span>
          )}
          {hasAISuggestion && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 9px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
              background: 'rgba(139,92,246,0.88)', color: '#fff',
              backdropFilter: 'blur(8px)',
            }}>
              <Zap size={9} /> AI
            </span>
          )}
        </div>

        {/* Unit tag */}
        <span style={{
          position: 'absolute', top: '10px', right: '10px',
          padding: '3px 9px', borderRadius: '99px',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          color: '#E2E8F0', fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em',
        }}>
          /{product.unit}
        </span>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(6,12,8,0.7)', backdropFilter: 'blur(4px)',
          }}>
            <span style={{ padding: '7px 18px', borderRadius: '99px', background: 'rgba(239,68,68,0.88)', color: '#fff', fontSize: '12px', fontWeight: 800, letterSpacing: '0.03em' }}>
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Info section ── */}
      <div style={{ padding: '16px 18px 18px' }}>
        {/* Category & farm */}
        <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {product.category_name} · {product.farmer_farm || product.farmer_name}
        </p>

        {/* Product name */}
        <h3 style={{
          fontSize: '15px', fontWeight: 700, color: '#EEF2FF', marginBottom: '10px',
          lineHeight: '1.35', letterSpacing: '-0.01em',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </h3>

        {/* Star rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11}
                style={{ color: s <= Math.round(avgRating) ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                  fill: s <= Math.round(avgRating) ? '#F59E0B' : 'transparent' }} />
            ))}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {avgRating > 0 ? avgRating.toFixed(1) : '—'} ({product.review_count})
          </span>
        </div>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#34D399', fontFamily: 'Outfit, sans-serif', lineHeight: 1, letterSpacing: '-0.02em' }}>
              ₹{parseFloat(product.price).toLocaleString()}
            </span>
            {hasAISuggestion && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '7px', textDecoration: 'line-through' }}>
                ₹{parseFloat(product.ai_suggested_price).toLocaleString()}
              </span>
            )}
          </div>
          {onAddToCart && !isOutOfStock && (
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '8px 13px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#10B981,#059669)',
                color: '#fff', fontSize: '12px', fontWeight: 700,
                boxShadow: '0 3px 10px rgba(16,185,129,0.28)',
                transition: 'all 0.2s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(16,185,129,0.42)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(16,185,129,0.28)'; }}
              onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
            >
              <ShoppingCart size={13} /> Add
            </button>
          )}
        </div>

        {/* Stock indicator */}
        {!isOutOfStock && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                width: `${Math.min((product.quantity / 200) * 100, 100)}%`,
                background: isLowStock
                  ? 'linear-gradient(90deg,#F59E0B,#D97706)'
                  : 'linear-gradient(90deg,#10B981,#059669)',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{
              fontSize: '10.5px', fontWeight: 600, flexShrink: 0,
              color: isLowStock ? '#FCD34D' : 'var(--text-muted)',
            }}>
              {isLowStock ? `⚠ ${product.quantity} left` : `${product.quantity} ${product.unit}`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
