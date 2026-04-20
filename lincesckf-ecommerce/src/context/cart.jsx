// cart.jsx — v3: localStorage cart + order history persisted per user
import React, { createContext, useContext, useMemo, useReducer } from 'react'

const CartContext = createContext(null)
const CART_KEY   = 'lincesckf.cart'
const ORDERS_KEY = 'lincesckf.orders'

function load() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : { items: [] }
  } catch { return { items: [] } }
}

function persist(state) {
  localStorage.setItem(CART_KEY, JSON.stringify(state))
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product } = action
      const addQty = product.qty && product.qty > 0 ? product.qty : 1
      // Support both DB products (image_url) and legacy static products (image)
      const image = product.image_url || product.image || ''
      const existing = state.items.find((i) => i.productId === product.id)
      const items = existing
        ? state.items.map((i) =>
            i.productId === product.id
              ? { ...i, qty: i.qty + addQty,
                  selectedSize:  product.selectedSize  || i.selectedSize,
                  selectedColor: product.selectedColor || i.selectedColor }
              : i
          )
        : [{ productId: product.id, qty: addQty, price: product.price,
             name: product.name, image,
             selectedSize:  product.selectedSize  || '',
             selectedColor: product.selectedColor || '' }, ...state.items]
      const next = { ...state, items }
      persist(next)
      return next
    }
    case 'REMOVE': {
      const items = state.items.filter((i) => i.productId !== action.productId)
      const next = { ...state, items }
      persist(next)
      return next
    }
    case 'SET_QTY': {
      const qty = Math.max(1, Number(action.qty || 1))
      const items = state.items.map((i) => i.productId === action.productId ? { ...i, qty } : i)
      const next = { ...state, items }
      persist(next)
      return next
    }
    case 'CLEAR': {
      const next = { items: [] }
      persist(next)
      return next
    }
    default:
      return state
  }
}

// ── Order history helpers (stored per user email) ──────────────
export function saveOrder(userEmail, order) {
  const key = `${ORDERS_KEY}.${userEmail}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  localStorage.setItem(key, JSON.stringify([order, ...existing]))
}

export function getOrders(userEmail) {
  if (!userEmail) return []
  const key = `${ORDERS_KEY}.${userEmail}`
  return JSON.parse(localStorage.getItem(key) || '[]')
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  const count    = state.items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.qty * i.price, 0)

  // loadForUser is called by AuthProvider via onAuthChange when the user
  // logs in or out. Reserved for future per-user cart loading from backend.
  const loadForUser = (_email) => { /* cart already loaded from localStorage */ }

  const value = useMemo(() => ({
    items: state.items,
    count,
    subtotal,
    loadForUser,
    add:    (product)        => dispatch({ type: 'ADD',     product }),
    remove: (productId)      => dispatch({ type: 'REMOVE',  productId }),
    setQty: (productId, qty) => dispatch({ type: 'SET_QTY', productId, qty }),
    clear:  ()               => dispatch({ type: 'CLEAR' }),
  }), [state.items, count, subtotal])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
