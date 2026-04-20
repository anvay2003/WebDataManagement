// CatalogPage.jsx
// Phase 3: products fetched dynamically from backend API.
// Supports server-side filtering by category, sorting by price/name,
// and pagination (6 per page).

import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../api/client.js'
import ProductCard from '../components/products/ProductCard.jsx'
import { useI18n } from '../i18n/i18n.jsx'

const PAGE_SIZE = 6

const CATEGORIES = [
  { key: 'all',     tKey: 'filterAll' },
  { key: 'blouses', tKey: 'filterBlouses' },
  { key: 'dresses', tKey: 'filterDresses' },
  { key: 'shirts',  tKey: 'filterShirts' },
  { key: 'scarves', tKey: 'filterScarves' },
]

const SORT_OPTIONS = [
  { key: 'default',    label: 'Featured',          apiVal: '' },
  { key: 'price-asc',  label: 'Price: Low → High', apiVal: 'price_asc' },
  { key: 'price-desc', label: 'Price: High → Low', apiVal: 'price_desc' },
]

export default function CatalogPage() {
  const { t }    = useI18n()
  const location = useLocation()

  // Pre-select category if navigated from the homepage category grid
  const initialCat = location.state?.category || 'all'

  const [cat,      setCat]      = useState(initialCat)
  const [sort,     setSort]     = useState('default')
  const [page,     setPage]     = useState(1)
  const [products, setProducts] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // ── Fetch from backend whenever filter/sort/page changes ──────
  useEffect(() => {
    setLoading(true)
    setError('')

    const sortVal = SORT_OPTIONS.find(o => o.key === sort)?.apiVal || ''
    const params  = new URLSearchParams({ page, limit: PAGE_SIZE })
    if (cat !== 'all') params.set('category', cat)
    if (sortVal)       params.set('sort', sortVal)

    api.get(`/products?${params.toString()}`)
      .then(({ products: rows, total: t }) => {
        setProducts(rows)
        setTotal(t)
      })
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false))
  }, [cat, sort, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const changeFilter = (c) => { setCat(c); setPage(1) }
  const changeSort   = (s) => { setSort(s); setPage(1) }

  return (
    <section className="container-page py-12">
      <h1 className="font-display text-3xl">{t('catalogTitle')}</h1>

      {/* Filters + Sort bar */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => changeFilter(c.key)}
              className={cat === c.key ? 'btn-primary' : 'btn-ghost border border-black/10'}
            >
              {t(c.tKey)}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <label className="label whitespace-nowrap" htmlFor="sort-select">Sort by</label>
          <select
            id="sort-select"
            className="input w-auto"
            value={sort}
            onChange={e => changeSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="mt-4 muted">{total} item{total !== 1 ? 's' : ''}</p>
      )}

      {/* Error state */}
      {error && (
        <div className="card mt-8 p-6 text-center text-red-600">{error}</div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-black/8 rounded-t-2xl" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-black/8 rounded w-3/4" />
                <div className="h-3 bg-black/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && products.length > 0 && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="card p-10 mt-8 text-center text-ink/60">
          No products found in this category.
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            className="btn-ghost"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={page === n ? 'btn-primary w-9 h-9' : 'btn-ghost w-9 h-9'}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            className="btn-ghost"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  )
}
