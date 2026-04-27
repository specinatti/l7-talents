// Rate Limiting & DDoS Protection
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Aggressive rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded: ${req.ip}`);
    res.status(429).json({ 
      error: 'Muitas requisições. Tente novamente em 15 minutos.',
      retryAfter: 900 
    });
  }
});

// Stricter limit for form submissions
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour
  message: { error: 'Limite de envios atingido. Tente novamente em 1 hora.' },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.log(`⚠️ Form limit exceeded: ${req.ip}`);
    res.status(429).json({ 
      error: 'Limite de envios atingido. Tente novamente em 1 hora.',
      retryAfter: 3600 
    });
  }
});

// Speed limiter - slows down requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: () => 500
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Limite de uploads atingido. Tente novamente em 1 hora.' }
});

module.exports = {
  apiLimiter,
  formLimiter,
  speedLimiter,
  uploadLimiter
};
