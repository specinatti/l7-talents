const { pool } = require('../db');

async function getMensagens(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT m.*, u.email AS remetente_email,
              CASE WHEN c.user_id = m.remetente_id THEN 'candidato' ELSE 'empregador' END AS remetente_tipo
       FROM mensagens m
       JOIN users u ON u.id = m.remetente_id
       JOIN candidaturas ca ON ca.id = m.candidatura_id
       JOIN candidatos c ON c.id = ca.candidato_id
       WHERE m.candidatura_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.candidaturaId]
    );
    // Marcar como lidas
    await pool.query(
      'UPDATE mensagens SET lida = true WHERE candidatura_id = $1 AND remetente_id != $2',
      [req.params.candidaturaId, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
}

async function enviarMensagem(req, res) {
  const { conteudo } = req.body;
  if (!conteudo?.trim()) return res.status(400).json({ error: 'Conteúdo obrigatório' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO mensagens (candidatura_id, remetente_id, conteudo) VALUES ($1,$2,$3) RETURNING *',
      [req.params.candidaturaId, req.user.id, conteudo.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
}

async function getNotificacoes(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM notificacoes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
}

async function marcarLida(req, res) {
  try {
    await pool.query(
      'UPDATE notificacoes SET lida = true WHERE user_id = $1 AND ($2::uuid IS NULL OR id = $2)',
      [req.user.id, req.params.id || null]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
}

module.exports = { getMensagens, enviarMensagem, getNotificacoes, marcarLida };
