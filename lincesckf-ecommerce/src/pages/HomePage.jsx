// HomePage.jsx — Hero + Special Offer + Category Grid + AI-style Personalised Recommendations
// Phase 3: products fetched dynamically from backend API

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/i18n.jsx'
import { useCart } from '../context/cart.jsx'
import { api } from '../api/client.js'
import ProductCard from '../components/products/ProductCard.jsx'

const CATEGORIES = [
  { key: 'blouses',  labelKey: 'homeCatBlouses',  emoji: '👚',
    image: 'https://images.unsplash.com/photo-1614251055880-ee96e4803393?auto=format&fit=crop&w=600&q=80' },
  { key: 'dresses',  labelKey: 'homeCatDresses',  emoji: '👗',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
  { key: 'shirts',   labelKey: 'homeCatShirts',   emoji: '👔',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80' },
  { key: 'scarves',  labelKey: 'homeCatScarves',  emoji: '🧣',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80' },
]

export default function HomePage() {
  const { t } = useI18n()
  const { items } = useCart()

  const [allProducts,  setAllProducts]  = useState([])
  const [loadingProds, setLoadingProds] = useState(true)

  // ── Fetch all products from backend DB ────────────────────────
  useEffect(() => {
    api.get('/products?limit=50')
      .then(({ products }) => setAllProducts(products))
      .catch(() => setAllProducts([]))
      .finally(() => setLoadingProds(false))
  }, [])

  // ── Personalised recommendations ─────────────────────────────
  // If the user has items in their cart, recommend products from
  // the same categories they haven't added yet.
  // Otherwise fall back to the first 3 products from the DB.
  const cartProductIds  = new Set(items.map(i => i.productId))
  const cartCategories  = new Set(
    items
      .map(i => allProducts.find(p => String(p.id) === String(i.productId))?.category)
      .filter(Boolean)
  )

  let recommended
  if (items.length === 0 || allProducts.length === 0) {
    recommended = allProducts.slice(0, 3)
  } else {
    const fromSameCategory = allProducts.filter(
      p => cartCategories.has(p.category) && !cartProductIds.has(p.id)
    )
    if (fromSameCategory.length >= 3) {
      recommended = fromSameCategory.slice(0, 3)
    } else {
      const others = allProducts.filter(
        p => !cartProductIds.has(p.id) && !fromSameCategory.includes(p)
      )
      recommended = [...fromSameCategory, ...others].slice(0, 3)
    }
  }

  const featured        = allProducts.slice(0, 3)
  const isPersonalised  = items.length > 0 && allProducts.length > 0

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-white border-b border-black/5">
        <div className="container-page py-16 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink/60">{t('tagline')}</p>
            <h1 className="font-display text-4xl sm:text-5xl mt-3 leading-tight">{t('heroTitle')}</h1>
            <p className="mt-4 text-ink/70 max-w-xl">{t('heroSub')}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/catalog" className="btn-gold">{t('ctaShop')}</Link>
              <Link to="/services" className="btn-ghost">{t('ctaQuote')}</Link>
            </div>
          </div>
          <div className="card p-6 bg-rose/40">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/5">
              <img
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1400&q=80"
                alt="Silk collection"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-4 muted">Bilingual shopping. Premium silk. Seamless experience.</div>
          </div>
        </div>
      </section>

      {/* ── Special Offer Banner ── */}
      <section className="bg-gold text-white">
        <div className="container-page py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚚</span>
            <div>
              <span className="font-bold text-sm uppercase tracking-wider">{t('homeSpecialOffer')} — </span>
              <span className="text-sm">{t('homeSpecialOfferSub')}</span>
            </div>
          </div>
          <Link to="/catalog" className="flex-shrink-0 bg-white text-gold font-bold text-sm px-4 py-2 rounded-xl hover:bg-white/90 transition">
            {t('homeShopNow')} →
          </Link>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="container-page py-14">
        <h2 className="font-display text-2xl mb-6">{t('homeCategories')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.key}
              to={`/catalog`}
              state={{ category: cat.key }}
              className="card overflow-hidden group block"
            >
              <div className="aspect-square overflow-hidden bg-black/5">
                <img
                  src={cat.image}
                  alt={t(cat.labelKey)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3 text-center">
                <span className="text-lg">{cat.emoji}</span>
                <div className="font-semibold text-sm mt-1">{t(cat.labelKey)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Personalised Recommendations ── */}
      <section className="container-page pb-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl">{t('homeRecommendedTitle')}</h2>
            {isPersonalised && (
              <p className="muted mt-1 text-xs">✨ {t('lang') === 'es' ? 'Basado en tu carrito' : 'Based on your cart'}</p>
            )}
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-ink/70 hover:text-ink">
            {t('ctaShop')} →
          </Link>
        </div>

        {loadingProds ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(n => (
              <div key={n} className="card animate-pulse aspect-[4/3] bg-black/5 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Featured Pieces — shown only when personalised recs are different ── */}
      {isPersonalised && (
        <section className="container-page pb-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl">{t('featured')}</h2>
            <Link to="/catalog" className="text-sm font-semibold text-ink/70 hover:text-ink">
              {t('ctaShop')} →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  )
}
