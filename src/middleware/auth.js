const jwt = require('jsonwebtoken');
const { pool } = require('../db');

async function auth(req, res, next) {
  // Aceitar token do cookie httpOnly (seguro) OU do header Authorization (retrocompatibilidade)
  const token = req.cookies?.auth_token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validar fingerprint: IP e User-Agent devem bater
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

module.exports = { auth, role };
