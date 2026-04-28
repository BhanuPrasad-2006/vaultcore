name=backend/middleware/fingerprint.js

const crypto = require('crypto');

function generateDeviceFingerprint(req) {
  const userAgent = req.get('user-agent') || '';
  const ip = req.ip || req.connection.remoteAddress;
  const fingerprint = crypto.createHash('sha256').update(`${ip}${userAgent}`).digest('hex');
  return fingerprint;
}

module.exports = { generateDeviceFingerprint };