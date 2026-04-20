// routes/contact.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool    = require('../config/db');

const router = express.Router();

// ── POST /api/contact ─────────────────────────────────────────
router.post(
  '/',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('subject').notEmpty().trim(),
    body('message').notEmpty().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, subject, message } = req.body;
    try {
      await pool.query(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES (?,?,?,?)',
        [name, email, subject, message]
      );
      return res.status(201).json({ message: 'Message received. We will be in touch soon!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
