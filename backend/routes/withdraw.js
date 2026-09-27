const express = require('express');
const router = express.Router();
const { getPool } = require('../config/postgres');
const { verifyToken } = require('../middleware/auth');
const { generateDeviceFingerprint } = require('../middleware/fingerprint');
const ThreatEvent = require('../models/ThreatEvent');

router.post('/withdraw', verifyToken, async (req, res) => {
  const { accountId, amount } = req.body;
  const deviceFingerprint = generateDeviceFingerprint(req);
  const ipAddress = req.ip;

  if (!accountId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid account or amount' });
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const txResult = await client.query(
      'INSERT INTO transactions (account_id, transaction_type, amount, status, device_fingerprint, ip_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING transaction_id',
      [accountId, 'withdrawal', amount, 'pending', deviceFingerprint, ipAddress]
    );
    const transactionId = txResult.rows[0].transaction_id;

    let riskScore = 30;
    try {
      const riskResponse = await fetch('http://localhost:5000/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          velocity_1h: 5000,
          distance_from_home_km: 2,
          time_of_day: new Date().getHours()
        })
      });
      const riskData = await riskResponse.json();
      riskScore = riskData.risk_score || 30;
    } catch (error) {
      console.log('[AI] Service unavailable, using default risk score');
    }

    await client.query(
      'UPDATE transactions SET risk_score = $1 WHERE transaction_id = $2',
      [riskScore, transactionId]
    );

    if (riskScore < 40) {
      const result = await client.query(
        'SELECT sp_withdrawal($1, $2, $3) as result',
        [accountId, amount, transactionId]
      );

      await client.query(
        'INSERT INTO audit_logs (transaction_id, action, details) VALUES ($1, $2, $3)',
        [transactionId, 'withdrawal_approved', JSON.stringify({ amount, riskScore })]
      );

      await client.query('COMMIT');
      client.release();
      res.json({ status: 'APPROVED', message: 'Withdrawal approved', transactionId });
    } else if (riskScore <= 70) {
      await client.query(
        'UPDATE transactions SET status = $1 WHERE transaction_id = $2',
        ['rejected', transactionId]
      );

      await client.query(
        'INSERT INTO audit_logs (transaction_id, action, details) VALUES ($1, $2, $3)',
        [transactionId, 'withdrawal_requires_2fa', JSON.stringify({ amount, riskScore })]
      );

      await client.query('COMMIT');
      client.release();

      await ThreatEvent.create({
        user_id: req.userId,
        severity: 'MEDIUM',
        reason: `Withdrawal requires 2FA verification - Risk Score: ${riskScore}`,
        ip_address: ipAddress,
        device_fingerprint: deviceFingerprint
      });

      res.json({ status: 'REQUIRE_2FA', message: 'Two-factor authentication required', transactionId });
    } else {
      await client.query(
        'UPDATE transactions SET status = $1 WHERE transaction_id = $2',
        ['frozen', transactionId]
      );

      await client.query(
        'SELECT sp_freeze_user($1)',
        [req.userId]
      );

      await client.query(
        'INSERT INTO security_events (user_id, event_type, severity, reason, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [req.userId, 'account_frozen', 'CRITICAL', `Fraud detection triggered - Risk Score: ${riskScore}`, ipAddress]
      );

      await client.query(
        'INSERT INTO audit_logs (transaction_id, action, details) VALUES ($1, $2, $3)',
        [transactionId, 'account_frozen', JSON.stringify({ amount, riskScore })]
      );

      await client.query('COMMIT');
      client.release();

      await ThreatEvent.create({
        user_id: req.userId,
        severity: 'CRITICAL',
        reason: `Account frozen due to fraud detection - Risk Score: ${riskScore}`,
        ip_address: ipAddress,
        device_fingerprint: deviceFingerprint
      });

      res.json({ status: 'FROZEN', message: 'Account frozen due to suspicious activity', transactionId });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    client.release();
    console.error('[Error] Withdrawal error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/account/:accountId', verifyToken, async (req, res) => {
  const { accountId } = req.params;
  const pool = getPool();

  try {
    const result = await pool.query(
      'SELECT account_id, user_id, balance, atm_cash, is_frozen, created_at FROM accounts WHERE account_id = $1',
      [accountId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/transactions/:accountId', verifyToken, async (req, res) => {
  const { accountId } = req.params;
  const pool = getPool();

  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC LIMIT 10',
      [accountId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;