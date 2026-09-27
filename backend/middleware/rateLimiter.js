const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const withdrawalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many withdrawal requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiter, withdrawalLimiter };