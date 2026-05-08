const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, role } = require('../middleware/auth');
const { pool } = require('../db');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

const uploadFoto = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Apenas imagens JPG, PNG ou WebP'));
  }
}).single('foto');

const uploadCurriculo = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/pdf|msword|officedocument/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Apenas PDF ou DOC'));
  }
}).single('curriculo');

router.post('/foto', auth, role('candidato'), (req, res) => {
  uploadFoto(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const url = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE candidatos SET foto_url=$1 WHERE user_id=$2', [url, req.user.id]);
    res.json({ url });
  });
});

router.post('/curriculo', auth, role('candidato'), (req, res) => {
  uploadCurriculo(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const url = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE candidatos SET curriculo_url=$1 WHERE user_id=$2', [url, req.user.id]);
    res.json({ url });
  });
});

module.exports = router;
