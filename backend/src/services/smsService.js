const config = require('../config');

const statusLabels = {
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En préparation',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
};

async function sendSMS(to, message) {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM;

  if (!twilioAccountSid || !twilioAuthToken || !twilioFrom) {
    console.log('[SMS] Simulation mode — would send to', to, ':', message);
    return { simulated: true, to, message };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(twilioAccountSid, twilioAuthToken);
    const result = await client.messages.create({
      body: message,
      from: twilioFrom,
      to,
    });
    console.log('[SMS] Sent to', to, '- sid:', result.sid);
    return result;
  } catch (error) {
    console.error('[SMS] Failed to send:', error.message);
    return null;
  }
}

async function sendOrderStatusSMS(order, user) {
  if (!user.phone) {
    console.log('[SMS] No phone number for user', user.email);
    return null;
  }

  const statusName = statusLabels[order.status] || order.status;
  const message = `Mahdi boutique en ligne — Commande ${order.orderNumber} : ${statusName}. Montant: ${order.totalAmount.toLocaleString('fr-SN')} FCFA. Merci pour votre confiance.`;

  return sendSMS(user.phone, message);
}

module.exports = { sendSMS, sendOrderStatusSMS };
