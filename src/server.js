require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDB } = require('./db');
const securityHeaders = require('../securityHeaders');
const { apiLimiter } = require('../rateLimiter');
const cacheBusting = require('../cacheBusting');

const app = express();

securityHeaders(app);
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Forçar HTTPS em produção
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https')
      return res.redirect(301, 'https://' + req.headers.host + req.url);
    next();
  });
}

// Rate limit global
app.use('/api', apiLimiter);

// Cache busting para assets
app.use(cacheBusting);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Tracking de acessos (público, sem auth)
app.post('/api/track', async (req, res) => {
  res.sendStatus(200);
  try {
    const { page, device } = req.body;
    if (!['mobile','desktop','tablet'].includes(device)) return;
    const { pool } = require('./db');
    await pool.query(
      'INSERT INTO page_views (page, device) VALUES ($1, $2)',
      [page?.substring(0,255) || '/', device]
    );
  } catch {}
});

// Rotas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidatos', require('./routes/candidatos'));
app.use('/api/empregadores', require('./routes/empregadores'));
app.use('/api/vagas', require('./routes/vagas'));
app.use('/api/financeiro', require('./routes/financeiro'));
app.use('/api/pagamentos', require('./routes/pagamentos'));
app.use('/api', require('./routes/comunicacao'));

// Frontend estático
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api'))
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

initDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 L7 Talents rodando na porta ${PORT}`)))
  .catch(err => { console.error('Erro ao iniciar:', err); process.exit(1); });
