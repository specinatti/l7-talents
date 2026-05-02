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

  const links = role === 'candidato' ? `
    <a href="/pages/candidato/dashboard.html" class="nav-link">Dashboard</a>
    <a href="/pages/vagas.html" class="nav-link">Vagas</a>
    <a href="/pages/candidato/perfil.html" class="nav-link">Meu Perfil</a>
  ` : `
    <a href="/pages/empregador/dashboard.html" class="nav-link">Dashboard</a>
    <a href="/pages/empregador/vagas.html" class="nav-link">Minhas Vagas</a>
    <a href="/pages/empregador/candidatos.html" class="nav-link">Candidatos</a>
    <a href="/pages/empregador/perfil.html" class="nav-link">Empresa</a>
  `;

  nav.innerHTML = `
    <a href="/" class="navbar-brand">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#2563eb"/><text x="14" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="700">L7</text></svg>
      L7 Talents
    </a>
    <nav class="navbar-nav">
      ${links}
      <div id="notif-btn" style="position:relative;cursor:pointer;padding:8px;" onclick="toggleNotif()">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span id="notif-count" class="hidden" style="position:absolute;top:4px;right:4px;background:#dc2626;color:#fff;border-radius:50%;width:16px;height:16px;font-size:10px;display:flex;align-items:center;justify-content:center;"></span>
      </div>
      <span style="font-size:13px;color:#6b7280;">${user?.email || ''}</span>
      <button class="btn btn-secondary btn-sm" onclick="logout()">Sair</button>
    </nav>
  `;
  loadNotifCount();
}

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

// Highlight active nav link
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-link, .sidebar-item').forEach(el => {
    if (el.href && window.location.pathname === new URL(el.href).pathname)
      el.classList.add('active');
  });
});
