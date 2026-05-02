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
  // Cache simples em memória: 2 minutos
  const now = Date.now();
  if (getAnalytics._cache && now - getAnalytics._cacheTs < 120000) {
    return res.json(getAnalytics._cache);
  }

  try {
    // Queries paralelas otimizadas — totais em uma só query cada
    const [totais, crescUsers, crescCand, areas, status, empresas, ultimas, porDia] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE ativo=true) usuarios,
          (SELECT COUNT(*) FROM users WHERE ativo=true AND role='candidato') candidatos,
          (SELECT COUNT(*) FROM users WHERE ativo=true AND role='empregador') empregadores,
          (SELECT COUNT(*) FROM vagas) vagas,
          (SELECT COUNT(*) FROM vagas WHERE status='ativa') vagas_ativas,
          (SELECT COUNT(*) FROM candidaturas) candidaturas
      `),
      pool.query(`SELECT TO_CHAR(DATE_TRUNC('month',created_at),'YYYY-MM') mes, COUNT(*) total FROM users WHERE created_at >= NOW()-INTERVAL '6 months' GROUP BY 1 ORDER BY 1`),
      pool.query(`SELECT TO_CHAR(DATE_TRUNC('month',created_at),'YYYY-MM') mes, COUNT(*) total FROM candidaturas WHERE created_at >= NOW()-INTERVAL '6 months' GROUP BY 1 ORDER BY 1`),
      pool.query(`SELECT area, COUNT(*) total FROM vagas WHERE area IS NOT NULL GROUP BY area ORDER BY total DESC LIMIT 8`),
      pool.query(`SELECT status, COUNT(*) total FROM candidaturas GROUP BY status ORDER BY total DESC`),
      pool.query(`SELECT e.razao_social empresa, COUNT(v.id) vagas, COALESCE(SUM(v.visualizacoes),0) visualizacoes FROM empregadores e LEFT JOIN vagas v ON v.empregador_id=e.id GROUP BY e.id,e.razao_social ORDER BY vagas DESC LIMIT 5`),
      pool.query(`SELECT c.nome candidato, v.titulo vaga, e.razao_social empresa, ca.status, ca.created_at FROM candidaturas ca JOIN candidatos c ON c.id=ca.candidato_id JOIN vagas v ON v.id=ca.vaga_id JOIN empregadores e ON e.id=v.empregador_id ORDER BY ca.created_at DESC LIMIT 10`),
      pool.query(`SELECT TO_CHAR(DATE_TRUNC('day',created_at),'DD/MM') dia, COUNT(*) total FROM users WHERE created_at >= NOW()-INTERVAL '30 days' GROUP BY 1,DATE_TRUNC('day',created_at) ORDER BY DATE_TRUNC('day',created_at)`),
    ]);

    const t = totais.rows[0];
    const result = {
      totais: { usuarios: +t.usuarios, candidatos: +t.candidatos, empregadores: +t.empregadores, vagas: +t.vagas, vagasAtivas: +t.vagas_ativas, candidaturas: +t.candidaturas },
      crescimentoUsuarios: crescUsers.rows,
      crescimentoCandidaturas: crescCand.rows,
      vagasPorArea: areas.rows,
      candidaturasPorStatus: status.rows,
      topEmpresas: empresas.rows,
      ultimasCandidaturas: ultimas.rows,
      usuariosPorDia: porDia.rows,
    };

    getAnalytics._cache = result;
    getAnalytics._cacheTs = now;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar analytics' });
  }
}

module.exports = { getAnalytics, getMonitor, logError };
