const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { pool } = require('../db');

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const PACOTES = {
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
        auto_return: 'approved',
        notification_url: `${appUrl}/api/pagamentos/webhook`,
        statement_descriptor: 'L7 TALENTS',
      }
    });

    // Salvar preference_id
    await pool.query('UPDATE pedidos SET mp_preference_id=$1 WHERE id=$2', [result.id, pedidoId]);

    res.json({ preference_id: result.id, init_point: result.init_point, pedido_id: pedidoId });
  } catch (err) {
    console.error('[MP ERROR]', err);
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
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err.message);
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

module.exports = { getPacotes, criarPreferencia, webhook, getPedidos };
