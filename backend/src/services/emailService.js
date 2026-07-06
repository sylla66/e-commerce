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
      from: `"Mahdi boutique en ligne" <${config.email.from || 'noreply@boutique.sn'}>`,
      to: user.email,
      subject: 'Bienvenue sur Mahdi boutique en ligne !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Mahdi boutique en ligne</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Bonjour <strong>${user.firstName} ${user.lastName}</strong>,</p>
            <p>Votre compte a été créé avec succès sur <strong>Mahdi boutique en ligne</strong>.</p>
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
      from: `"Mahdi boutique en ligne" <${config.email.from || 'noreply@boutique.sn'}>`,
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

async function sendOrderStatusUpdate(order, user) {
  try {
    const statusLabels = {
      pending: 'En attente', confirmed: 'Confirmée', processing: 'En préparation',
      shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée',
    };
    const t = await getTransporter();
    const statusName = statusLabels[order.status] || order.status;
    const info = await t.sendMail({
      from: `"Mahdi boutique en ligne" <${config.email.from || 'noreply@boutique.sn'}>`,
      to: user.email,
      subject: `Commande ${order.orderNumber} — ${statusName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Mise à jour commande</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Bonjour <strong>${user.firstName}</strong>,</p>
            <p>Votre commande <strong>${order.orderNumber}</strong> a changé de statut :</p>
            <div style="text-align: center; margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 8px;">
              <span style="font-size: 18px; font-weight: bold; color: #2563eb;">${statusName}</span>
            </div>
            ${order.trackingNumber ? `<p>Numéro de suivi : <strong>${order.trackingNumber}</strong></p>` : ''}
            ${order.estimatedDelivery ? `<p>Livraison estimée : <strong>${new Date(order.estimatedDelivery).toLocaleDateString('fr-FR')}</strong></p>` : ''}
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
    console.error('[EMAIL] Failed to send status update:', error.message);
    return null;
  }
}

async function sendNewReviewNotification(review, product) {
  try {
    const t = await getTransporter();
    const admins = await require('../models/User').find({ role: { $in: ['admin', 'manager'] } }).select('email firstName').lean();
    if (!admins.length) return;

    const ratingStars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

    await t.sendMail({
      from: `"Mahdi boutique en ligne" <${config.email.from || 'noreply@boutique.sn'}>`,
      bcc: admins.map((a) => a.email),
      subject: `Nouvel avis sur ${product.name} — ${review.rating}/5`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Nouvel avis client</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p><strong>Produit :</strong> ${product.name}</p>
            <p><strong>Note :</strong> ${ratingStars}</p>
            ${review.title ? `<p><strong>Titre :</strong> ${review.title}</p>` : ''}
            ${review.comment ? `<p><strong>Commentaire :</strong></p><p style="background: #f3f4f6; padding: 12px; border-radius: 6px;">${review.comment}</p>` : ''}
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              Avis posté par ${review.user?.firstName || 'un client'} le ${new Date(review.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('[EMAIL] Failed to send review notification:', error.message);
  }
}

module.exports = { sendWelcomeEmail, sendOrderConfirmation, sendOrderStatusUpdate, sendNewReviewNotification };
