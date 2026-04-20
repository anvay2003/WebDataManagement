// src/api/cart.js
import { api } from './client';

export const fetchCart       = ()                           => api.get('/cart');
export const addToCart       = (productId, qty, size, color) =>
  api.post('/cart', { productId, quantity: qty, size, color });
export const updateCartItem  = (itemId, quantity)           => api.patch(`/cart/${itemId}`, { quantity });
export const removeCartItem  = (itemId)                     => api.delete(`/cart/${itemId}`);
export const clearCart       = ()                           => api.delete('/cart');
export const checkout        = (shippingAddr)               => api.post('/cart/checkout', { shippingAddr });
