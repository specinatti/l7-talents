const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { pool } = require('../db');

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const PACOTES = {
  teste:      { nome: 'Teste',      descricao: 'Pacote de teste — acesso completo por 7 dias',                                                valor: 5.00 },
  starter:    { nome: 'Starter',    descricao: '1 vaga publicada, processo seletivo básico, 30 dias',                                          valor: 490.00 },
  business:   { nome: 'Business',   descricao: '3 vagas, hunting direcionado, avaliação comportamental, 60 dias',                              valor: 1290.00 },
  premium:    { nome: 'Premium',    descricao: '5 vagas, hunting + inteligência de mercado, posicionamento salarial, acompanhamento 90 dias',  valor: 2490.00 },
  rh_avulso:  { nome: 'RH Avulso', descricao: 'Estruturação de processos de RH sem recrutamento',                                             valor: 890.00 },
  avaliacao:  { nome: 'Avaliação',  descricao: 'Avaliação técnica e comportamental por candidato',                                             valor: 290.00 },
};

async function getPacotes(req, res) {
  res.json(PACOTES);
}

async function criarPreferencia(req, res) {
  const { pacote, nome, email, empresa } = req.body;
  if (!PACOTES[pacote]) return res.status(400).json({ error: 'Pacote inválido' });
  if (!email || !nome) return res.status(400).json({ error: 'Nome e email obrigatórios' });

  const p = PACOTES[pacote];
  const appUrl = process.env.APP_URL || 'https://l7-talents-production.up.railway.app';

  try {
    // Criar pedido no banco
    const { rows } = await pool.query(
      `INSERT INTO pedidos (user_id, pacote, descricao, valor, email_comprador, nome_comprador, empresa)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [req.user?.id || null, pacote, p.descricao, p.valor, email.toLowerCase(), nome, empresa || null]
    );
    const pedidoId = rows[0].id;

    // Criar preferência no Mercado Pago
    const preference = new Preference(mp);
    const result = await preference.create({
      body: {
        items: [{ title: `L7 Talents — ${p.nome}`, quantity: 1, unit_price: p.valor, currency_id: 'BRL' }],
        payer: { name: nome, email: email },
        external_reference: pedidoId,
        back_urls: {
          success: `${appUrl}/pages/pagamento-sucesso.html`,
          failure: `${appUrl}/pages/pagamento-falha.html`,
          pending: `${appUrl}/pages/pagamento-sucesso.html`,
        },
        ...(process.env.NODE_ENV === 'production' && { auto_return: 'approved' }),
        notification_url: `${appUrl}/api/pagamentos/webhook`,
        statement_descriptor: 'L7 TALENTS',
      }
    });

    // Salvar preference_id
    await pool.query('UPDATE pedidos SET mp_preference_id=$1 WHERE id=$2', [result.id, pedidoId]);

    res.json({ preference_id: result.id, init_point: result.init_point, pedido_id: pedidoId });
  } catch (err) {
    console.error('[MP ERROR]', err.message, err.status || '');
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
  }
}

async function webhook(req, res) {
  const { type, data } = req.body;
  res.sendStatus(200); // responder imediatamente ao MP

  if (type !== 'payment' || !data?.id) return;

  try {
    const payment = new Payment(mp);
    const p = await payment.get({ id: data.id });

    const status = p.status === 'approved' ? 'aprovado'
      : p.status === 'rejected' ? 'recusado'
      : p.status === 'cancelled' ? 'cancelado' : 'pendente';

    await pool.query(
      `UPDATE pedidos SET status=$1, mp_payment_id=$2, mp_status=$3 WHERE id=$4`,
      [status, String(data.id), p.status, p.external_reference]
    );

    // Pagamento aprovado → ativar plano e provisionar acesso
    if (p.status === 'approved') {
      await ativarPlano(p.external_reference);
    }
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err.message);
  }
}

// Dias de acesso por pacote
const DIAS_PLANO = { teste: 7, starter: 30, business: 60, premium: 90, rh_avulso: 30, avaliacao: 30 };

async function ativarPlano(pedidoId) {
  const { rows } = await pool.query(
    'SELECT * FROM pedidos WHERE id = $1', [pedidoId]
  );
  const pedido = rows[0];
  if (!pedido) return;

  const dias = DIAS_PLANO[pedido.pacote] || 30;
  const expira = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);

  // Se já tem user_id, só atualiza o plano
  if (pedido.user_id) {
    await pool.query(
      `UPDATE users SET plano_ativo=$1, plano_expira_em=$2 WHERE id=$3`,
      [pedido.pacote, expira, pedido.user_id]
    );
    // Garantir que tem perfil de empregador
    const emp = await pool.query('SELECT id FROM empregadores WHERE user_id=$1', [pedido.user_id]);
    if (!emp.rows[0]) {
      await pool.query(
        'INSERT INTO empregadores (user_id, nome_contato, razao_social) VALUES ($1,$2,$3)',
        [pedido.user_id, pedido.nome_comprador || 'Empresa', pedido.empresa || pedido.nome_comprador || 'Empresa']
      );
    }
    await notificarAcesso(pedido, null, expira);
    return;
  }

  // Sem user_id → criar conta de empregador com senha temporária
  const bcrypt = require('bcryptjs');
  const crypto = require('crypto');
  const senhaTemp = crypto.randomBytes(4).toString('hex').toUpperCase(); // ex: A3F9B2C1
  const hash = await bcrypt.hash(senhaTemp, 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar se email já tem conta
    const existe = await client.query('SELECT id FROM users WHERE email=$1', [pedido.email_comprador]);
    let userId;

    if (existe.rows[0]) {
      userId = existe.rows[0].id;
      await client.query(
        `UPDATE users SET plano_ativo=$1, plano_expira_em=$2, role='empregador' WHERE id=$3`,
        [pedido.pacote, expira, userId]
      );
    } else {
      const { rows: newUser } = await client.query(
        `INSERT INTO users (email, password_hash, role, plano_ativo, plano_expira_em, senha_temporaria)
         VALUES ($1,$2,'empregador',$3,$4,true) RETURNING id`,
        [pedido.email_comprador, hash, pedido.pacote, expira]
      );
      userId = newUser[0].id;
    }

    // Criar perfil empregador se não existir
    const emp = await client.query('SELECT id FROM empregadores WHERE user_id=$1', [userId]);
    if (!emp.rows[0]) {
      await client.query(
        'INSERT INTO empregadores (user_id, nome_contato, razao_social) VALUES ($1,$2,$3)',
        [userId, pedido.nome_comprador || 'Empresa', pedido.empresa || pedido.nome_comprador || 'Empresa']
      );
    }

    // Vincular pedido ao user
    await client.query('UPDATE pedidos SET user_id=$1 WHERE id=$2', [userId, pedidoId]);

    await client.query('COMMIT');
    await notificarAcesso(pedido, senhaTemp, expira);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ATIVAR PLANO ERROR]', err.message);
  } finally {
    client.release();
  }
}

async function notificarAcesso(pedido, senhaTemp, expira) {
  if (!process.env.SMTP_HOST) {
    console.log(`[PLANO ATIVADO] ${pedido.email_comprador} — pacote: ${pedido.pacote}${senhaTemp ? ` — senha: ${senhaTemp}` : ''}`);
    return;
  }
  const nodemailer = require('nodemailer');
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const appUrl = process.env.APP_URL || 'https://l7-talents-production.up.railway.app';
  const html = senhaTemp
    ? `<div style="font-family:Arial;max-width:600px;">
        <h2 style="color:#1B2A4A;">Bem-vindo à L7 Talents! 🎉</h2>
        <p>Seu pagamento foi confirmado. Aqui estão seus dados de acesso:</p>
        <table style="background:#f9f9f9;padding:16px;border-radius:8px;width:100%;">
          <tr><td><strong>Email:</strong></td><td>${pedido.email_comprador}</td></tr>
          <tr><td><strong>Senha temporária:</strong></td><td style="font-size:20px;font-weight:700;color:#B85C6E;">${senhaTemp}</td></tr>
          <tr><td><strong>Plano:</strong></td><td>${pedido.pacote}</td></tr>
          <tr><td><strong>Acesso até:</strong></td><td>${expira.toLocaleDateString('pt-BR')}</td></tr>
        </table>
        <p style="margin-top:16px;"><a href="${appUrl}/pages/login.html" style="background:#1B2A4A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Acessar painel</a></p>
        <p style="color:#6b7280;font-size:13px;margin-top:16px;">Recomendamos alterar sua senha no primeiro acesso.</p>
      </div>`
    : `<div style="font-family:Arial;max-width:600px;">
        <h2 style="color:#1B2A4A;">Plano ativado! 🎉</h2>
        <p>Seu plano <strong>${pedido.pacote}</strong> foi ativado com sucesso.</p>
        <p>Acesso válido até: <strong>${expira.toLocaleDateString('pt-BR')}</strong></p>
        <p><a href="${appUrl}/pages/login.html" style="background:#1B2A4A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Acessar painel</a></p>
      </div>`;

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || 'noreply@l7talents.online',
      to: pedido.email_comprador,
      subject: `L7 Talents — Acesso liberado: ${pedido.pacote}`,
      html
    });
  } catch (err) {
    console.error('[NOTIFICAR ACESSO ERROR]', err.message);
  }
}

async function getPedidos(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, pacote, valor, status, email_comprador, nome_comprador, empresa, mp_payment_id, created_at
       FROM pedidos ORDER BY created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
}

async function processar(req, res) {
  try {
    const { pedido_id, ...formData } = req.body;
    const payment = new Payment(mp);
    const result = await payment.create({ body: formData });

    const status = result.status === 'approved' ? 'aprovado'
      : result.status === 'rejected' ? 'recusado'
      : 'pendente';

    if (pedido_id) {
      await pool.query(
        'UPDATE pedidos SET status=$1, mp_payment_id=$2, mp_status=$3 WHERE id=$4',
        [status, String(result.id), result.status, pedido_id]
      );
    }

    res.json({ status: result.status, payment_id: result.id });
  } catch (err) {
    console.error('[PROCESSAR ERROR]', err.message);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
}

module.exports = { getPacotes, criarPreferencia, processar, webhook, getPedidos };
