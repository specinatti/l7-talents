const router = require('express').Router();
const { auth, role } = require('../middleware/auth');
const { pool } = require('../db');
const bcrypt = require('bcryptjs');

router.use(auth, role('admin'));

// Listar usuários administrativos
router.get('/usuarios', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, email_alternativo, role, ativo, created_at
       FROM users WHERE role IN ('admin','rh','financeiro')
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Criar novo usuário administrativo
router.post('/usuarios', async (req, res) => {
  const { email, password, nome, role: newRole } = req.body;
  if (!email || !password || !nome || !newRole)
    return res.status(400).json({ error: 'Campos obrigatórios: email, password, nome, role' });
  if (!['admin','rh','financeiro'].includes(newRole))
    return res.status(400).json({ error: 'Role inválido' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1,$2,$3) RETURNING id, email, role',
      [email.toLowerCase(), hash, newRole]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Ativar/desativar usuário
router.put('/usuarios/:id', async (req, res) => {
  const { ativo } = req.body;
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Não é possível alterar sua própria conta' });
  try {
    await pool.query('UPDATE users SET ativo = $1 WHERE id = $2 AND role IN (\'admin\',\'rh\',\'financeiro\')', [ativo, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

module.exports = router;
