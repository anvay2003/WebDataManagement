// ProductCard.jsx — Works with both DB products (image_url, slug, description)
//                   and legacy static products (image, id-as-slug, descKey)

import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/cart.jsx'
import { useAuth } from '../../context/auth.jsx'
import { useI18n } from '../../i18n/i18n.jsx'

export default function ProductCard({ product }) {
  const { items, add } = useCart()
  const { user } = useAuth()
  const { t } = useI18n()

  const inCart    = items.some((i) => i.productId === product.id)
  const userEmail = user?.email ?? null

  // DB products use image_url; legacy static products use image
  const imgSrc = product.image_url || product.image || ''

  // DB products have a slug field; legacy static products used id as slug
  const slug = product.slug || product.id

  // DB products have a description string; legacy static products used a translation key
  const subtitle = product.description
    ? product.description.slice(0, 60) + (product.description.length > 60 ? '…' : '')
    : (product.descKey ? t(product.descKey) : '')

  return (
    <div className="card overflow-hidden group">
      {/* Clickable image → detail page */}
      <Link to={`/product/${slug}`} className="block">
        <div className="aspect-[4/3] bg-black/5 overflow-hidden">
          <img
            src={imgSrc}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            {/* Clickable name → detail page */}
            <Link
              to={`/product/${slug}`}
              className="font-semibold hover:text-gold transition"
            >
              {product.name}
            </Link>
            <div className="muted mt-1 text-sm">{subtitle}</div>
          </div>
          <div className="text-sm font-semibold flex-shrink-0">${product.price}</div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className={inCart ? 'btn-ghost flex-1' : 'btn-gold flex-1'}
            onClick={(e) => { e.stopPropagation(); add(product, userEmail) }}
          >
            {inCart ? t('inCart') : t('addToCart')}
          </button>
          <Link
            to={`/product/${slug}`}
            className="btn-ghost px-3"
            title="View details"
          >
            →
          </Link>
        </div>
      </div>
    </div>
  )
}
