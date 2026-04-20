// routes/chat.js — REST endpoint for fetching message history
const express = require('express');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Build a consistent room key between two user IDs
function roomKey(a, b) {
  return [a, b].sort((x, y) => x - y).join('-');
}

// ── GET /api/chat/:otherId  — load message history ───────────
router.get('/:otherId', async (req, res) => {
  const room = roomKey(Number(req.user.id), Number(req.params.otherId));
  try {
    const [messages] = await pool.query(
      `SELECT cm.id, cm.sender_id, cm.receiver_id, cm.body, cm.sent_at,
              COALESCE(u.full_name, u.company_name, u.email) AS sender_name
       FROM   chat_messages cm
       JOIN   users u ON u.id = cm.sender_id
       WHERE  cm.room = ?
       ORDER  BY cm.sent_at ASC
       LIMIT  200`,
      [room]
    );

    // Cast IDs to plain JS numbers so frontend === comparisons always work
    const clean = messages.map(m => ({
      ...m,
      id:          Number(m.id),
      sender_id:   Number(m.sender_id),
      receiver_id: Number(m.receiver_id),
    }));

    return res.json({ messages: clean });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
module.exports.roomKey = roomKey;