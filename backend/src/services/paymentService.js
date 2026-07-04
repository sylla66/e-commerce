const config = require('../config');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

class PaymentProvider {
  async createPayment(order) { throw new Error('Not implemented'); }
  async confirmPayment(paymentId) { throw new Error('Not implemented'); }
  async refundPayment(paymentId, amount) { throw new Error('Not implemented'); }
  async handleWebhook(payload, signature) { throw new Error('Not implemented'); }
}

class StripeProvider extends PaymentProvider {
  constructor() {
    super();
    this.stripe = require('stripe')(config.stripe.secretKey);
  }

  async createPayment(order) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount),
      currency: 'xof',
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
      description: `Commande ${order.orderNumber}`,
    });

    await Payment.create({
      order: order._id,
      provider: 'stripe',
      providerPaymentId: paymentIntent.id,
      amount: order.totalAmount,
      currency: 'XOF',
      status: 'pending',
      metadata: { clientSecret: paymentIntent.client_secret },
    });

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  }

  async confirmPayment(paymentIntentId) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    const payment = await Payment.findOne({ providerPaymentId: paymentIntentId, provider: 'stripe' });
    if (!payment) throw new Error('Payment not found');

    const status = paymentIntent.status === 'succeeded' ? 'succeeded' : paymentIntent.status === 'canceled' ? 'failed' : payment.status;
    payment.status = status;
    await payment.save();

    if (status === 'succeeded') {
      await Order.findByIdAndUpdate(payment.order, { status: 'confirmed' });
    }

    return payment;
  }

  async refundPayment(paymentIntentId, amount) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount) : undefined,
    });

    const payment = await Payment.findOne({ providerPaymentId: paymentIntentId, provider: 'stripe' });
    if (payment) {
      payment.status = 'refunded';
      await payment.save();
      await Order.findByIdAndUpdate(payment.order, { status: 'refunded' });
    }

    return refund;
  }

  async handleWebhook(payload, signature) {
    const event = this.stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        await this.confirmPayment(event.data.object.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const payment = await Payment.findOne({ providerPaymentId: event.data.object.id, provider: 'stripe' });
        if (payment) {
          payment.status = 'failed';
          await payment.save();
        }
        break;
      }
    }

    return { received: true };
  }
}

class WaveProvider extends PaymentProvider {}
class OrangeMoneyProvider extends PaymentProvider {}

class PaymentService {
  constructor() {
    this.providers = new Map();
  }

  registerProvider(name, provider) {
    this.providers.set(name, provider);
  }

  getProvider(name) {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`Payment provider ${name} not supported`);
    return provider;
  }
}

const paymentService = new PaymentService();
if (config.stripe.secretKey) {
  paymentService.registerProvider('stripe', new StripeProvider());
}

module.exports = { PaymentService, PaymentProvider, StripeProvider, WaveProvider, OrangeMoneyProvider, paymentService };
