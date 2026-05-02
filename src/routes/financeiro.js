const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { getAnalytics, getMonitor } = require('../controllers/analyticsController');
const fs = require('fs');
const path = require('path');

router.get('/analytics', auth, role('financeiro', 'admin'), getAnalytics);
router.get('/monitor', auth, role('financeiro', 'admin'), getMonitor);

// Servir arquivos markdown da raiz do projeto
const DOCS_DIR = path.join(__dirname, '../../');
const ALLOWED_DOCS = ['README.md','ARCHITECTURE.md','SECURITY.md','README-SECURITY.md','IMPLEMENTATION-SUMMARY.md','QUICKSTART.md','START-HERE.md'];

router.get('/docs/:file', auth, role('financeiro', 'admin'), (req, res) => {
  const file = req.params.file;
  if (!ALLOWED_DOCS.includes(file)) return res.status(404).json({ error: 'Documento não encontrado' });
  const filePath = path.join(DOCS_DIR, file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado' });
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(fs.readFileSync(filePath, 'utf8'));
});

module.exports = router;
