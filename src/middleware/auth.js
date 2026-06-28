const jwt = require('jsonwebtoken');
const { pool } = require('../db');

async function auth(req, res, next) {
  // Aceitar token do cookie httpOnly (seguro) OU do header Authorization (retrocompatibilidade)
  const token = req.cookies?.auth_token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validar fingerprint: IP e User-Agent devem bater (só em produção)
    if (process.env.NODE_ENV === 'production') {
      const currentIp = req.ip || '';
      const currentUa = (req.headers['user-agent'] || '').substring(0, 100);
      if (decoded._ip && decoded._ip !== currentIp) {
        res.clearCookie('auth_token');
        return res.status(401).json({ error: 'Sessão inválida' });
      }
      if (decoded._ua && decoded._ua !== currentUa) {
        res.clearCookie('auth_token');
        return res.status(401).json({ error: 'Sessão inválida' });
      }
    }

    // Invalidar token se senha foi alterada após emissão
    if (decoded._pwt) {
      const { rows } = await pool.query('SELECT updated_at FROM users WHERE id = $1', [decoded.id]);
      if (rows[0] && new Date(rows[0].updated_at).getTime() > decoded._pwt) {
        res.clearCookie('auth_token');
        return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
      }
    }

    req.user = decoded;
    next();
  } catch {
    res.clearCookie('auth_token');
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

function role(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'Acesso negado' });
    next();
  };
}

// Bloqueia empregadores sem plano ativo ou com plano expirado
async function planoAtivo(req, res, next) {
  if (req.user.role !== 'empregador') return next();
  try {
    const { rows } = await pool.query(
      'SELECT plano_ativo, plano_expira_em FROM users WHERE id = $1', [req.user.id]
    );
    const u = rows[0];
    if (!u?.plano_ativo || (u.plano_expira_em && new Date(u.plano_expira_em) < new Date())) {
      return res.status(402).json({ error: 'Plano inativo. Adquira um pacote para acessar o painel.', redirect: '/pages/planos.html' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Erro ao verificar plano' });
  }
}

module.exports = { auth, role, planoAtivo };
