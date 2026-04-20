// routes/auth.js
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool     = require('../config/db');

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('accountType').isIn(['customer', 'brand']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, accountType, fullName = '', companyName = '' } = req.body;

    try {
      // Check duplicate
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (rows.length) return res.status(409).json({ error: 'Email already registered' });

      const hash = await bcrypt.hash(password, 12);
      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, account_type, full_name, company_name) VALUES (?,?,?,?,?)',
        [email, hash, accountType, fullName, companyName]
      );

      // Create default notification prefs
      await pool.query('INSERT INTO notification_prefs (user_id) VALUES (?)', [result.insertId]);

      const user = { id: result.insertId, email, accountType, fullName, companyName };
      const token = jwt.sign(
        { id: user.id, email, accountType },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({ user, token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const [rows] = await pool.query(
        'SELECT id, email, password_hash, account_type, full_name, company_name FROM users WHERE email = ?',
        [email]
      );
      if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

      const u = rows[0];
      const match = await bcrypt.compare(password, u.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const user = {
        id:          u.id,
        email:       u.email,
        accountType: u.account_type,
        fullName:    u.full_name,
        companyName: u.company_name,
      };

      const token = jwt.sign(
        { id: u.id, email: u.email, accountType: u.account_type },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({ user, token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
