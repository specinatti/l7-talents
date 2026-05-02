// Rate Limiting & DDoS Protection
const rateLimit = require('express-rate-limit');

// Aggressive rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Muitas requisições. Tente novamente em 15 minutos.', retryAfter: 900 });
  }
});

// Stricter limit for form submissions
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    res.status(429).json({ error: 'Limite de tentativas atingido. Tente novamente em 1 hora.', retryAfter: 3600 });
  }
});

module.exports = { apiLimiter, formLimiter };
