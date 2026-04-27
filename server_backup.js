const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true 
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

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


// Verify email connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email Error:', error);
  } else {
    console.log('✅ Email Server Ready');
  }
});

// ============ API ROUTES ============

// Contact Form
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: 'Nome, email e mensagem são obrigatórios' 
    });
  }

  try {
    // Send to Admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Novo Contato: ${name}`,
      html: `
        <h2>Novo Contato Recebido</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
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
    console.error('❌ Erro ao enviar email:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Newsletter Subscription
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Nova Inscrição Newsletter: ${email}`,
      html: `
        <h2>Nova Inscrição na Newsletter</h2>
        <p><strong>Email:</strong> ${email}</p>
      `
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Bem-vindo à Newsletter L7 Talents',
      html: `
        <h2>Bem-vindo!</h2>
        <p>Você foi inscrito com sucesso em nossa newsletter.</p>
        <p>Atenciosamente,<br>Equipe L7 Talents</p>
      `
    });

    res.json({ success: true, message: 'Inscrito com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao inscrever:', error);
    res.status(500).json({ error: 'Erro ao inscrever' });
  }
});

// Job Application
app.post('/api/apply', async (req, res) => {
  const { name, email, phone, message, position } = req.body;

  if (!name || !email || !phone || !position) {
    return res.status(400).json({ 
      error: 'Todos os campos são obrigatórios' 
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Candidatura: ${name} - ${position}`,
      html: `
        <h2>Nova Candidatura Recebida</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p><strong>Posição:</strong> ${position}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message || 'Sem mensagem adicional'}</p>
      `
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Candidatura Recebida - L7 Talents',
      html: `
        <h2>Obrigado por se candidatar!</h2>
        <p>Sua candidatura para a posição de <strong>${position}</strong> foi recebida.</p>
        <p>Entraremos em contato em breve.</p>
        <p>Atenciosamente,<br>Equipe L7 Talents</p>
      `
    });

    res.json({ success: true, message: 'Candidatura enviada com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao enviar candidatura:', error);
    res.status(500).json({ error: 'Erro ao enviar candidatura' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: process.env.APP_NAME });
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start Server
app.listen(PORT, process.env.HOST || 'localhost', () => {
  console.log(`\n🚀 L7 Talents Portal`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`✅ Server is running\n`);
});

module.exports = app;

