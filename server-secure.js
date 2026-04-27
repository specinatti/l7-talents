const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Security Modules
const securityHeaders = require('./securityHeaders');
const { apiLimiter, formLimiter, uploadLimiter } = require('./rateLimiter');
const inputValidator = require('./inputValidator');
const encryption = require('./encryption');
const auditLogger = require('./auditLogger');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure directories exist
['uploads', 'logs'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Database Connection with SSL
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.query('SELECT NOW()', (err) => { 
  if (err) {
    console.log('❌ DB Error:', err);
    auditLogger.logSecurityEvent('database_connection_failed', { error: err.message }, 'system', 'system');
  } else {
    console.log('✅ DB Connected');
  }
});

// Multer Configuration with Security
const storage = multer.diskStorage({ 
  destination: (req, file, cb) => cb(null, 'uploads/'), 
  filename: (req, file, cb) => { 
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname); 
    cb(null, name); 
  } 
});

const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 5 * 1024 * 1024,
    files: 1
  }, 
  fileFilter: (req, file, cb) => { 
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas PDF, DOC, DOCX são permitidos'));
    }
  } 
});

// ============ SECURITY MIDDLEWARE ============

// Apply security headers
securityHeaders(app);

// CORS Configuration
app.use(cors({ 
  origin: ['https://l7talents.online', 'https://www.l7talents.online', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Body parsing with limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Trust proxy (for Railway)
app.set('trust proxy', 1);

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email Error:', error);
  } else {
    console.log('✅ Email Server Ready');
  }
});

// ============ API ROUTES WITH SECURITY ============

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: process.env.APP_NAME,
    timestamp: new Date().toISOString()
  });
});

// Curriculum Submission with Security
app.post('/api/curriculum', uploadLimiter, upload.single('curriculo'), async (req, res) => { 
  try {
    // Validate and sanitize inputs
    const nome = inputValidator.validateText(req.body.nome, 2, 100);
    const email = inputValidator.validateEmail(req.body.email);
    const telefone = inputValidator.validatePhone(req.body.telefone);
    const cargo_desejado = inputValidator.validateText(req.body.cargo_desejado, 2, 100);
    const area_atuacao = inputValidator.sanitize(req.body.area_atuacao);
    const habilidades = inputValidator.sanitize(req.body.habilidades);
    const linkedin = req.body.linkedin ? inputValidator.validateURL(req.body.linkedin) : null;
    const nivel_experiencia = inputValidator.sanitize(req.body.nivel_experiencia);
    const resumo_profissional = inputValidator.validateText(req.body.resumo_profissional || '', 0, 1000);
    
    // Validate file if present
    if (req.file) {
      inputValidator.validateFile(req.file);
    }
    
    const arquivo = req.file ? req.file.filename : null;
    const habs = habilidades ? habilidades.split(',').map(h => h.trim()) : [];
    
    // Encrypt sensitive data
    const telefoneEncrypted = encryption.encrypt(telefone);
    
    // Insert into database
    const result = await pool.query(
      `INSERT INTO curriculos (
        nome, email, telefone, telefone_encrypted, cargo_desejado, 
        area_atuacao, habilidades, arquivo_curriculo, linkedin, 
        nivel_experiencia, resumo_profissional
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`, 
      [
        nome, email, telefone, JSON.stringify(telefoneEncrypted), 
        cargo_desejado, area_atuacao, habs, arquivo, linkedin, 
        nivel_experiencia, resumo_profissional
      ]
    );
    
    // Audit log
    auditLogger.logDataModification(
      result.rows[0].id, 
      'curriculum', 
      'create', 
      req.ip, 
      req.get('user-agent')
    );
    
    // Send email notification
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `Novo Currículo: ${nome} - ${cargo_desejado}`,
        html: `
          <h2>Novo Currículo Recebido</h2>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${telefone}</p>
          <p><strong>Cargo Desejado:</strong> ${cargo_desejado}</p>
          <p><strong>Área:</strong> ${area_atuacao}</p>
          <p><strong>Nível:</strong> ${nivel_experiencia}</p>
          <p><strong>LinkedIn:</strong> ${linkedin || 'Não informado'}</p>
          <p><strong>Habilidades:</strong> ${habilidades || 'Não informado'}</p>
          <p><strong>Resumo:</strong> ${resumo_profissional || 'Não informado'}</p>
          <p><strong>Arquivo:</strong> ${arquivo || 'Não anexado'}</p>
        `
      });
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError);
      auditLogger.logSecurityEvent('email_send_failed', { error: emailError.message }, req.ip, req.get('user-agent'));
    }
    
    res.json({ 
      success: true, 
      id: result.rows[0].id, 
      message: 'Currículo enviado com sucesso!' 
    });
    
  } catch (error) { 
    console.error('❌ Erro ao salvar currículo:', error);
    auditLogger.logSecurityEvent('curriculum_submission_failed', { error: error.message }, req.ip, req.get('user-agent'));
    
    res.status(400).json({ 
      error: error.message || 'Erro ao processar currículo. Tente novamente.' 
    }); 
  } 
});

// Contact Form with Security
app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    const name = inputValidator.validateText(req.body.name, 2, 100);
    const email = inputValidator.validateEmail(req.body.email);
    const phone = req.body.phone ? inputValidator.validatePhone(req.body.phone) : null;
    const company = inputValidator.sanitize(req.body.company);
    const message = inputValidator.validateText(req.body.message, 10, 5000);

    // Audit log
    auditLogger.log('CONTACT_FORM_SUBMISSION', {
      name,
      email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send to Admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Novo Contato: ${name}`,
      html: `
        <h2>Novo Contato Recebido</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
        <p><strong>Empresa:</strong> ${company || 'Não informado'}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
      `
    });

    // Send confirmation to user
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Recebemos sua mensagem - L7 Talents',
      html: `
        <h2>Obrigado por entrar em contato!</h2>
        <p>Recebemos sua mensagem e responderemos em breve.</p>
        <p>Atenciosamente,<br>Equipe L7 Talents</p>
      `
    });

    res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao enviar contato:', error);
    auditLogger.logSecurityEvent('contact_form_failed', { error: error.message }, req.ip, req.get('user-agent'));
    res.status(400).json({ error: error.message || 'Erro ao enviar mensagem' });
  }
});

// Get Curriculums (Admin only - add authentication later)
app.get('/api/curriculums', apiLimiter, async (req, res) => { 
  try {
    auditLogger.logDataAccess('admin', 'curriculums', req.ip, req.get('user-agent'));
    
    const result = await pool.query('SELECT * FROM curriculos ORDER BY created_at DESC'); 
    res.json(result.rows); 
  } catch (error) { 
    console.error('❌ Erro ao buscar currículos:', error);
    res.status(500).json({ error: 'Erro ao buscar currículos' }); 
  } 
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  auditLogger.logSecurityEvent('application_error', { 
    error: err.message,
    stack: err.stack 
  }, req.ip, req.get('user-agent'));
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Start Server
app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`\n🚀 L7 Talents Portal - SECURE MODE`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔒 Security: ENABLED`);
  console.log(`✅ Server is running\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end();
  process.exit(0);
});

module.exports = app;
