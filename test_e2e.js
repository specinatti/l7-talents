/**
 * Teste E2E completo — usuários fictícios do zero
 * Candidato: Lucas Martins (DEV Frontend)
 * Empregador: TechNova Soluções (criado via webhook MP simulado)
 */
require('dotenv').config();
const http = require('http');

const BASE = { hostname: '127.0.0.1', port: 3000 };

// ── Dados fictícios ────────────────────────────────────────────────────────
const CAND = {
  email: `lucas.martins.dev${Date.now()}@teste.com`,
  password: 'Teste@Dev2026',
  nome: 'Lucas Martins',
  whatsapp: '11983186310', // número real para testar WhatsApp
};

const EMP = {
  email: `rh.technova${Date.now()}@teste.com`,
  password: 'TechNova@2026',
  nome: 'Camila Rezende',
  razao_social: 'TechNova Soluções LTDA',
};

// ── Utils ──────────────────────────────────────────────────────────────────
const ok   = (l, v) => console.log(`  ✅ ${l}`, typeof v === 'object' ? JSON.stringify(v).slice(0,80) : v || '');
const fail = (l, v) => console.log(`  ❌ ${l}`, typeof v === 'object' ? JSON.stringify(v).slice(0,120) : v || '');
const sep  = t => console.log(`\n${'─'.repeat(55)}\n  ${t}\n${'─'.repeat(55)}`);

function req(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request({ ...BASE, path, method, headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'test/1.0',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(data   && { 'Content-Length': Buffer.byteLength(data) }),
    }}, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  let TC, TE, vagaId, candidaturaId;

  // ── 1. CADASTRO DO CANDIDATO ───────────────────────────────────────────
  sep('1 — Cadastro do candidato Lucas Martins');
  const regC = await req('POST', '/api/auth/register', null, {
    email: CAND.email, password: CAND.password, role: 'candidato', nome: CAND.nome
  });
  if (regC.status === 201 && regC.body?.token) {
    TC = regC.body.token;
    ok('Candidato cadastrado', `${CAND.email}`);
  } else {
    fail('Cadastro candidato', regC.body);
    process.exit(1);
  }

  // ── 2. PERFIL DO CANDIDATO ─────────────────────────────────────────────
  sep('2 — Completar perfil de Lucas Martins');
  const perfC = await req('PUT', '/api/candidatos/perfil', TC, {
    cargo_desejado: 'Desenvolvedor Frontend Sênior',
    area_atuacao: 'Tecnologia',
    nivel_experiencia: 'senior',
    cidade: 'São Paulo', estado: 'SP',
    modalidade: 'hibrido',
    pretensao_salarial: 12000,
    resumo_profissional: 'Desenvolvedor Frontend com 7 anos de experiência em React, Vue.js e TypeScript. Apaixonado por UX e performance.',
    habilidades: ['React', 'Vue.js', 'TypeScript', 'Node.js', 'CSS', 'Figma', 'Git', 'Docker', 'Jest', 'GraphQL'],
    alerta_whatsapp: true,
    whatsapp: CAND.whatsapp,
  });
  if (perfC.status === 200) ok('Perfil atualizado (com WhatsApp)', `cargo: ${perfC.body.cargo_desejado}`);
  else fail('Perfil candidato', perfC.body);

  // Adicionar experiência
  const exp = await req('POST', '/api/candidatos/experiencias', TC, {
    empresa: 'Nubank', cargo: 'Frontend Engineer', data_inicio: '2021-03-01', atual: true,
    descricao: 'Desenvolvimento de interfaces React para produtos financeiros com +10M usuários.'
  });
  if (exp.status === 201) ok('Experiência adicionada', `${exp.body.empresa} — ${exp.body.cargo}`);
  else fail('Experiência', exp.body);

  // Adicionar formação
  const form = await req('POST', '/api/candidatos/formacoes', TC, {
    instituicao: 'USP', curso: 'Ciência da Computação', nivel: 'bacharelado',
    data_inicio: '2014-02-01', data_fim: '2018-12-01', em_andamento: false
  });
  if (form.status === 201) ok('Formação adicionada', `${form.body.instituicao}`);
  else fail('Formação', form.body);

  // ── 3. CADASTRO DO EMPREGADOR (direto no banco, simula webhook aprovado) ──
  sep('3 — Criar empregador TechNova (plano Teste ativado)');
  const { pool } = require('./src/db');
  const bcrypt = require('bcryptjs');
  const expira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const hash = await bcrypt.hash(EMP.password, 10);

  const uExiste = await pool.query('SELECT id FROM users WHERE email=$1', [EMP.email.toLowerCase()]);
  let userId;
  if (uExiste.rows[0]) {
    userId = uExiste.rows[0].id;
    await pool.query(`UPDATE users SET plano_ativo='teste', plano_expira_em=$1, role='empregador', password_hash=$2 WHERE id=$3`, [expira, hash, userId]);
  } else {
    const u = await pool.query(
      `INSERT INTO users (email, password_hash, role, plano_ativo, plano_expira_em) VALUES ($1,$2,'empregador','teste',$3) RETURNING id`,
      [EMP.email.toLowerCase(), hash, expira]
    );
    userId = u.rows[0].id;
  }
  const eExiste = await pool.query('SELECT id FROM empregadores WHERE user_id=$1', [userId]);
  if (!eExiste.rows[0]) {
    await pool.query('INSERT INTO empregadores (user_id, nome_contato, razao_social) VALUES ($1,$2,$3)',
      [userId, EMP.nome, EMP.razao_social]);
  }
  ok('Empregador criado com plano Teste ativado', `expira: ${expira.toLocaleDateString('pt-BR')}`);

  // Login empregador
  const loginE = await req('POST', '/api/auth/login', null, { email: EMP.email, password: EMP.password });
  if (loginE.body?.token) {
    TE = loginE.body.token;
    ok('Login empregador', EMP.email);
  } else {
    fail('Login empregador', loginE.body);
    await pool.end().catch(()=>{});
    process.exit(1);
  }

  // ── 4. PERFIL DA EMPRESA ───────────────────────────────────────────────
  sep('4 — Completar perfil da TechNova');
  const perfE = await req('PUT', '/api/empregadores/perfil', TE, {
    razao_social: EMP.razao_social,
    nome_fantasia: 'TechNova',
    setor: 'Tecnologia',
    porte: 'medio',
    cidade: 'São Paulo', estado: 'SP',
    descricao: 'Startup de tecnologia focada em soluções SaaS para o mercado financeiro.',
    site: 'https://technova.com.br',
    whatsapp: CAND.whatsapp,
  });
  if (perfE.status === 200) ok('Perfil empresa atualizado', perfE.body.razao_social);
  else fail('Perfil empresa', perfE.body);

  // ── 5. CRIAR VAGA ──────────────────────────────────────────────────────
  sep('5 — Publicar vaga de Frontend Sênior');
  const vaga = await req('POST', '/api/empregadores/vagas', TE, {
    titulo: 'Frontend Engineer Sênior — React/TypeScript',
    descricao: 'Buscamos um Frontend Engineer Sênior para liderar o desenvolvimento da nossa plataforma web. Você vai trabalhar com React, TypeScript e GraphQL em um ambiente de alta performance.',
    requisitos: 'Mínimo 5 anos de experiência com React\nDomínio de TypeScript\nExperiência com testes (Jest/Cypress)\nBoa comunicação e trabalho em equipe',
    beneficios: 'Salário competitivo\nPlano de saúde\nVale refeição\nHome office híbrido\nStock options',
    area: 'Tecnologia',
    nivel: 'senior',
    modalidade: 'hibrido',
    tipo_contrato: 'clt',
    salario_min: 12000,
    salario_max: 18000,
    cidade: 'São Paulo', estado: 'SP',
    habilidades: ['React', 'TypeScript', 'Vue.js', 'GraphQL', 'Jest', 'Docker'],
  });
  if (vaga.status === 201 && vaga.body?.id) {
    vagaId = vaga.body.id;
    ok('Vaga criada', `ID: ${vagaId} — ${vaga.body.titulo}`);
  } else {
    fail('Criar vaga', vaga.body);
    process.exit(1);
  }

  // ── 6. BUSCAR VAGAS + MATCH ────────────────────────────────────────────
  sep('6 — Candidato busca vagas e vê match');
  const vagas = await req('GET', '/api/vagas/recomendadas', TC);
  if (vagas.status === 200) {
    const lista = vagas.body?.vagas || vagas.body || [];
    ok(`Vagas encontradas: ${lista.length}`, '');
    const match = lista.find(v => v.id === vagaId);
    if (match) ok(`Match na vaga criada`, `${match.match_score}% compatível`);
  } else fail('Buscar vagas', vagas.body);

  // ── 7. CANDIDATURA ─────────────────────────────────────────────────────
  sep('7 — Lucas se candidata à vaga');
  const cand = await req('POST', `/api/vagas/${vagaId}/candidatar`, TC, {
    carta_apresentacao: 'Olá equipe TechNova! Sou o Lucas Martins, desenvolvedor Frontend com 7 anos de experiência em React e TypeScript. Acredito que meu perfil é perfeito para este desafio. Tenho experiência com as mesmas tecnologias que vocês utilizam e estou animado com a oportunidade!'
  });
  if (cand.status === 201 && cand.body?.id) {
    candidaturaId = cand.body.id;
    ok('Candidatura enviada', `ID: ${candidaturaId}`);
  } else {
    fail('Candidatura', cand.body);
    // Tentar buscar candidatura existente
    const minhas = await req('GET', '/api/candidatos/candidaturas', TC);
    const existente = (minhas.body || []).find(c => c.vaga_id === vagaId);
    if (existente) { candidaturaId = existente.id; ok('Candidatura já existe', candidaturaId); }
  }

  // ── 8. CHAT ────────────────────────────────────────────────────────────
  sep('8 — Chat entre TechNova e Lucas');
  const msg1 = await req('POST', `/api/candidaturas/${candidaturaId}/mensagens`, TE, {
    conteudo: 'Olá Lucas! 👋 Recebi sua candidatura e adorei seu perfil. Você teria disponibilidade para uma conversa técnica na próxima quinta-feira às 14h?'
  });
  if (msg1.status === 201) ok('TechNova → Lucas', msg1.body.conteudo?.slice(0,50));
  else fail('Msg empregador', msg1.body);

  const msg2 = await req('POST', `/api/candidaturas/${candidaturaId}/mensagens`, TC, {
    conteudo: 'Oi Camila! 😊 Claro, quinta-feira às 14h está perfeito! Pode me enviar o link da call?'
  });
  if (msg2.status === 201) ok('Lucas → TechNova', msg2.body.conteudo?.slice(0,50));
  else fail('Msg candidato', msg2.body);

  // ── 9. ATUALIZAR STATUS (dispara WhatsApp) ────────────────────────────
  sep('9 — TechNova atualiza status → WhatsApp para Lucas');
  const status = await req('PUT', `/api/empregadores/candidaturas/${candidaturaId}/status`, TE, {
    status: 'entrevista',
    comentario: 'Perfil excelente! Avançando para entrevista técnica. 🎉'
  });
  if (status.status === 200) ok('Status → entrevista (WhatsApp enviado)', `status: ${status.body.status}`);
  else fail('Update status', status.body);

  // ── 10. NOTIFICAÇÕES DO CANDIDATO ─────────────────────────────────────
  sep('10 — Notificações de Lucas');
  const notifs = await req('GET', '/api/notificacoes', TC);
  if (notifs.status === 200) {
    const arr = Array.isArray(notifs.body) ? notifs.body : notifs.body?.notificacoes || [];
    ok(`${arr.length} notificação(ões)`, '');
    arr.slice(0,3).forEach(n => ok('  →', (n.mensagem || n.titulo || '').slice(0,60)));
  } else fail('Notificações', notifs.body);

  // ── 11. DASHBOARD EMPREGADOR ───────────────────────────────────────────
  sep('11 — Dashboard da TechNova');
  const dash = await req('GET', '/api/empregadores/dashboard', TE);
  if (dash.status === 200) ok('Dashboard', JSON.stringify(dash.body));
  else fail('Dashboard', dash.body);

  // ── RESUMO ─────────────────────────────────────────────────────────────
  sep('✅ TESTE E2E COMPLETO');
  console.log(`
  👤 Candidato: ${CAND.nome} (${CAND.email})
  🏢 Empregador: ${EMP.razao_social} / ${EMP.nome} (${EMP.email})
  💼 Vaga: Frontend Engineer Sênior (ID: ${vagaId})
  📋 Candidatura: ID ${candidaturaId}
  📲 WhatsApp testado: ${CAND.whatsapp}

  Fluxo completo: cadastro → perfil → vaga → candidatura → chat → status → notificação
  `);
}

main().catch(err => { console.error('ERRO FATAL:', err.message); process.exit(1); });
