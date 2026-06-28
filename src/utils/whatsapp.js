const twilio = require('twilio');

async function sendWhatsApp(phone, message) {
  if (!phone) return;

  const num = String(phone).replace(/\D/g, '');
  if (num.length < 10) return;
  const fullPhone = num.startsWith('55') ? num : `55${num}`;

  if (process.env.WHATSAPP_DEBUG === 'true') {
    console.log(`[WHATSAPP DEBUG] Para: +${fullPhone}\n${message}`);
    return;
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return;

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:+${fullPhone}`,
      body: message
    });
    console.log(`[WHATSAPP] Enviado para +${fullPhone}`);
  } catch (err) {
    console.error(`[WHATSAPP ERROR] +${fullPhone}: ${err.message}`);
  }
}

module.exports = { sendWhatsApp };
