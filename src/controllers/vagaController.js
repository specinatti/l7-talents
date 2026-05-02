const { pool } = require('../db');

// Público: listar vagas com filtros
async function listarVagas(req, res) {
  const { q, area, modalidade, nivel, tipo_contrato, estado, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const conds = ["v.status = 'ativa'"], vals = [];

  if (q) { conds.push(`(v.titulo ILIKE $${vals.length+1} OR v.descricao ILIKE $${vals.length+1})`); vals.push(`%${q}%`); }
  if (area) { conds.push(`v.area = $${vals.length+1}`); vals.push(area); }
  if (modalidade) { conds.push(`v.modalidade = $${vals.length+1}`); vals.push(modalidade); }
  if (nivel) { conds.push(`v.nivel = $${vals.length+1}`); vals.push(nivel); }
  if (tipo_contrato) { conds.push(`v.tipo_contrato = $${vals.length+1}`); vals.push(tipo_contrato); }
  if (estado) { conds.push(`v.estado = $${vals.length+1}`); vals.push(estado); }

  const where = conds.join(' AND ');
  try {
    const [{ rows }, count] = await Promise.all([
      pool.query(
        `SELECT v.*, e.razao_social AS empresa, e.logo_url, e.cidade AS emp_cidade,
                (SELECT COUNT(*) FROM candidaturas WHERE vaga_id = v.id) AS total_candidatos
         FROM vagas v JOIN empregadores e ON e.id = v.empregador_id
         WHERE ${where} ORDER BY v.destaque DESC, v.created_at DESC
         LIMIT $${vals.length+1} OFFSET $${vals.length+2}`,
        [...vals, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM vagas v WHERE ${where}`, vals)
    ]);
    res.json({ vagas: rows, total: parseInt(count.rows[0].count), page: +page, limit: +limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
}

// Público: detalhe de uma vaga
async function getVaga(req, res) {
  try {
    await pool.query('UPDATE vagas SET visualizacoes = visualizacoes + 1 WHERE id = $1', [req.params.id]);
    const { rows } = await pool.query(
      `SELECT v.*, e.razao_social AS empresa, e.nome_fantasia, e.logo_url, e.site,
              e.setor, e.porte, e.descricao AS empresa_descricao, e.cidade AS emp_cidade, e.estado AS emp_estado,
              (SELECT COUNT(*) FROM candidaturas WHERE vaga_id = v.id) AS total_candidatos
       FROM vagas v JOIN empregadores e ON e.id = v.empregador_id
       WHERE v.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Vaga não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vaga' });
  }
}

// Candidato: se candidatar
async function candidatar(req, res) {
  const { carta_apresentacao } = req.body;
  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    if (!cand.rows[0]) return res.status(404).json({ error: 'Perfil de candidato não encontrado' });

    const { rows } = await pool.query(
      'INSERT INTO candidaturas (vaga_id, candidato_id, carta_apresentacao) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, cand.rows[0].id, carta_apresentacao || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Você já se candidatou a esta vaga' });
    res.status(500).json({ error: 'Erro ao candidatar' });
  }
}

module.exports = { listarVagas, getVaga, candidatar };
