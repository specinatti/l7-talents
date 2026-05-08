// Utilitário de envio WhatsApp via Z-API
async function sendWhatsApp(phone, message) {
  if (!process.env.ZAPI_INSTANCE || !process.env.ZAPI_TOKEN) return;
  if (!phone) return;

  const num = String(phone).replace(/\D/g, '');
  if (num.length < 10) return;
  const fullPhone = num.startsWith('55') ? num : `55${num}`;

  try {
    const fetch = require('node-fetch');
    const res = await fetch(
      `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, message })
      }
    );
    const data = await res.json();
    if (!res.ok) console.error(`[WHATSAPP ERROR] ${fullPhone}: ${JSON.stringify(data)}`);
    else console.log(`[WHATSAPP] Enviado para ${fullPhone}`);
  } catch (err) {
    console.error(`[WHATSAPP ERROR] ${err.message}`);
  }
}

module.exports = { sendWhatsApp };
