// src/api/products.js
import { api } from './client';

/**
 * Fetch paginated / filtered products.
 * @param {{ category?: string, search?: string, sort?: string, page?: number, limit?: number }} params
 */
export function fetchProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, v); });
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return api.get(`/products${query}`);
}

/** Fetch a single product by slug, including reviews. */
export function fetchProduct(slug) {
  return api.get(`/products/${slug}`);
}

/** Submit a review for a product. */
export function submitReview(slug, { rating, body }) {
  return api.post(`/products/${slug}/reviews`, { rating, body });
}
