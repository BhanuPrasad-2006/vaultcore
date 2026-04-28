const mongoose = require('mongoose');

const threatEventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    enum: ['login_attempt', 'unauthorized_access', 'withdrawal', 'suspicious_activity'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  description: String,
  ipAddress: String,
  userAgent: String,
  fingerprint: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('ThreatEvent', threatEventSchema);
