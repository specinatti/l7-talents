const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const SENSITIVE_ROLES = ['rh', 'financeiro', 'admin'];

const SESSION_TTL = {
  rh:         { jwt: '30m', cookie: 30 * 60 * 1000 },
  financeiro: { jwt: '30m', cookie: 30 * 60 * 1000 },
  admin:      { jwt: '30m', cookie: 30 * 60 * 1000 },
  candidato:  { jwt: '8h',  cookie: 8  * 60 * 60 * 1000 },
  empregador: { jwt: '8h',  cookie: 8  * 60 * 60 * 1000 },
};

function getTTL(role) { return SESSION_TTL[role] || SESSION_TTL.candidato; }

function generateToken(user, req) {
  const ua = req?.headers?.['user-agent']?.substring(0, 100) || '';
  const ip = req?.ip || '';
  const ttl = getTTL(user.role);
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, _ua: ua, _ip: ip, _pwt: user.updated_at ? new Date(user.updated_at).getTime() : 0 },
    process.env.JWT_SECRET,
    { expiresIn: ttl.jwt }
  );
}

function setTokenCookie(res, token, role) {
  const ttl = getTTL(role);
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ttl.cookie,
    path: '/',
  });
}

// ── OTP por email ─────────────────────────────────────────────────────────
async function sendEmailOTP(user) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await pool.query('DELETE FROM email_otp WHERE user_id = $1', [user.id]);
  await pool.query(
    "INSERT INTO email_otp (user_id, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
    [user.id, code]
  );

  // Enviar para email principal E alternativo se existir
  const destinations = [user.email];
  if (user.email_alternativo) destinations.push(user.email_alternativo);

  if (process.env.SMTP_HOST) {
    const nodemailer = require('nodemailer');
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const t = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    try {
      const info = await t.sendMail({
        from: process.env.SMTP_FROM || 'noreply@l7talents.online',
        to: destinations.join(','),
        subject: 'Código de acesso - L7 Talents',
        html: `<div style="font-family:Arial;max-width:480px;margin:0 auto;">
          <h2 style="color:#1B2A4A;">Código de acesso</h2>
          <p style="font-size:36px;font-weight:700;letter-spacing:8px;color:#B85C6E;">${code}</p>
          <p style="color:#6b7280;font-size:14px;">Válido por 10 minutos. Não compartilhe este código.</p>
        </div>`
      });
      console.log(`[EMAIL OTP] Enviado para ${destinations.join(', ')} — messageId: ${info.messageId}`);
    } catch (smtpErr) {
      console.error(`[EMAIL OTP ERROR] ${smtpErr.message}`);
    }
  } else {
    console.log(`[EMAIL OTP] ${destinations.join(', ')}: ${code}`);
  }
}

async function verifyEmailOTP(userId, code) {
  const { rows } = await pool.query(
    'SELECT id FROM email_otp WHERE user_id=$1 AND code=$2 AND used=false AND expires_at > NOW()',
    [userId, code]
  );
  if (!rows[0]) return false;
  await pool.query('UPDATE email_otp SET used=true WHERE id=$1', [rows[0].id]);
  return true;
}
// ─────────────────────────────────────────────────────────────────────────

async function login(req, res) {
  const { email, password, otp_code } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha obrigatórios' });

  try {
    const { rows } = await pool.query(
      'SELECT id, email, email_alternativo, password_hash, role, ativo, updated_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash))
      return res.status(401).json({ error: 'Credenciais inválidas' });

    if (!user.ativo)
      return res.status(403).json({ error: 'Conta desativada' });

    // OTP por email obrigatório para roles sensíveis
    if (SENSITIVE_ROLES.includes(user.role)) {
      if (!otp_code) {
        await sendEmailOTP(user);
        return res.status(202).json({ requires_otp: true, message: 'Código enviado para seu email' });
      }
      const valid = await verifyEmailOTP(user.id, otp_code);
      if (!valid) return res.status(401).json({ error: 'Código inválido ou expirado' });
    }

    const token = generateToken(user, req);
    setTokenCookie(res, token, user.role);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role }, session_ttl: getTTL(user.role).cookie });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

async function refresh(req, res) {
  const token = req.cookies?.auth_token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query('SELECT id, email, role, ativo, updated_at FROM users WHERE id = $1', [decoded.id]);
    if (!rows[0] || !rows[0].ativo) return res.status(401).json({ error: 'Usuário inativo' });
    const newToken = generateToken(rows[0], req);
    setTokenCookie(res, newToken, rows[0].role);
    res.json({ token: newToken, user: { id: rows[0].id, email: rows[0].email, role: rows[0].role } });
  } catch {
    res.clearCookie('auth_token');
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

async function register(req, res) {
  const { email, password, role, nome, razao_social } = req.body;
  if (!email || !password || !role || !nome)
    return res.status(400).json({ error: 'Campos obrigatórios: email, password, role, nome' });
  if (!['candidato', 'empregador', 'financeiro', 'rh'].includes(role))
    return res.status(400).json({ error: 'Role inválido' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const exists = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email.toLowerCase(), hash, role]
    );
    const user = rows[0];
    if (role === 'candidato') {
      await client.query('INSERT INTO candidatos (user_id, nome) VALUES ($1, $2)', [user.id, nome]);
    } else if (role === 'empregador') {
      await client.query('INSERT INTO empregadores (user_id, nome_contato, razao_social) VALUES ($1, $2, $3)', [user.id, nome, razao_social || nome]);
    }
    await client.query('COMMIT');
    res.status(201).json({ token: generateToken(user), user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar conta' });
  } finally {
    client.release();
  }
}

async function me(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, email_alternativo, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
    let perfil = null;
    if (req.user.role === 'candidato') {
      const r = await pool.query('SELECT * FROM candidatos WHERE user_id = $1', [req.user.id]);
      perfil = r.rows[0];
    } else if (req.user.role === 'empregador') {
      const r = await pool.query('SELECT * FROM empregadores WHERE user_id = $1', [req.user.id]);
      perfil = r.rows[0];
    }
    res.json({ ...rows[0], perfil });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

async function updateEmailAlternativo(req, res) {
  const { email_alternativo } = req.body;
  if (!SENSITIVE_ROLES.includes(req.user.role))
    return res.status(403).json({ error: 'Apenas contas administrativas' });
  try {
    await pool.query('UPDATE users SET email_alternativo = $1 WHERE id = $2', [email_alternativo || null, req.user.id]);
    res.json({ message: 'Email alternativo atualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar email alternativo' });
  }
}

async function changePassword(req, res) {
  const { senha_atual, nova_senha } = req.body;
  if (!senha_atual || !nova_senha) return res.status(400).json({ error: 'Campos obrigatórios: senha_atual, nova_senha' });
  if (nova_senha.length < 8) return res.status(400).json({ error: 'Nova senha deve ter no mínimo 8 caracteres' });
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0] || !await bcrypt.compare(senha_atual, rows[0].password_hash))
      return res.status(401).json({ error: 'Senha atual incorreta' });
    const hash = await bcrypt.hash(nova_senha, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
}

async function requestReset(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email obrigatório' });
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (!rows[0]) return res.json({ message: 'Se o email existir, você receberá as instruções.' });
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query('INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)', [rows[0].id, token, expires]);
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/pages/reset-senha.html?token=${token}`;
    if (process.env.SMTP_HOST) {
      const nodemailer = require('nodemailer');
      const port = parseInt(process.env.SMTP_PORT) || 587;
      const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: process.env.SMTP_SECURE === 'true' || port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: 'Recuperação de senha - L7 Talents', html: `<p>Clique para redefinir sua senha (válido 1h): <a href="${resetUrl}">${resetUrl}</a></p>` });
    } else {
      console.log(`[RESET] ${resetUrl}`);
    }
    res.json({ message: 'Se o email existir, você receberá as instruções.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao solicitar recuperação' });
  }
}

async function confirmReset(req, res) {
  const { token, nova_senha } = req.body;
  if (!token || !nova_senha) return res.status(400).json({ error: 'Token e nova senha obrigatórios' });
  if (nova_senha.length < 8) return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });
  try {
    const { rows } = await pool.query('SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()', [token]);
    if (!rows[0]) return res.status(400).json({ error: 'Token inválido ou expirado' });
    const hash = await bcrypt.hash(nova_senha, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, rows[0].user_id]);
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [rows[0].id]);
    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
}

module.exports = { register, login, me, refresh, changePassword, requestReset, confirmReset, updateEmailAlternativo };
