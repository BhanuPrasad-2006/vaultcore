name=backend/routes/auth.js

const express = require('express');
const router = express.Router();
const { getPool } = require('../config/postgres');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vaultcore-secret-key-2024';

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pool = getPool();

  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id',
      [username, email, hashedPassword]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.rows[0].user_id
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const pool = getPool();

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isPasswordValid = bcryptjs.compareSync(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.is_frozen) {
      return res.status(403).json({ error: 'Account is frozen' });
    }

    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, userId: user.user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;