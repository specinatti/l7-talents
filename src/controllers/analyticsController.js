const { pool } = require('../db');

// Log de erros em memória (últimos 100)
const errorLog = [];
function logError(req, err) {
  errorLog.unshift({ ts: new Date().toISOString(), path: req?.path, method: req?.method, error: err?.message });
  if (errorLog.length > 100) errorLog.pop();
}
module.exports.logError = logError;

const startTime = Date.now();

async function getMonitor(req, res) {
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    const [users, vagas, candidaturas] = await Promise.all([
      pool.query('SELECT COUNT(*) total FROM users WHERE ativo=true'),
      pool.query('SELECT COUNT(*) total FROM vagas WHERE status=\'ativa\''),
      pool.query('SELECT COUNT(*) total FROM candidaturas WHERE created_at >= NOW() - INTERVAL \'24 hours\''),
    ]);

    const mem = process.memoryUsage();
    res.json({
      status: 'ok',
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      uptime_human: formatUptime(Date.now() - startTime),
      node_version: process.version,
      memory_mb: Math.round(mem.rss / 1024 / 1024),
      db_latency_ms: dbLatency,
      db_status: dbLatency < 500 ? 'ok' : 'lento',
      stats: {
        usuarios_ativos: parseInt(users.rows[0].total),
        vagas_ativas: parseInt(vagas.rows[0].total),
        candidaturas_24h: parseInt(candidaturas.rows[0].total),
      },
      recent_errors: errorLog.slice(0, 20),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

async function getAnalytics(req, res) {
  try {
    const [
      usuarios, vagas, candidaturas, empresas,
      crescimentoUsuarios, crescimentoCandidaturas,
      vagasPorArea, candidaturasPorStatus,
      topEmpresas, ultimasCandidaturas,
      usuariosPorDia
    ] = await Promise.all([
      // Totais gerais
      pool.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE role='candidato') candidatos, COUNT(*) FILTER (WHERE role='empregador') empregadores FROM users WHERE ativo=true`),
      pool.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status='ativa') ativas, COUNT(*) FILTER (WHERE status='encerrada') encerradas FROM vagas`),
      pool.query(`SELECT COUNT(*) total FROM candidaturas`),
      pool.query(`SELECT COUNT(*) total FROM empregadores`),

      // Crescimento: novos usuários por mês (últimos 6 meses)
      pool.query(`SELECT TO_CHAR(created_at,'YYYY-MM') mes, COUNT(*) total FROM users WHERE created_at >= NOW() - INTERVAL '6 months' GROUP BY mes ORDER BY mes`),

      // Candidaturas por mês (últimos 6 meses)
      pool.query(`SELECT TO_CHAR(created_at,'YYYY-MM') mes, COUNT(*) total FROM candidaturas WHERE created_at >= NOW() - INTERVAL '6 months' GROUP BY mes ORDER BY mes`),

      // Vagas por área
      pool.query(`SELECT area, COUNT(*) total FROM vagas WHERE area IS NOT NULL GROUP BY area ORDER BY total DESC LIMIT 8`),

      // Candidaturas por status
      pool.query(`SELECT status, COUNT(*) total FROM candidaturas GROUP BY status ORDER BY total DESC`),

      // Top empresas por vagas
      pool.query(`SELECT e.razao_social empresa, COUNT(v.id) vagas, SUM(v.visualizacoes) visualizacoes FROM empregadores e LEFT JOIN vagas v ON v.empregador_id=e.id GROUP BY e.id, e.razao_social ORDER BY vagas DESC LIMIT 5`),

      // Últimas candidaturas
      pool.query(`SELECT c.nome candidato, v.titulo vaga, e.razao_social empresa, ca.status, ca.created_at FROM candidaturas ca JOIN candidatos c ON c.id=ca.candidato_id JOIN vagas v ON v.id=ca.vaga_id JOIN empregadores e ON e.id=v.empregador_id ORDER BY ca.created_at DESC LIMIT 10`),

      // Usuários por dia (últimos 30 dias)
      pool.query(`SELECT TO_CHAR(created_at,'DD/MM') dia, COUNT(*) total FROM users WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY dia, DATE(created_at) ORDER BY DATE(created_at)`),
    ]);

    res.json({
      totais: {
        usuarios: parseInt(usuarios.rows[0].total),
        candidatos: parseInt(usuarios.rows[0].candidatos),
        empregadores: parseInt(usuarios.rows[0].empregadores),
        vagas: parseInt(vagas.rows[0].total),
        vagasAtivas: parseInt(vagas.rows[0].ativas),
        candidaturas: parseInt(candidaturas.rows[0].total),
      },
      crescimentoUsuarios: crescimentoUsuarios.rows,
      crescimentoCandidaturas: crescimentoCandidaturas.rows,
      vagasPorArea: vagasPorArea.rows,
      candidaturasPorStatus: candidaturasPorStatus.rows,
      topEmpresas: topEmpresas.rows,
      ultimasCandidaturas: ultimasCandidaturas.rows,
      usuariosPorDia: usuariosPorDia.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar analytics' });
  }
}

module.exports = { getAnalytics, getMonitor, logError };
