const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function register(req, res) {
  const { email, password, role, nome, razao_social } = req.body;

  if (!email || !password || !role || !nome)
    return res.status(400).json({ error: 'Campos obrigatórios: email, password, role, nome' });

  if (!['candidato', 'empregador'].includes(role))
    return res.status(400).json({ error: 'Role inválido' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });

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
      await client.query(
        'INSERT INTO candidatos (user_id, nome) VALUES ($1, $2)',
        [user.id, nome]
      );
    } else {
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
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha obrigatórios' });

  try {
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role, ativo FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = rows[0];

    if (!user || !await bcrypt.compare(password, user.password_hash))
      return res.status(401).json({ error: 'Credenciais inválidas' });

    if (!user.ativo)
      return res.status(403).json({ error: 'Conta desativada' });

    res.json({ token: generateToken(user), user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

async function me(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
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
  if (nova_senha.length < 6)
    return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });

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
    // Sempre retorna 200 para não revelar se email existe
    if (!rows[0]) return res.json({ message: 'Se o email existir, você receberá as instruções.' });

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [rows[0].id, token, expires]
    );

    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/pages/reset-senha.html?token=${token}`;

    // Enviar email se SMTP configurado
    if (process.env.SMTP_HOST) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@l7talents.com',
        to: email,
        subject: 'Recuperação de senha - L7 Talents',
        html: `<p>Clique no link para redefinir sua senha (válido por 1 hora):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
      });
    } else {
      console.log(`[RESET] Token para ${email}: ${resetUrl}`);
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
  if (nova_senha.length < 6)
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });

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

module.exports = { register, login, me, changePassword, requestReset, confirmReset };
