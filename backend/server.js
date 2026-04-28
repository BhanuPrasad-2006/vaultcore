const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const withdrawRoutes = require('./routes/withdraw');
const authMiddleware = require('./middleware/auth');
const fingerprintMiddleware = require('./middleware/fingerprint');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fingerprintMiddleware);
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/withdraw', authMiddleware, withdrawRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
