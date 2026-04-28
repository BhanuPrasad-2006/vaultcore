const fingerprint = require('express-fingerprint');

const fingerprintMiddleware = fingerprint.default({
  parameters: [
    fingerprint.useragent,
    fingerprint.acceptLanguage,
    fingerprint.acceptEncoding,
  ],
});

module.exports = fingerprintMiddleware;
