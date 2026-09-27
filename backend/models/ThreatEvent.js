const mongoose = require('mongoose');

const threatEventSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  severity: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'CRITICAL'], 
    required: true 
  },
  reason: { type: String, required: true },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    expires: 2592000 
  },
  ip_address: { type: String },
  device_fingerprint: { type: String }
}, { collection: 'threat_events' });

const ThreatEvent = mongoose.model('ThreatEvent', threatEventSchema);

module.exports = ThreatEvent;