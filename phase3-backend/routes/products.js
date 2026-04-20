// routes/products.js
const express = require('express');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');

const router = express.Router();

// ── GET /api/products  (optional ?category=&search=&sort=price_asc|price_desc) ──
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = `
      SELECT p.id, p.slug, p.name, p.description, p.price, p.currency,
             p.image_url, p.stock, c.slug AS category
      FROM   products p
      JOIN   categories c ON c.id = p.category_id
      WHERE  p.is_active = 1
    `;
    const params = [];

    if (category) {
      sql += ' AND c.slug = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'price_asc')  sql += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY p.price DESC';
    else sql += ' ORDER BY p.id ASC';

    sql += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await pool.query(sql, params);

    // Count total for pagination
    let countSql = 'SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id WHERE p.is_active = 1';
    const countParams = [];
    if (category) { countSql += ' AND c.slug = ?'; countParams.push(category); }
    if (search)   { countSql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    const [[{ total }]] = await pool.query(countSql, countParams);

    return res.json({ products: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/products/:slug ──────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const [[product]] = await pool.query(
      `SELECT p.id, p.slug, p.name, p.description, p.price, p.currency,
              p.image_url, p.stock, c.slug AS category
       FROM   products p
       JOIN   categories c ON c.id = p.category_id
       WHERE  p.slug = ? AND p.is_active = 1`,
      [req.params.slug]
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Reviews
    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.body, r.created_at,
              u.full_name AS author
       FROM   reviews r
       JOIN   users u ON u.id = r.user_id
       WHERE  r.product_id = ?
       ORDER  BY r.created_at DESC`,
      [product.id]
    );

    return res.json({ ...product, reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/products/:slug/reviews  (auth required) ────────
router.post('/:slug/reviews', auth, async (req, res) => {
  const { rating, body: reviewBody } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1-5 required' });

  try {
    const [[product]] = await pool.query('SELECT id FROM products WHERE slug = ?', [req.params.slug]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, body) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating), body=VALUES(body)',
      [product.id, req.user.id, rating, reviewBody || null]
    );
    return res.status(201).json({ message: 'Review saved' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
