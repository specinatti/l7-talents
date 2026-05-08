const { pool } = require('../db');

async function getDashboard(req, res) {
  try {
    const [totais, empresas, candidatos, vagas, candidaturas, pedidos, comunicados] = await Promise.all([
      pool.query(`SELECT
        (SELECT COUNT(*) FROM users WHERE role='candidato' AND ativo=true) candidatos,
        (SELECT COUNT(*) FROM users WHERE role='empregador' AND ativo=true) empregadores,
        (SELECT COUNT(*) FROM vagas WHERE status='ativa') vagas_ativas,
        (SELECT COUNT(*) FROM candidaturas) candidaturas,
        (SELECT COUNT(*) FROM pedidos WHERE status='aprovado') pacotes_ativos,
        (SELECT COALESCE(SUM(valor),0) FROM pedidos WHERE status='aprovado') receita_total`),
      pool.query(`SELECT e.razao_social, e.setor, e.cidade, e.estado, u.email, u.created_at,
        COUNT(v.id) vagas, COUNT(c.id) candidaturas
        FROM empregadores e
        JOIN users u ON u.id=e.user_id
        LEFT JOIN vagas v ON v.empregador_id=e.id
        LEFT JOIN candidaturas c ON c.vaga_id=v.id
        GROUP BY e.id,e.razao_social,e.setor,e.cidade,e.estado,u.email,u.created_at
        ORDER BY u.created_at DESC LIMIT 20`),
      pool.query(`SELECT c.nome, c.cargo_desejado, c.area_atuacao, c.cidade, c.estado, u.email, u.created_at,
        COUNT(ca.id) candidaturas
        FROM candidatos c
        JOIN users u ON u.id=c.user_id
        LEFT JOIN candidaturas ca ON ca.candidato_id=c.id
        GROUP BY c.id,c.nome,c.cargo_desejado,c.area_atuacao,c.cidade,c.estado,u.email,u.created_at
        ORDER BY u.created_at DESC LIMIT 20`),
      pool.query(`SELECT v.titulo, v.area, v.modalidade, v.status, v.created_at,
        e.razao_social empresa, COUNT(c.id) candidaturas
        FROM vagas v
        JOIN empregadores e ON e.id=v.empregador_id
        LEFT JOIN candidaturas c ON c.vaga_id=v.id
        GROUP BY v.id,v.titulo,v.area,v.modalidade,v.status,v.created_at,e.razao_social
        ORDER BY v.created_at DESC LIMIT 20`),
      pool.query(`SELECT ca.status, ca.created_at, ca.carta_apresentacao,
        c.nome candidato, v.titulo vaga, e.razao_social empresa
        FROM candidaturas ca
        JOIN candidatos c ON c.id=ca.candidato_id
        JOIN vagas v ON v.id=ca.vaga_id
        JOIN empregadores e ON e.id=v.empregador_id
        ORDER BY ca.created_at DESC LIMIT 20`),
      pool.query(`SELECT pacote, valor, status, nome_comprador, empresa, email_comprador, created_at
        FROM pedidos ORDER BY created_at DESC LIMIT 20`),
      pool.query(`SELECT * FROM comunicados ORDER BY created_at DESC LIMIT 10`),
    ]);

    res.json({
      totais: totais.rows[0],
      empresas: empresas.rows,
      candidatos: candidatos.rows,
      vagas: vagas.rows,
      candidaturas: candidaturas.rows,
      pedidos: pedidos.rows,
      comunicados: comunicados.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
}

async function enviarComunicado(req, res) {
  const { titulo, mensagem, destinatario, canal } = req.body;
  if (!titulo || !mensagem || !destinatario || !canal)
    return res.status(400).json({ error: 'Campos obrigatórios: titulo, mensagem, destinatario, canal' });

  try {
    // Buscar destinatários
    let query = `SELECT u.email, COALESCE(c.nome, e.nome_contato) nome,
      COALESCE(c.telefone, e.telefone) telefone
      FROM users u
      LEFT JOIN candidatos c ON c.user_id=u.id
      LEFT JOIN empregadores e ON e.user_id=u.id
      WHERE u.ativo=true`;
    if (destinatario === 'candidatos') query += ` AND u.role='candidato'`;
    else if (destinatario === 'empregadores') query += ` AND u.role='empregador'`;
    else query += ` AND u.role IN ('candidato','empregador')`;

    const { rows: users } = await pool.query(query);

    // Salvar comunicado
    await pool.query(
      `INSERT INTO comunicados (titulo, mensagem, destinatario, canal, enviado_por, total_enviados)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [titulo, mensagem, destinatario, canal, req.user.id, users.length]
    );

    // Enviar emails se SMTP configurado
    let emailsEnviados = 0;
    if ((canal === 'email' || canal === 'ambos') && process.env.SMTP_HOST) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port: process.env.SMTP_PORT || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      for (const u of users) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@l7talents.online',
            to: u.email,
            subject: `L7 Talents: ${titulo}`,
            html: `<div style="font-family:Arial;max-width:600px;margin:0 auto">
              <h2 style="color:#1B2A4A">${titulo}</h2>
              <p>${mensagem.replace(/\n/g,'<br>')}</p>
              <hr><p style="font-size:12px;color:#6b7280">L7 Talents · comercial@l7talents.online</p>
            </div>`
          });
          emailsEnviados++;
        } catch {}
      }
    }

    // Links WhatsApp (retornar para o frontend abrir)
    const whatsappLinks = (canal === 'whatsapp' || canal === 'ambos')
      ? users.filter(u => u.telefone).map(u => ({
          nome: u.nome,
          link: `https://wa.me/55${u.telefone.replace(/\D/g,'')}?text=${encodeURIComponent(`*${titulo}*\n\n${mensagem}`)}`
        }))
      : [];

    res.json({
      sucesso: true,
      total_destinatarios: users.length,
      emails_enviados: emailsEnviados,
      whatsapp_links: whatsappLinks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar comunicado' });
  }
}

module.exports = { getDashboard, enviarComunicado };
