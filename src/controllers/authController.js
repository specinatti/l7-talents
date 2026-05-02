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

module.exports = { register, login, me };
