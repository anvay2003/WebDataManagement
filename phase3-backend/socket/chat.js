// socket/chat.js — Real-time chat via Socket.IO
const jwt  = require('jsonwebtoken');
const pool = require('../config/db');
const { roomKey } = require('../routes/chat');

module.exports = function initChat(io) {
  // JWT authentication for Socket.IO connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = Number(socket.user.id);
    console.log(`[Chat] User ${userId} connected — socket ${socket.id}`);

    // ── Join a private room with another user ──────────────────
    socket.on('joinRoom', ({ otherId }) => {
      const room = roomKey(userId, Number(otherId));
      socket.join(room);
      console.log(`[Chat] User ${userId} joined room ${room}`);
    });

    // ── Send a message ─────────────────────────────────────────
    socket.on('sendMessage', async ({ receiverId, body }) => {
      if (!receiverId || !body?.trim()) return;

      const room = roomKey(userId, Number(receiverId));

      try {
        // Persist to DB
        const [result] = await pool.query(
          'INSERT INTO chat_messages (sender_id, receiver_id, room, body) VALUES (?,?,?,?)',
          [userId, Number(receiverId), room, body.trim()]
        );

        // Fetch the saved message with sender name — COALESCE handles brand accounts
        // that have company_name instead of full_name
        const [[msg]] = await pool.query(
          `SELECT cm.id, cm.sender_id, cm.receiver_id, cm.body, cm.sent_at,
                  COALESCE(u.full_name, u.company_name, u.email) AS sender_name
           FROM   chat_messages cm
           JOIN   users u ON u.id = cm.sender_id
           WHERE  cm.id = ?`,
          [result.insertId]
        );

        // Cast IDs to plain JS numbers before broadcasting
        const cleanMsg = {
          ...msg,
          id:          Number(msg.id),
          sender_id:   Number(msg.sender_id),
          receiver_id: Number(msg.receiver_id),
        };

        // Broadcast to everyone in room (including sender)
        io.to(room).emit('newMessage', cleanMsg);
      } catch (err) {
        console.error('[Chat] DB error:', err);
        socket.emit('chatError', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Chat] User ${userId} disconnected`);
    });
  });
};
