const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (config.email.host && config.email.user) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: { user: config.email.user, pass: config.email.pass },
    });
    await transporter.verify();
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('[EMAIL] Using Ethereal test account:', testAccount.user);
  }
  return transporter;
}

async function sendWelcomeEmail(user) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: `"Ma Boutique" <${config.email.from || 'noreply@boutique.sn'}>`,
      to: user.email,
      subject: 'Bienvenue sur Ma Boutique !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Ma Boutique</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Bonjour <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p>Votre compte a été créé avec succès sur <strong>Ma Boutique</strong>.</p>
            <p>Vous pouvez dès maintenant parcourir notre catalogue et passer vos premières commandes.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${config.frontendUrl}/products"
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Découvrir nos produits
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              Si vous n'avez pas créé ce compte, ignorez cet email.
            </p>
          </div>
        </div>
      `,
    });

    if (info.messageId) {
      console.log(`[EMAIL] Welcome sent to ${user.email} - id: ${info.messageId}`);
    }
    return info;
  } catch (error) {
    console.error('[EMAIL] Failed to send welcome:', error.message);
    return null;
  }
}

async function sendOrderConfirmation(order, user) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: `"Ma Boutique" <${config.email.from || 'noreply@boutique.sn'}>`,
      to: user.email,
      subject: `Confirmation commande ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Commande confirmée</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Bonjour <strong>${user.firstName}</strong>,</p>
            <p>Votre commande <strong>${order.orderNumber}</strong> a été confirmée.</p>
            <p>Montant total : <strong>${order.totalAmount.toLocaleString('fr-SN')} FCFA</strong></p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${config.frontendUrl}/orders/${order._id}"
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Voir ma commande
              </a>
            </div>
          </div>
        </div>
      `,
    });
    return info;
  } catch (error) {
    console.error('[EMAIL] Failed to send order confirmation:', error.message);
    return null;
  }
}

module.exports = { sendWelcomeEmail, sendOrderConfirmation };
