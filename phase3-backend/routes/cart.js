// routes/cart.js
const express = require('express');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// ── GET /api/cart ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity, ci.size, ci.color, ci.added_at,
              p.name, p.price, p.image_url, p.slug
       FROM   cart_items ci
       JOIN   products p ON p.id = ci.product_id
       WHERE  ci.user_id = ?`,
      [req.user.id]
    );
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/cart ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { productId, quantity = 1, size = null, color = null } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  try {
    // Resolve slug → numeric ID if a string slug was sent instead of an INT
    let numericId = productId;
    if (isNaN(productId)) {
      const [rows] = await pool.query(
        'SELECT id FROM products WHERE slug = ?',
        [productId]
      );
      if (!rows.length) return res.status(404).json({ error: 'Product not found' });
      numericId = rows[0].id;
    }

    // Upsert: if product already in cart, add to quantity instead of erroring
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity, size, color)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, numericId, quantity, size, color]
    );

    return res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/cart/:id ───────────────────────────────────────
router.patch('/:id', async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be >= 1' });
  try {
    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );
    return res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /api/cart/:id ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    return res.json({ message: 'Removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /api/cart ──────────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/cart/checkout ───────────────────────────────────
// Creates a real order record from the current backend cart
router.post('/checkout', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get cart items with prices
    const [cartItems] = await conn.query(
      `SELECT ci.product_id, ci.quantity, p.price
       FROM   cart_items ci
       JOIN   products p ON p.id = ci.product_id
       WHERE  ci.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const shipping = subtotal >= 300 ? 0 : 12;
    const tax      = +(subtotal * 0.08).toFixed(2);
    const total    = +(subtotal + shipping + tax).toFixed(2);

    // Insert order
    const [orderResult] = await conn.query(
      'INSERT INTO orders (user_id, total, status) VALUES (?,?,?)',
      [req.user.id, total, 'pending']
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await conn.commit();
    conn.release();

    return res.json({ orderId, total, message: 'Order placed successfully' });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    return res.status(500).json({ error: 'Checkout failed' });
  }
});

module.exports = router;