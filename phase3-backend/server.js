// server.js — Entry point for lincesckf Phase 3 backend
require('dotenv').config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');

const pool       = require('./config/db');
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes    = require('./routes/cart');
const userRoutes    = require('./routes/users');
const contactRoutes = require('./routes/contact');
const chatRoutes    = require('./routes/chat');
const initChat      = require('./socket/chat');

const app    = express();
const server = http.createServer(app);

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Socket.IO ─────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:      allowedOrigins,
    credentials: true,
  },
});
initChat(io);

// ── Body parser ───────────────────────────────────────────────
app.use(express.json());

// ── REST Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/chat',     chatRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', db: 'connected', timestamp: new Date() });
  } catch {
    return res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅  lincesckf backend running on http://localhost:${PORT}`);
  console.log(`📡  Socket.IO ready`);
});
