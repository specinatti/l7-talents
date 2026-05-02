const API = '/api';

// Auth helpers
const auth = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
  setSession: (token, user) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); },
  clear: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
  isLogged: () => !!localStorage.getItem('token'),
  redirectIfNotLogged: (role) => {
    const user = auth.getUser();
    if (!user) { window.location.href = '/pages/login.html'; return false; }
    if (role && user.role !== role) { window.location.href = '/pages/login.html'; return false; }
    return true;
  }
};

// HTTP helpers
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  const token = auth.getToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

const get = (path) => api('GET', path);
const post = (path, body) => api('POST', path, body);
const put = (path, body) => api('PUT', path, body);
const del = (path) => api('DELETE', path);

// UI helpers
function showAlert(msg, type = 'error', container = document.body) {
  const el = document.createElement('div');
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  const existing = container.querySelector('.alert');
  if (existing) existing.remove();
  container.prepend(el);
  setTimeout(() => el.remove(), 5000);
}

function setLoading(btn, loading) {
  if (loading) {
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.original || btn.innerHTML;
    btn.disabled = false;
  }
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR');
}

function formatSalary(min, max, oculto) {
  if (oculto) return 'A combinar';
  if (!min && !max) return 'A combinar';
  const fmt = v => v ? `R$ ${Number(v).toLocaleString('pt-BR')}` : '';
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

function statusBadge(status) {
  const map = {
    enviada: ['badge-blue', 'Enviada'],
    visualizada: ['badge-yellow', 'Visualizada'],
    em_analise: ['badge-purple', 'Em análise'],
    entrevista: ['badge-green', 'Entrevista'],
    aprovado: ['badge-green', 'Aprovado ✓'],
    reprovado: ['badge-red', 'Reprovado'],
    ativa: ['badge-green', 'Ativa'],
    pausada: ['badge-yellow', 'Pausada'],
    encerrada: ['badge-gray', 'Encerrada'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function modalidadeBadge(m) {
  const map = { presencial: 'badge-blue', remoto: 'badge-green', hibrido: 'badge-purple' };
  return `<span class="badge ${map[m] || 'badge-gray'}">${m || ''}</span>`;
}

function initNavbar(role) {
  const user = auth.getUser();
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const links = role === 'candidato' ? [
    ['/pages/candidato/dashboard.html','Dashboard'],
    ['/pages/vagas.html','Vagas'],
    ['/pages/candidato/perfil.html','Meu Perfil'],
  ] : role === 'financeiro' ? [
    ['/pages/financeiro/dashboard.html','Analytics'],
  ] : [
    ['/pages/empregador/dashboard.html','Dashboard'],
    ['/pages/empregador/vagas.html','Minhas Vagas'],
    ['/pages/empregador/candidatos.html','Candidatos'],
    ['/pages/empregador/perfil.html','Empresa'],
  ];

  const navLinks = links.map(([href, label]) =>
    `<a href="${href}" class="nav-link">${label}</a>`
  ).join('');

  const drawerLinks = links.map(([href, label]) =>
    `<a href="${href}" class="drawer-item">${label}</a>`
  ).join('');

  nav.innerHTML = `
    <a href="/" class="navbar-brand">
      <img src="/images/l7-logo.svg" alt="L7 Talents" style="height:40px;object-fit:contain;">
    </a>
    <nav class="navbar-nav">
      ${navLinks}
      <div id="notif-btn" style="position:relative;cursor:pointer;padding:8px;" onclick="toggleNotif()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span id="notif-count" class="hidden" style="position:absolute;top:4px;right:4px;background:#B85C6E;color:#fff;border-radius:50%;width:16px;height:16px;font-size:10px;display:flex;align-items:center;justify-content:center;"></span>
      </div>
      <span style="font-size:13px;color:#6b7280;">${user?.email || ''}</span>
      <button class="btn btn-secondary btn-sm" onclick="logout()">Sair</button>
      <button class="hamburger" onclick="openDrawer()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
    <div class="mobile-drawer" id="mobile-drawer">
      <div class="drawer-overlay" onclick="closeDrawer()"></div>
      <div class="drawer-panel">
        <img src="/images/l7-logo.svg" alt="L7 Talents" class="drawer-logo">
        ${drawerLinks}
        <div style="margin-top:auto;padding-top:16px;border-top:1px solid var(--cream2);">
          <span style="font-size:12px;color:var(--gray-500);display:block;margin-bottom:8px;">${user?.email || ''}</span>
          <button class="btn btn-secondary btn-sm w-full" onclick="logout()">Sair</button>
        </div>
      </div>
    </div>
  `;
  loadNotifCount();
}

function openDrawer() { document.getElementById('mobile-drawer')?.classList.add('open'); }
function closeDrawer() { document.getElementById('mobile-drawer')?.classList.remove('open'); }

async function loadNotifCount() {
  try {
    const notifs = await get('/notificacoes');
    const unread = notifs.filter(n => !n.lida).length;
    const el = document.getElementById('notif-count');
    if (el && unread > 0) { el.textContent = unread; el.classList.remove('hidden'); }
  } catch {}
}

function logout() {
  auth.clear();
  window.location.href = '/pages/login.html';
}

// ── Sessão segura ──────────────────────────────────────────────────────────
const SESSION_TIMEOUT = 30 * 60 * 1000;  // 30 min inatividade
const WARN_BEFORE    =  2 * 60 * 1000;   // aviso 2 min antes
const REFRESH_INTERVAL = 90 * 60 * 1000; // renovar token a cada 90 min

let _idleTimer, _warnTimer, _warnEl;

function _resetIdle() {
  clearTimeout(_idleTimer);
  clearTimeout(_warnTimer);
  if (_warnEl) { _warnEl.remove(); _warnEl = null; }
  if (!auth.isLogged()) return;

  _warnTimer = setTimeout(() => {
    _warnEl = document.createElement('div');
    _warnEl.innerHTML = `
      <div style="position:fixed;bottom:24px;right:24px;background:#1e3a8a;color:white;padding:16px 20px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.3);z-index:99999;max-width:320px;font-family:Inter,sans-serif;">
        <div style="font-weight:600;margin-bottom:6px;">⏱ Sessão expirando</div>
        <div style="font-size:13px;opacity:.85;margin-bottom:12px;">Você ficará desconectado em 2 minutos por inatividade.</div>
        <button onclick="(function(){_resetIdle();this.closest('div[style]').remove();})()" style="background:white;color:#1e3a8a;border:none;padding:6px 14px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;">Continuar conectado</button>
      </div>`;
    document.body.appendChild(_warnEl);
  }, SESSION_TIMEOUT - WARN_BEFORE);

  _idleTimer = setTimeout(() => { logout(); }, SESSION_TIMEOUT);
}

// Renovar token automaticamente enquanto ativo
async function _refreshToken() {
  if (!auth.isLogged()) return;
  try {
    const data = await post('/auth/refresh', null);
    if (data?.token) {
      const user = auth.getUser();
      auth.setSession(data.token, user);
    }
  } catch { logout(); }
}

if (auth.isLogged()) {
  ['mousemove','keydown','click','scroll','touchstart'].forEach(e =>
    document.addEventListener(e, _resetIdle, { passive: true })
  );
  _resetIdle();
  setInterval(_refreshToken, REFRESH_INTERVAL);
}
// ──────────────────────────────────────────────────────────────────────────

// Highlight active nav link
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link, .sidebar-item').forEach(el => {
    if (el.href && window.location.pathname === new URL(el.href).pathname)
      el.classList.add('active');
  });
});
