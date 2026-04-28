name=backend/server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const { initPostgres } = require('./config/postgres');
const { initMongo } = require('./config/mongo');
const { limiter, withdrawalLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const withdrawRoutes = require('./routes/withdraw');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api', withdrawalLimiter, withdrawRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VaultCore Banking API', timestamp: new Date().toISOString() });
});

app.get('/api/audit-logs/:transactionId', async (req, res) => {
  const { transactionId } = req.params;
  const { getPool } = require('./config/postgres');
  const pool = getPool();

  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs WHERE transaction_id = $1 ORDER BY created_at DESC',
      [transactionId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

io.on('connection', (socket) => {
  console.log(`[WebSocket] User connected: ${socket.id}`);

  socket.on('subscribe_alerts', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`[WebSocket] User ${userId} subscribed to alerts`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] User disconnected: ${socket.id}`);
  });
});

async function startServer() {
  try {
    await initPostgres();
    console.log('[Startup] PostgreSQL initialized');

    await initMongo();
    console.log('[Startup] MongoDB initialized');

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`[Startup] VaultCore running on port ${PORT}`);
      console.log(`[Startup] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Startup] Initialization failed:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };