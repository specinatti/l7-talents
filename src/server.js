require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDB } = require('./db');

const cacheBusting = require('../cacheBusting');

const app = express();

// Segurança
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true }));
app.use(cacheBusting);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Rotas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidatos', require('./routes/candidatos'));
app.use('/api/empregadores', require('./routes/empregadores'));
app.use('/api/vagas', require('./routes/vagas'));
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
