// routes/users.js
const express = require('express');
const bcrypt  = require('bcryptjs');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// ── GET /api/users/me ─────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const [[u]] = await pool.query(
      'SELECT id, email, account_type, full_name, company_name, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!u) return res.status(404).json({ error: 'User not found' });
    return res.json({
      id:          u.id,
      email:       u.email,
      accountType: u.account_type,
      fullName:    u.full_name,
      companyName: u.company_name,
      avatarUrl:   u.avatar_url,
      createdAt:   u.created_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/users/me  { fullName, companyName, email } ─────
router.patch('/me', async (req, res) => {
  const { fullName, companyName, email } = req.body;
  try {
    await pool.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), company_name = COALESCE(?, company_name), email = COALESCE(?, email) WHERE id = ?',
      [fullName || null, companyName || null, email || null, req.user.id]
    );
    return res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/users/me/change-password ───────────────────────
router.post('/me/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const [[u]] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(currentPassword, u.password_hash);
    if (!match) return res.status(401).json({ error: 'Current password incorrect' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    return res.json({ message: 'Password changed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/users/me/notifications ──────────────────────────
router.get('/me/notifications', async (req, res) => {
  try {
    const [[prefs]] = await pool.query(
      'SELECT email_orders, email_promos, sms_orders, sms_promos FROM notification_prefs WHERE user_id = ?',
      [req.user.id]
    );
    return res.json(prefs || {});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/users/me/notifications ────────────────────────
router.patch('/me/notifications', async (req, res) => {
  const { emailOrders, emailPromos, smsOrders, smsPromos } = req.body;
  try {
    await pool.query(
      `INSERT INTO notification_prefs (user_id, email_orders, email_promos, sms_orders, sms_promos)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         email_orders = VALUES(email_orders),
         email_promos = VALUES(email_promos),
         sms_orders   = VALUES(sms_orders),
         sms_promos   = VALUES(sms_promos)`,
      [req.user.id,
       emailOrders ? 1 : 0,
       emailPromos ? 1 : 0,
       smsOrders   ? 1 : 0,
       smsPromos   ? 1 : 0]
    );
    return res.json({ message: 'Preferences saved' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/users/me/orders ──────────────────────────────────
router.get('/me/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT id, total, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/users  (brand accounts: list customers for chat) ─
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, full_name, company_name, account_type, email FROM users WHERE id != ?',
      [req.user.id]
    );
    // Cast IDs to plain JS numbers so frontend comparisons always work
    const clean = users.map(u => ({
      ...u,
      id: Number(u.id),
    }));
    return res.json({ users: clean });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
