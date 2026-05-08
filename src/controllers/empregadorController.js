const { pool } = require('../db');

async function getPerfil(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM empregadores WHERE user_id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Perfil não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
}

async function updatePerfil(req, res) {
  const campos = ['nome_contato','razao_social','nome_fantasia','cnpj','setor','porte',
    'site','linkedin','telefone','whatsapp','cidade','estado','descricao'];
  const sets = [], vals = [];
  campos.forEach(c => {
    if (req.body[c] !== undefined) { sets.push(`${c} = $${sets.length+1}`); vals.push(req.body[c]); }
  });
  if (!sets.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  vals.push(req.user.id);
  try {
    const { rows } = await pool.query(
      `UPDATE empregadores SET ${sets.join(', ')} WHERE user_id = $${vals.length} RETURNING *`, vals
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
}

async function criarVaga(req, res) {
  const { titulo, descricao, requisitos, beneficios, area, nivel, modalidade, tipo_contrato,
    salario_min, salario_max, salario_oculto, cidade, estado, habilidades } = req.body;
  if (!titulo || !descricao) return res.status(400).json({ error: 'titulo e descricao são obrigatórios' });

  try {
    const emp = await pool.query('SELECT id FROM empregadores WHERE user_id = $1', [req.user.id]);
    const { rows } = await pool.query(
      `INSERT INTO vagas (empregador_id, titulo, descricao, requisitos, beneficios, area, nivel,
        modalidade, tipo_contrato, salario_min, salario_max, salario_oculto, cidade, estado, habilidades)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [emp.rows[0].id, titulo, descricao, requisitos, beneficios, area, nivel,
       modalidade, tipo_contrato, salario_min, salario_max, salario_oculto || false,
       cidade, estado, habilidades || []]
    );
    const vaga = rows[0];
    res.status(201).json(vaga);

    // Notificar candidatos com match (fire-and-forget)
    notificarCandidatosMatch(vaga).catch(() => {});
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar vaga' });
  }
}

async function notificarCandidatosMatch(vaga) {
  // Buscar candidatos com alertas ativos e perfil compatível
  let query = `SELECT c.*, u.email FROM candidatos c JOIN users u ON u.id=c.user_id
    WHERE c.alertas_vagas=true AND u.ativo=true`;
  const params = [];
  if (vaga.area) { params.push(vaga.area); query += ` AND (c.area_atuacao=$${params.length} OR c.area_atuacao IS NULL)`; }

  const { rows: candidatos } = await pool.query(query, params);

  for (const c of candidatos) {
    // Calcular score básico
    let score = 0;
    if (vaga.area && c.area_atuacao?.toLowerCase() === vaga.area.toLowerCase()) score += 40;
    if (vaga.nivel && c.nivel_experiencia?.toLowerCase() === vaga.nivel.toLowerCase()) score += 20;
    if (vaga.modalidade && c.modalidade?.toLowerCase() === vaga.modalidade.toLowerCase()) score += 15;
    if (vaga.estado && c.estado === vaga.estado) score += 10;
    if (score < 40) continue; // só notifica se tiver match relevante

    // Criar notificação interna
    await pool.query(
      `INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link)
       VALUES ($1,'nova_vaga',$2,$3,$4)`,
      [c.user_id, `Nova vaga: ${vaga.titulo}`,
       `Uma vaga compatível com seu perfil foi publicada: ${vaga.titulo}`,
       `/pages/vaga.html?id=${vaga.id}`]
    );

    // Email se alerta_email ativo e SMTP configurado
    if (c.alerta_email && process.env.SMTP_HOST) {
      try {
        const nodemailer = require('nodemailer');
        const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: process.env.SMTP_PORT||587, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
        await t.sendMail({
          from: process.env.SMTP_FROM || 'noreply@l7talents.online',
          to: c.email,
          subject: `Nova vaga para você: ${vaga.titulo}`,
          html: `<p>Olá ${c.nome},</p><p>Uma nova vaga compatível com seu perfil foi publicada:</p><h3>${vaga.titulo}</h3><p>${vaga.area||''} · ${vaga.modalidade||''} · ${vaga.cidade||''}</p><a href="${process.env.APP_URL||'https://l7-talents-production.up.railway.app'}/pages/vaga.html?id=${vaga.id}">Ver vaga</a>`
        });
      } catch {}
    }

    // WhatsApp link (apenas registra — envio manual via dashboard RH)
    if (c.alerta_whatsapp && c.whatsapp) {
      const msg = `Olá ${c.nome}! Nova vaga compatível: *${vaga.titulo}*. Acesse: ${process.env.APP_URL||'https://l7-talents-production.up.railway.app'}/pages/vaga.html?id=${vaga.id}`;
      await pool.query(
        `INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, link) VALUES ($1,'alerta_whatsapp',$2,$3,$4)`,
        [c.user_id, `WhatsApp: ${vaga.titulo}`, msg,
         `https://wa.me/55${c.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`]
      );
    }
  }
}

async function getMinhasVagas(req, res) {
  try {
    const emp = await pool.query('SELECT id FROM empregadores WHERE user_id = $1', [req.user.id]);
    const { rows } = await pool.query(
      `SELECT v.*, (SELECT COUNT(*) FROM candidaturas WHERE vaga_id = v.id) AS total_candidatos
       FROM vagas v WHERE v.empregador_id = $1 ORDER BY v.created_at DESC`,
      [emp.rows[0].id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
}

async function updateVaga(req, res) {
  const campos = ['titulo','descricao','requisitos','beneficios','area','nivel','modalidade',
    'tipo_contrato','salario_min','salario_max','salario_oculto','cidade','estado','habilidades','status','destaque'];
  const sets = [], vals = [];
  campos.forEach(c => {
    if (req.body[c] !== undefined) { sets.push(`${c} = $${sets.length+1}`); vals.push(req.body[c]); }
  });
  if (!sets.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

  try {
    const emp = await pool.query('SELECT id FROM empregadores WHERE user_id = $1', [req.user.id]);
    vals.push(req.params.id, emp.rows[0].id);
    const { rows } = await pool.query(
      `UPDATE vagas SET ${sets.join(', ')} WHERE id = $${vals.length-1} AND empregador_id = $${vals.length} RETURNING *`,
      vals
    );
    if (!rows[0]) return res.status(404).json({ error: 'Vaga não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar vaga' });
  }
}

async function getCandidatos(req, res) {
  try {
    const emp = await pool.query('SELECT id FROM empregadores WHERE user_id = $1', [req.user.id]);
    const { rows } = await pool.query(
      `SELECT ca.*, c.nome, c.telefone, c.linkedin, c.cargo_desejado, c.nivel_experiencia,
              c.habilidades, u.email
       FROM candidaturas ca
       JOIN candidatos c ON c.id = ca.candidato_id
       JOIN users u ON u.id = c.user_id
       JOIN vagas v ON v.id = ca.vaga_id
       WHERE v.empregador_id = $1 AND ($2::uuid IS NULL OR ca.vaga_id = $2)
       ORDER BY ca.created_at DESC`,
      [emp.rows[0].id, req.query.vaga_id || null]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar candidatos' });
  }
}

async function updateStatusCandidatura(req, res) {
  const { status, feedback } = req.body;
  const statusValidos = ['enviada','visualizada','em_analise','entrevista','aprovado','reprovado'];
  if (!statusValidos.includes(status)) return res.status(400).json({ error: 'Status inválido' });

  try {
    const emp = await pool.query('SELECT id FROM empregadores WHERE user_id = $1', [req.user.id]);
    const { rows } = await pool.query(
      `UPDATE candidaturas SET status = $1, feedback = $2
       WHERE id = $3 AND vaga_id IN (SELECT id FROM vagas WHERE empregador_id = $4)
       RETURNING *`,
      [status, feedback || null, req.params.id, emp.rows[0].id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Candidatura não encontrada' });

    // Notificar candidato
    await pool.query(
      `INSERT INTO notificacoes (user_id, tipo, titulo, mensagem)
       SELECT u.id, 'candidatura', $1, $2
       FROM candidatos c JOIN users u ON u.id = c.user_id
       WHERE c.id = $3`,
      [`Atualização na sua candidatura`, `Sua candidatura foi atualizada para: ${status}`, rows[0].candidato_id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar candidatura' });
  }
}

async function getDashboard(req, res) {
  try {
    const emp = await pool.query('SELECT id FROM empregadores WHERE user_id = $1', [req.user.id]);
    const empId = emp.rows[0].id;

    const [vagas, candidaturas, visualizacoes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM vagas WHERE empregador_id = $1 AND status = $2', [empId, 'ativa']),
      pool.query('SELECT COUNT(*) FROM candidaturas ca JOIN vagas v ON v.id = ca.vaga_id WHERE v.empregador_id = $1', [empId]),
      pool.query('SELECT COALESCE(SUM(visualizacoes),0) FROM vagas WHERE empregador_id = $1', [empId]),
    ]);

    res.json({
      vagas_ativas: parseInt(vagas.rows[0].count),
      total_candidaturas: parseInt(candidaturas.rows[0].count),
      total_visualizacoes: parseInt(visualizacoes.rows[0].coalesce),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
}

module.exports = {
  getPerfil, updatePerfil,
  criarVaga, getMinhasVagas, updateVaga,
  getCandidatos, updateStatusCandidatura,
  getDashboard
};
