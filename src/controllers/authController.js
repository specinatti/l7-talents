const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

// Roles que exigem 2FA e têm sessão mais curta
const SENSITIVE_ROLES = ['rh', 'financeiro', 'admin'];
// Roles que FORÇAM setup do 2FA no primeiro login (não podem entrar sem configurar)
const FORCE_2FA_ROLES = ['rh', 'financeiro'];

// Timeout de sessão por role (em segundos para JWT, ms para cookie)
const SESSION_TTL = {
  rh:         { jwt: '30m', cookie: 30 * 60 * 1000 },
  financeiro: { jwt: '30m', cookie: 30 * 60 * 1000 },
  admin:      { jwt: '30m', cookie: 30 * 60 * 1000 },
  candidato:  { jwt: '8h',  cookie: 8  * 60 * 60 * 1000 },
  empregador: { jwt: '8h',  cookie: 8  * 60 * 60 * 1000 },
};

function getTTL(role) {
  return SESSION_TTL[role] || SESSION_TTL.candidato;
}

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

// ── 2FA TOTP ──────────────────────────────────────────────────────────────
function getTOTP(secret) {
  const { TOTP, Secret } = require('otpauth');
  return new TOTP({ issuer: 'L7 Talents', label: 'L7 Talents', algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(secret) });
}

async function setup2FA(req, res) {
  if (!SENSITIVE_ROLES.includes(req.user.role))
    return res.status(403).json({ error: '2FA disponível apenas para RH, Financeiro e Admin' });

  const { Secret, TOTP } = require('otpauth');
  const QRCode = require('qrcode');

  const secret = new Secret({ size: 20 });
  const secretB32 = secret.base32;

  const totp = new TOTP({ issuer: 'L7 Talents', label: req.user.email, algorithm: 'SHA1', digits: 6, period: 30, secret });
  const otpauthUrl = totp.toString();

  await pool.query('UPDATE users SET totp_secret = $1, totp_enabled = false WHERE id = $2', [secretB32, req.user.id]);

  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { width: 200 });
  res.json({ secret: secretB32, qr_data_url: qrDataUrl });
}

// Setup sem autenticação — usado quando o login força configuração do 2FA
// Recebe email+senha para identificar o usuário
async function setup2FAPublic(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Credenciais obrigatórias' });

  const { rows } = await pool.query(
    'SELECT id, email, role, password_hash, ativo FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  const user = rows[0];
  if (!user || !await require('bcryptjs').compare(password, user.password_hash))
    return res.status(401).json({ error: 'Credenciais inválidas' });
  if (!user.ativo) return res.status(403).json({ error: 'Conta desativada' });
  if (!SENSITIVE_ROLES.includes(user.role))
    return res.status(403).json({ error: 'Não aplicável' });

  const { Secret, TOTP } = require('otpauth');
  const QRCode = require('qrcode');

  const secret = new Secret({ size: 20 });
  const secretB32 = secret.base32;
  const totp = new TOTP({ issuer: 'L7 Talents', label: user.email, algorithm: 'SHA1', digits: 6, period: 30, secret });
  await pool.query('UPDATE users SET totp_secret = $1, totp_enabled = false WHERE id = $2', [secretB32, user.id]);
  const qrDataUrl = await QRCode.toDataURL(totp.toString(), { width: 200 });
  res.json({ secret: secretB32, qr_data_url: qrDataUrl });
}

async function verify2FA(req, res) {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código obrigatório' });

  const { rows } = await pool.query('SELECT totp_secret FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0]?.totp_secret) return res.status(400).json({ error: '2FA não configurado' });

  const totp = getTOTP(rows[0].totp_secret);
  const delta = totp.validate({ token: code.replace(/\s/g, ''), window: 2 });
  if (delta === null) return res.status(401).json({ error: 'Código inválido' });

  await pool.query('UPDATE users SET totp_enabled = true WHERE id = $1', [req.user.id]);
  res.json({ message: '2FA ativado com sucesso' });
}

// Verify sem auth — usado no fluxo de primeiro acesso (setup_required)
async function verify2FAPublic(req, res) {
  const { email, password, code } = req.body;
  if (!email || !password || !code) return res.status(400).json({ error: 'Campos obrigatórios' });

  const { rows } = await pool.query(
    'SELECT id, email, role, password_hash, ativo, totp_secret, updated_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  const user = rows[0];
  if (!user || !await require('bcryptjs').compare(password, user.password_hash))
    return res.status(401).json({ error: 'Credenciais inválidas' });
  if (!user.totp_secret) return res.status(400).json({ error: '2FA não configurado' });

  const totp = getTOTP(user.totp_secret);
  const delta = totp.validate({ token: code.replace(/\s/g, ''), window: 2 });
  if (delta === null) return res.status(401).json({ error: 'Código inválido' });

  await pool.query('UPDATE users SET totp_enabled = true WHERE id = $1', [user.id]);
  res.json({ message: '2FA ativado com sucesso' });
}

async function disable2FA(req, res) {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código obrigatório para desativar 2FA' });

  const { rows } = await pool.query('SELECT totp_secret FROM users WHERE id = $1', [req.user.id]);
  if (!rows[0]?.totp_secret) return res.status(400).json({ error: '2FA não configurado' });

  const totp = getTOTP(rows[0].totp_secret);
  const delta = totp.validate({ token: code.replace(/\s/g, ''), window: 2 });
  if (delta === null) return res.status(401).json({ error: 'Código inválido' });

  await pool.query('UPDATE users SET totp_secret = NULL, totp_enabled = false WHERE id = $1', [req.user.id]);
  res.json({ message: '2FA desativado' });
}
// ─────────────────────────────────────────────────────────────────────────

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
    if (exists.rows.length > 0)
      return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email.toLowerCase(), hash, role]
    );
    const user = rows[0];

    if (role === 'candidato') {
      await client.query('INSERT INTO candidatos (user_id, nome) VALUES ($1, $2)', [user.id, nome]);
    } else if (role === 'empregador') {
      await client.query(
        'INSERT INTO empregadores (user_id, nome_contato, razao_social) VALUES ($1, $2, $3)',
        [user.id, nome, razao_social || nome]
      );
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

async function login(req, res) {
  const { email, password, totp_code } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha obrigatórios' });

  try {
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role, ativo, updated_at, totp_secret, totp_enabled FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash))
      return res.status(401).json({ error: 'Credenciais inválidas' });

    if (!user.ativo)
      return res.status(403).json({ error: 'Conta desativada' });

    // 2FA sempre obrigatório para roles sensíveis
    if (SENSITIVE_ROLES.includes(user.role)) {
      if (!user.totp_secret) {
        // Forçar setup apenas para roles que exigem 2FA obrigatório
        if (FORCE_2FA_ROLES.includes(user.role))
          return res.status(202).json({ requires_2fa_setup: true, message: 'Configure o 2FA para continuar' });
        // admin sem 2FA configurado → entra normalmente
      } else {
        // Tem segredo — exigir código
        if (!totp_code)
          return res.status(202).json({ requires_2fa: true, message: 'Informe o código 2FA' });

        const totp = getTOTP(user.totp_secret);
        const delta = totp.validate({ token: totp_code.replace(/\s/g, ''), window: 2 });
        if (delta === null)
          return res.status(401).json({ error: 'Código 2FA inválido' });

        if (!user.totp_enabled)
          await pool.query('UPDATE users SET totp_enabled = true WHERE id = $1', [user.id]);
      }
    }

    const token = generateToken(user, req);
    setTokenCookie(res, token, user.role);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
      session_ttl: getTTL(user.role).cookie,
      totp_enabled: user.totp_enabled,
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

async function me(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, created_at, totp_enabled FROM users WHERE id = $1',
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

async function changePassword(req, res) {
  const { senha_atual, nova_senha } = req.body;
  if (!senha_atual || !nova_senha)
    return res.status(400).json({ error: 'Campos obrigatórios: senha_atual, nova_senha' });
  if (nova_senha.length < 8)
    return res.status(400).json({ error: 'Nova senha deve ter no mínimo 8 caracteres' });

  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0] || !await bcrypt.compare(senha_atual, rows[0].password_hash))
      return res.status(401).json({ error: 'Senha atual incorreta' });

    const hash = await bcrypt.hash(nova_senha, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error(err);
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

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [rows[0].id, token, expires]
    );

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/pages/reset-senha.html?token=${token}`;

    if (process.env.SMTP_HOST) {
      const nodemailer = require('nodemailer');
      const port = parseInt(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Recuperação de senha - L7 Talents',
        html: `<p>Clique no link para redefinir sua senha (válido por 1 hora):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
      });
    } else {
      console.log(`[RESET] ${resetUrl}`);
    }

    res.json({ message: 'Se o email existir, você receberá as instruções.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao solicitar recuperação' });
  }
}

async function confirmReset(req, res) {
  const { token, nova_senha } = req.body;
  if (!token || !nova_senha)
    return res.status(400).json({ error: 'Token e nova senha obrigatórios' });
  if (nova_senha.length < 8)
    return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );
    if (!rows[0]) return res.status(400).json({ error: 'Token inválido ou expirado' });

    const hash = await bcrypt.hash(nova_senha, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, rows[0].user_id]);
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [rows[0].id]);

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
}

module.exports = { register, login, me, refresh, changePassword, requestReset, confirmReset, setup2FA, setup2FAPublic, verify2FA, verify2FAPublic, disable2FA };
