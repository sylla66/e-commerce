const axios = require('axios');
const crypto = require('crypto');
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

class WaveProvider extends PaymentProvider {
  constructor() {
    super();
    this.apiKey = config.wave.apiKey;
    this.apiSecret = config.wave.apiSecret;
    this.baseUrl = 'https://api.wave.com/v1';
    this.isSimulation = !this.apiKey;
  }

  simulationId() {
    return `sim_wave_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }

  async createPayment(order) {
    const frontendUrl = config.frontendUrl;
    const paymentId = this.isSimulation ? this.simulationId() : null;

    let checkoutUrl;
    let providerPaymentId;

    if (this.isSimulation) {
      providerPaymentId = paymentId;
      checkoutUrl = `${frontendUrl}/payment/simulate?orderId=${order._id}&paymentId=${paymentId}&provider=wave`;
    } else {
      const response = await axios.post(
        `${this.baseUrl}/checkout/sessions`,
        {
          amount: Math.round(order.totalAmount),
          currency: 'XOF',
          error_url: `${frontendUrl}/orders/${order._id}?error=wave`,
          success_url: `${frontendUrl}/orders/success?orderId=${order._id}&wave=success`,
          webhook_url: `${frontendUrl}/api/v1/webhook/wave`,
          metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
        },
        { headers: { Authorization: `Bearer ${this.apiKey}` } }
      );
      providerPaymentId = response.data.id;
      checkoutUrl = response.data.checkout_url;
    }

    await Payment.create({
      order: order._id,
      provider: 'wave',
      providerPaymentId,
      amount: order.totalAmount,
      currency: 'XOF',
      status: 'pending',
      metadata: { checkoutUrl, isSimulation: String(this.isSimulation) },
    });

    return { checkoutUrl, providerPaymentId, provider: 'wave' };
  }

  async confirmPayment(providerPaymentId) {
    let status = 'succeeded';
    if (!this.isSimulation) {
      try {
        const response = await axios.get(`${this.baseUrl}/checkout/sessions/${providerPaymentId}`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        status = response.data.status === 'completed' ? 'succeeded' : 'failed';
      } catch {
        status = 'failed';
      }
    }

    const payment = await Payment.findOne({ providerPaymentId, provider: 'wave' });
    if (!payment) throw new Error('Payment not found');

    payment.status = status;
    await payment.save();

    if (status === 'succeeded') {
      await Order.findByIdAndUpdate(payment.order, { status: 'confirmed' });
    }

    return payment;
  }

  async refundPayment(providerPaymentId, amount) {
    if (this.isSimulation) {
      const payment = await Payment.findOne({ providerPaymentId, provider: 'wave' });
      if (payment) {
        payment.status = 'refunded';
        await payment.save();
        await Order.findByIdAndUpdate(payment.order, { status: 'refunded' });
      }
      return { simulated: true };
    }

    const response = await axios.post(
      `${this.baseUrl}/checkout/sessions/${providerPaymentId}/refund`,
      { amount: amount ? Math.round(amount) : undefined },
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    );

    const payment = await Payment.findOne({ providerPaymentId, provider: 'wave' });
    if (payment) {
      payment.status = 'refunded';
      await payment.save();
      await Order.findByIdAndUpdate(payment.order, { status: 'refunded' });
    }

    return response.data;
  }

  async handleWebhook(payload) {
    const { event, data } = payload;

    if (event === 'checkout.session.completed') {
      await this.confirmPayment(data.id);
    } else if (event === 'checkout.session.failed') {
      const payment = await Payment.findOne({ providerPaymentId: data.id, provider: 'wave' });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    }

    return { received: true };
  }
}

class OrangeMoneyProvider extends PaymentProvider {
  constructor() {
    super();
    this.clientId = config.orangeMoney.clientId;
    this.clientSecret = config.orangeMoney.clientSecret;
    this.baseUrl = 'https://api.orange.com/orange-money-webpayment/api/v1';
    this.oauthUrl = 'https://api.orange.com/oauth/v3';
    this.isSimulation = !this.clientId || !this.clientSecret;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  simulationId() {
    return `sim_om_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }

  async getAccessToken() {
    if (this.isSimulation) return 'sim_token';
    if (this.accessToken && Date.now() < this.tokenExpiresAt) return this.accessToken;

    const response = await axios.post(
      `${this.oauthUrl}/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async createPayment(order) {
    const frontendUrl = config.frontendUrl;
    const token = await this.getAccessToken();
    const paymentId = this.isSimulation ? this.simulationId() : null;

    let payUrl;
    let providerPaymentId;
    let notifToken;

    if (this.isSimulation) {
      providerPaymentId = paymentId;
      payUrl = `${frontendUrl}/payment/simulate?orderId=${order._id}&paymentId=${paymentId}&provider=orange_money`;
    } else {
      const response = await axios.post(
        `${this.baseUrl}/webpayment`,
        {
          merchant_key: this.clientId,
          currency: 'XOF',
          amount: Math.round(order.totalAmount),
          reference: order.orderNumber,
          site_id: this.clientId,
          return_url: `${frontendUrl}/orders/success?orderId=${order._id}&orange=success`,
          cancel_url: `${frontendUrl}/orders/${order._id}?error=cancelled`,
          notify_url: `${frontendUrl}/api/v1/webhook/orange-money`,
          lang: 'fr',
          description: `Commande ${order.orderNumber}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      providerPaymentId = response.data.pay_token;
      payUrl = response.data.payment_url || response.data.redirect_url;
      notifToken = response.data.notif_token;
    }

    await Payment.create({
      order: order._id,
      provider: 'orange_money',
      providerPaymentId,
      amount: order.totalAmount,
      currency: 'XOF',
      status: 'pending',
      metadata: { payUrl, notifToken, isSimulation: String(this.isSimulation) },
    });

    return { payUrl, providerPaymentId, provider: 'orange_money' };
  }

  async confirmPayment(providerPaymentId) {
    let status = 'succeeded';
    if (!this.isSimulation) {
      try {
        const token = await this.getAccessToken();
        const response = await axios.get(`${this.baseUrl}/webpayment/${providerPaymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        status = response.data.status === 'SUCCESS' ? 'succeeded' : 'failed';
      } catch {
        status = 'failed';
      }
    }

    const payment = await Payment.findOne({ providerPaymentId, provider: 'orange_money' });
    if (!payment) throw new Error('Payment not found');

    payment.status = status;
    await payment.save();

    if (status === 'succeeded') {
      await Order.findByIdAndUpdate(payment.order, { status: 'confirmed' });
    }

    return payment;
  }

  async refundPayment(providerPaymentId, amount) {
    if (this.isSimulation) {
      const payment = await Payment.findOne({ providerPaymentId, provider: 'orange_money' });
      if (payment) {
        payment.status = 'refunded';
        await payment.save();
        await Order.findByIdAndUpdate(payment.order, { status: 'refunded' });
      }
      return { simulated: true };
    }

    const token = await this.getAccessToken();
    const response = await axios.post(
      `${this.baseUrl}/webpayment/refund`,
      { pay_token: providerPaymentId, amount: amount ? Math.round(amount) : undefined },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const payment = await Payment.findOne({ providerPaymentId, provider: 'orange_money' });
    if (payment) {
      payment.status = 'refunded';
      await payment.save();
      await Order.findByIdAndUpdate(payment.order, { status: 'refunded' });
    }

    return response.data;
  }

  async handleWebhook(payload) {
    const { status, pay_token, notif_token } = payload;

    if (status === 'SUCCESS') {
      await this.confirmPayment(pay_token);
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      const payment = await Payment.findOne({ providerPaymentId: pay_token, provider: 'orange_money' });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    }

    return { received: true };
  }
}

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
paymentService.registerProvider('wave', new WaveProvider());
paymentService.registerProvider('orange_money', new OrangeMoneyProvider());

module.exports = { PaymentService, PaymentProvider, StripeProvider, WaveProvider, OrangeMoneyProvider, paymentService };
