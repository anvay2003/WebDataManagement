// ProductDetailPage.jsx
// Phase 3: product data AND reviews fetched dynamically from backend API.
// Supports submitting new reviews (auth required).

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/cart.jsx'
import { useAuth } from '../context/auth.jsx'
import { useI18n } from '../i18n/i18n.jsx'
import { api } from '../api/client.js'
import ProductCard from '../components/products/ProductCard.jsx'
import { ShoppingBag, Star, Loader2 } from 'lucide-react'

const SIZES  = ['XS', 'S', 'M', 'L', 'XL']
const COLORS = [
  { key: 'ivory',    label: 'Ivory',    hex: '#f5f0e8' },
  { key: 'blush',    label: 'Blush',    hex: '#e8b4b8' },
  { key: 'midnight', label: 'Midnight', hex: '#1a1a2e' },
  { key: 'sage',     label: 'Sage',     hex: '#8fad88' },
]

function StarRow({ rating, interactive = false, onSelect }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star
          key={s}
          onClick={() => interactive && onSelect?.(s)}
          className={`h-4 w-4 ${interactive ? 'cursor-pointer' : ''} ${
            s <= rating ? 'text-gold fill-gold' : 'text-black/20'
          }`}
        />
      ))}
    </span>
  )
}

export default function ProductDetailPage() {
  const { slug }           = useParams()
  const { add, items }     = useCart()
  const { isAuthed, user } = useAuth()
  const { t }              = useI18n()

  const [product,       setProduct]       = useState(null)
  const [related,       setRelated]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')

  const [selectedSize,  setSelectedSize]  = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0].key)
  const [qty,           setQty]           = useState(1)
  const [added,         setAdded]         = useState(false)

  // Review form state
  const [reviewRating,  setReviewRating]  = useState(5)
  const [reviewBody,    setReviewBody]    = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [reviewMsg,     setReviewMsg]     = useState('')
  const [reviews,       setReviews]       = useState([])

  // ── Fetch product + reviews from backend ──────────────────────
  useEffect(() => {
    setLoading(true)
    setError('')
    setProduct(null)
    setRelated([])
    setReviews([])

    api.get(`/products/${slug}`)
      .then(data => {
        setProduct(data)
        setReviews(data.reviews || [])

        // Fetch related products (same category, exclude current)
        if (data.category) {
          api.get(`/products?category=${data.category}&limit=10`)
            .then(({ products }) =>
              setRelated(products.filter(p => p.slug !== slug).slice(0, 3))
            )
            .catch(() => {})
        }
      })
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  const inCart = items.some(i => String(i.productId) === String(product?.id))

  const handleAddToCart = () => {
    if (!selectedSize) { alert('Please select a size.'); return }
    // Normalize to the shape cart expects
    add({
      id:          product.id,
      slug:        product.slug,
      name:        product.name,
      price:       product.price,
      image_url:   product.image_url,
      category:    product.category,
      selectedSize,
      selectedColor,
      qty,
    }, user?.email)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setReviewMsg('')
    try {
      await api.post(`/products/${slug}/reviews`, { rating: reviewRating, body: reviewBody })
      setReviewMsg('Review submitted! Thank you.')
      setReviewBody('')
      // Reload reviews
      const data = await api.get(`/products/${slug}`)
      setReviews(data.reviews || [])
    } catch (err) {
      setReviewMsg(err.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <section className="container-page py-20 flex items-center justify-center gap-3 text-ink/50">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading product…</span>
      </section>
    )
  }

  // ── Error / not found ─────────────────────────────────────────
  if (error || !product) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="font-display text-2xl">Product not found.</h1>
        <Link className="btn-gold mt-6 inline-block" to="/catalog">← Back to catalog</Link>
      </section>
    )
  }

  const imgSrc    = product.image_url || ''
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <section className="container-page py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-ink/60 mb-6">
        <Link to="/" className="hover:text-ink">{t('navHome')}</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-ink">{t('navCatalog')}</Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-10 items-start">

        {/* LEFT: Product image */}
        <div className="card overflow-hidden">
          <div className="aspect-square bg-black/5">
            <img
              src={imgSrc}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT: Product details */}
        <div className="flex flex-col gap-6">

          {/* Name + price */}
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/60 capitalize mb-1">{product.category}</p>
            <h1 className="font-display text-3xl sm:text-4xl leading-tight">{product.name}</h1>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-2xl font-semibold">${product.price}</span>
              {avgRating && (
                <span className="flex items-center gap-1 text-sm text-ink/60">
                  <StarRow rating={Math.round(avgRating)} />
                  <span className="ml-1">{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-ink/70 leading-relaxed">{product.description}</p>

          {/* Color selector */}
          <div>
            <div className="label mb-2">
              Color — <span className="font-normal capitalize">{COLORS.find(c => c.key === selectedColor)?.label}</span>
            </div>
            <div className="flex gap-3">
              {COLORS.map(c => (
                <button
                  key={c.key}
                  type="button"
                  title={c.label}
                  onClick={() => setSelectedColor(c.key)}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    selectedColor === c.key ? 'border-gold scale-110 shadow-md' : 'border-black/10'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-pressed={selectedColor === c.key}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="label mb-2">
              Size {!selectedSize && <span className="text-red-500 text-xs ml-1">(required)</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={selectedSize === s
                    ? 'btn-primary px-4 py-2 rounded-xl text-sm font-semibold'
                    : 'btn-ghost px-4 py-2 rounded-xl text-sm font-semibold border border-black/10'}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <div className="label mb-2">Quantity</div>
            <div className="flex items-center gap-3">
              <button type="button" className="btn-ghost w-9 h-9 text-lg font-bold"
                onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button type="button" className="btn-ghost w-9 h-9 text-lg font-bold"
                onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              className="btn-gold flex-1 py-3 text-base gap-2"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {added ? 'Added!' : inCart ? t('inCart') : t('addToCart')}
            </button>
            <Link to="/cart" className="btn-ghost flex-1 py-3 text-center text-base">
              View Cart
            </Link>
          </div>

          {/* Trust badges */}
          <div className="card p-4 bg-rose/20 text-sm text-ink/70 grid sm:grid-cols-3 gap-3 text-center">
            <div>🚚 Free shipping over $300</div>
            <div>🔄 30-day returns</div>
            <div>✨ 100% genuine silk</div>
          </div>
        </div>
      </div>

      {/* ── Reviews ── */}
      <div className="mt-14">
        <h2 className="font-display text-2xl mb-6">
          Customer Reviews {reviews.length > 0 && <span className="text-base font-normal text-ink/50">({reviews.length})</span>}
        </h2>

        {reviews.length === 0 ? (
          <p className="muted mb-6">No reviews yet — be the first!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {reviews.map(r => (
              <div key={r.id} className="card p-5">
                <StarRow rating={r.rating} />
                <p className="mt-3 text-sm text-ink/70 leading-relaxed">"{r.body}"</p>
                <p className="mt-3 text-xs font-semibold text-ink/60">— {r.author || 'Anonymous'}</p>
                <p className="text-xs text-ink/30 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submit review form — only for logged-in users */}
        {isAuthed ? (
          <div className="card p-6 max-w-lg">
            <h3 className="font-semibold mb-4">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} className="grid gap-4">
              <div>
                <label className="label mb-1">Your Rating</label>
                <StarRow rating={reviewRating} interactive onSelect={setReviewRating} />
              </div>
              <div>
                <label className="label mb-1" htmlFor="review-body">Your Review</label>
                <textarea
                  id="review-body"
                  className="input w-full min-h-[80px] resize-y"
                  placeholder="Share your thoughts about this product…"
                  value={reviewBody}
                  onChange={e => setReviewBody(e.target.value)}
                />
              </div>
              {reviewMsg && (
                <p className={`text-sm ${reviewMsg.includes('Failed') ? 'text-red-600' : 'text-green-700'}`}>
                  {reviewMsg}
                </p>
              )}
              <button type="submit" className="btn-gold w-fit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <p className="muted text-sm">
            <Link to="/" className="text-gold underline">Log in</Link> to leave a review.
          </p>
        )}
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl mb-6">You May Also Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

    </section>
  )
}
