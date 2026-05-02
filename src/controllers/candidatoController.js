const { pool } = require('../db');

async function getPerfil(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, 
        json_agg(DISTINCT e.*) FILTER (WHERE e.id IS NOT NULL) AS experiencias,
        json_agg(DISTINCT f.*) FILTER (WHERE f.id IS NOT NULL) AS formacoes
       FROM candidatos c
       LEFT JOIN experiencias e ON e.candidato_id = c.id
       LEFT JOIN formacoes f ON f.candidato_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Perfil não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
}

async function updatePerfil(req, res) {
  const campos = ['nome','telefone','cidade','estado','linkedin','github','portfolio',
    'cargo_desejado','area_atuacao','nivel_experiencia','pretensao_salarial',
    'disponibilidade','modalidade','resumo_profissional','habilidades'];
  
  const sets = [], vals = [];
  campos.forEach(c => {
    if (req.body[c] !== undefined) {
      sets.push(`${c} = $${sets.length + 1}`);
      vals.push(req.body[c]);
    }
  });

  if (!sets.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  vals.push(req.user.id);

  try {
    const { rows } = await pool.query(
      `UPDATE candidatos SET ${sets.join(', ')} WHERE user_id = $${vals.length} RETURNING *`,
      vals
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
}

async function addExperiencia(req, res) {
  const { empresa, cargo, data_inicio, data_fim, atual, descricao } = req.body;
  if (!empresa || !cargo || !data_inicio)
    return res.status(400).json({ error: 'empresa, cargo e data_inicio são obrigatórios' });

  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    const { rows } = await pool.query(
      'INSERT INTO experiencias (candidato_id, empresa, cargo, data_inicio, data_fim, atual, descricao) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [cand.rows[0].id, empresa, cargo, data_inicio, data_fim || null, atual || false, descricao]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar experiência' });
  }
}

async function deleteExperiencia(req, res) {
  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    await pool.query(
      'DELETE FROM experiencias WHERE id = $1 AND candidato_id = $2',
      [req.params.id, cand.rows[0].id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover experiência' });
  }
}

async function addFormacao(req, res) {
  const { instituicao, curso, nivel, data_inicio, data_fim, em_andamento } = req.body;
  if (!instituicao || !curso || !nivel || !data_inicio)
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    const { rows } = await pool.query(
      'INSERT INTO formacoes (candidato_id, instituicao, curso, nivel, data_inicio, data_fim, em_andamento) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [cand.rows[0].id, instituicao, curso, nivel, data_inicio, data_fim || null, em_andamento || false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar formação' });
  }
}

async function deleteFormacao(req, res) {
  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    await pool.query(
      'DELETE FROM formacoes WHERE id = $1 AND candidato_id = $2',
      [req.params.id, cand.rows[0].id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover formação' });
  }
}

async function getCandidaturas(req, res) {
  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    const { rows } = await pool.query(
      `SELECT ca.*, v.titulo, v.modalidade, v.tipo_contrato, v.cidade, v.estado,
              e.razao_social AS empresa, e.logo_url
       FROM candidaturas ca
       JOIN vagas v ON v.id = ca.vaga_id
       JOIN empregadores e ON e.id = v.empregador_id
       WHERE ca.candidato_id = $1
       ORDER BY ca.created_at DESC`,
      [cand.rows[0].id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar candidaturas' });
  }
}

async function getVagasSalvas(req, res) {
  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    const { rows } = await pool.query(
      `SELECT vs.id, vs.created_at, v.*, e.razao_social AS empresa, e.logo_url
       FROM vagas_salvas vs
       JOIN vagas v ON v.id = vs.vaga_id
       JOIN empregadores e ON e.id = v.empregador_id
       WHERE vs.candidato_id = $1
       ORDER BY vs.created_at DESC`,
      [cand.rows[0].id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vagas salvas' });
  }
}

async function salvarVaga(req, res) {
  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    await pool.query(
      'INSERT INTO vagas_salvas (candidato_id, vaga_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [cand.rows[0].id, req.params.vagaId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar vaga' });
  }
}

async function removerVagaSalva(req, res) {
  try {
    const cand = await pool.query('SELECT id FROM candidatos WHERE user_id = $1', [req.user.id]);
    await pool.query(
      'DELETE FROM vagas_salvas WHERE candidato_id = $1 AND vaga_id = $2',
      [cand.rows[0].id, req.params.vagaId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover vaga salva' });
  }
}

module.exports = {
  getPerfil, updatePerfil,
  addExperiencia, deleteExperiencia,
  addFormacao, deleteFormacao,
  getCandidaturas, getVagasSalvas, salvarVaga, removerVagaSalva
};
