const { Queue } = require('bullmq');
const config = require('../config');

const connection = { url: config.redisUrl };

const emailQueue = new Queue('email', { connection });
const invoiceQueue = new Queue('invoice', { connection });
const stockSyncQueue = new Queue('stock-sync', { connection });
const paymentWebhookQueue = new Queue('payment-webhook', { connection });

module.exports = { emailQueue, invoiceQueue, stockSyncQueue, paymentWebhookQueue };
