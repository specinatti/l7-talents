const { pool } = require('../db');
const { sendWhatsApp } = require('../utils/whatsapp');
const APP_URL = process.env.APP_URL || 'https://l7-talents-production.up.railway.app';

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

    // Notificar empregador via WhatsApp (fire-and-forget)
    pool.query(
      `SELECT e.whatsapp, u_c.email AS cand_email, c.nome AS cand_nome, v.titulo
       FROM vagas v
       JOIN empregadores e ON e.id = v.empregador_id
       JOIN candidatos c ON c.id = $1
       JOIN users u_c ON u_c.id = c.user_id
       WHERE v.id = $2`,
      [cand.rows[0].id, req.params.id]
    ).then(r => {
      const d = r.rows[0];
      if (d?.whatsapp) {
        sendWhatsApp(d.whatsapp,
          `Nova candidatura recebida! 🎯\n\n*${d.cand_nome}* se candidatou para *${d.titulo}*.\n\nVer candidatos: ${APP_URL}/pages/empregador/candidatos.html`
        );
      }
    }).catch(() => {});
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Você já se candidatou a esta vaga' });
    res.status(500).json({ error: 'Erro ao candidatar' });
  }
}

async function vagasRecomendadas(req, res) {
  try {
    const { rows: perfil } = await pool.query(
      'SELECT area_atuacao, nivel_experiencia, modalidade, estado, cidade, pretensao_salarial, habilidades FROM candidatos WHERE user_id = $1',
      [req.user.id]
    );
    if (!perfil[0]) return res.json({ vagas: [] });
    const c = perfil[0];

    const { rows: vagas } = await pool.query(
      `SELECT v.*, e.razao_social empresa, e.cidade emp_cidade, e.estado emp_estado
       FROM vagas v JOIN empregadores e ON e.id = v.empregador_id
       WHERE v.status = 'ativa' ORDER BY v.destaque DESC, v.created_at DESC LIMIT 50`
    );

    const scored = vagas.map(v => {
      let score = 0;
      if (c.area_atuacao && v.area && c.area_atuacao.toLowerCase() === v.area.toLowerCase()) score += 40;
      if (c.nivel_experiencia && v.nivel && c.nivel_experiencia.toLowerCase() === v.nivel.toLowerCase()) score += 20;
      if (c.modalidade && v.modalidade && c.modalidade.toLowerCase() === v.modalidade.toLowerCase()) score += 15;
      if (c.estado && v.estado && c.estado === v.estado) score += 10;
      if (c.cidade && v.cidade && c.cidade.toLowerCase() === v.cidade.toLowerCase()) score += 5;
      if (c.pretensao_salarial && v.salario_max && Number(c.pretensao_salarial) <= Number(v.salario_max)) score += 5;
      if (c.habilidades?.length && v.habilidades?.length) {
        const match = c.habilidades.filter(h => v.habilidades.some(vh => vh.toLowerCase().includes(h.toLowerCase())));
        score += Math.min(match.length * 5, 25);
      }
      return { ...v, match_score: score };
    })
    .filter(v => v.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 20);

    res.json({ vagas: scored });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vagas recomendadas' });
  }
}

module.exports = { listarVagas, getVaga, candidatar, vagasRecomendadas };
