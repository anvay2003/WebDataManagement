// CartPage.jsx — Phase 3: checkout saves real order to backend
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/i18n.jsx'
import { useCart } from '../context/cart.jsx'
import { useAuth } from '../context/auth.jsx'
import { api } from '../api/client.js'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'

export default function CartPage() {
  const { t } = useI18n()
  const { items, subtotal, remove, setQty, clear } = useCart()
  const { isAuthed } = useAuth()
  const [ordered,    setOrdered]    = useState(false)
  const [orderNum,   setOrderNum]   = useState(null)
  const [orderTotal, setOrderTotal] = useState(null)
  const [checking,   setChecking]   = useState(false)
  const [checkError, setCheckError] = useState('')

  const handleCheckout = async () => {
    setCheckError('')
    setChecking(true)
    try {
      if (isAuthed) {
        // 1. Clear any stale backend cart first
        await api.delete('/cart')

        // 2. Sync all local localStorage items to backend DB
        for (const item of items) {
          await api.post('/cart', {
            productId: item.productId,
            quantity:  item.qty,
            size:      item.selectedSize  || null,
            color:     item.selectedColor || null,
          })
        }

        // 3. Now call checkout — backend cart is populated
        const { orderId, total } = await api.post('/cart/checkout', {})
        setOrderNum(orderId)
        setOrderTotal(total)
      } else {
        // Guest: local order number only
        const shipping = subtotal >= 300 ? 0 : 12
        const tax      = +(subtotal * 0.08).toFixed(2)
        const total    = +(subtotal + shipping + tax).toFixed(2)
        setOrderNum(Math.floor(100000 + Math.random() * 900000))
        setOrderTotal(total)
      }
      clear()
      setOrdered(true)
    } catch (err) {
      setCheckError(err.message || 'Checkout failed. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  // ── Order success ─────────────────────────────────────────
  if (ordered) {
    return (
      <section className="container-page py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="font-display text-3xl">Order Confirmed!</h1>
        <p className="mt-3 muted">Thank you for your purchase.</p>
        <p className="mt-1 text-sm font-semibold">Order #{orderNum} — ${Number(orderTotal).toFixed(2)}</p>
        {isAuthed && <p className="mt-2 muted text-sm">You can view this order in your profile under My Orders.</p>}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          {isAuthed && (
            <Link to="/profile" className="btn-gold inline-flex items-center gap-2">
              View My Orders <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link to="/catalog" className="btn-ghost inline-flex items-center gap-2">
            {t('ctaShop')}
          </Link>
        </div>
      </section>
    )
  }

  // ── Empty cart ────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <section className="container-page py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-ink/20 mb-4" />
        <h1 className="font-display text-2xl">{t('cartTitle')}</h1>
        <p className="mt-2 muted">{t('emptyCart')}</p>
        <Link to="/catalog" className="btn-gold mt-6 inline-flex items-center gap-2">
          {t('ctaShop')} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    )
  }

  const shipping = subtotal >= 300 ? 0 : 12
  const tax      = +(subtotal * 0.08).toFixed(2)
  const total    = +(subtotal + shipping + tax).toFixed(2)

  return (
    <section className="container-page py-12">
      <h1 className="font-display text-3xl mb-6">{t('cartTitle')}</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">

        {/* Cart items */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 bg-black/5 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink/60">
            <span>{t('cartItem')}</span>
            <span>{t('qty')}</span>
            <span>{t('total')}</span>
            <span />
          </div>

          {items.map((item) => (
            <div key={item.productId} className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 border-t border-black/5">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover bg-black/5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="muted text-xs mt-0.5">${item.price} {t('pdpEach')}</div>
                  {item.selectedSize  && <div className="muted text-xs">{t('pdpSize')}: {item.selectedSize}</div>}
                  {item.selectedColor && <div className="muted text-xs capitalize">{t('pdpColor')}: {item.selectedColor}</div>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" className="btn-ghost w-8 h-8 text-lg font-bold" onClick={() => setQty(item.productId, Math.max(1, item.qty - 1))}>−</button>
                <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                <button type="button" className="btn-ghost w-8 h-8 text-lg font-bold" onClick={() => setQty(item.productId, item.qty + 1)}>+</button>
              </div>

              <div className="font-semibold text-sm sm:text-right">${(item.qty * item.price).toFixed(2)}</div>

              <button type="button" onClick={() => remove(item.productId)} className="btn-ghost text-ink/40 hover:text-red-500 p-2" title={t('remove')}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card p-6 sticky top-20">
          <h2 className="font-display text-xl mb-4">{t('cartOrderSummary')}</h2>

          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/70">{t('cartSubtotal')}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/70">{t('cartShipping')}</span>
              <span>{shipping === 0 ? <span className="text-green-700 font-medium">{t('cartShippingFree')}</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/70">{t('cartTax')}</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-black/10 mt-2 pt-2 flex justify-between font-semibold text-base">
              <span>{t('total')}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="mt-3 text-xs text-ink/60 bg-black/5 rounded-xl p-3">
              <strong>${(300 - subtotal).toFixed(2)}</strong> {t('cartFreeShippingMsg')}
            </p>
          )}

          {checkError && <p className="mt-3 text-sm text-red-600">{checkError}</p>}

          <button
            type="button"
            className="btn-gold w-full mt-5 py-3 text-base flex items-center justify-center gap-2"
            onClick={handleCheckout}
            disabled={checking}
          >
            {checking ? 'Processing…' : <>{t('cartCheckoutCta')} <ArrowRight className="h-5 w-5" /></>}
          </button>

          <Link to="/catalog" className="btn-ghost w-full mt-3 text-center text-sm">
            {t('cartContinue')}
          </Link>
        </div>
      </div>
    </section>
  )
}