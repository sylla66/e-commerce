class PaymentProvider {
  async createPayment(order) {
    throw new Error('Method not implemented');
  }
  async confirmPayment(paymentId) {
    throw new Error('Method not implemented');
  }
  async refundPayment(paymentId, amount) {
    throw new Error('Method not implemented');
  }
  async handleWebhook(payload, signature) {
    throw new Error('Method not implemented');
  }
}

class StripeProvider extends PaymentProvider {
  constructor(apiKey) {
    super();
    this.stripe = require('stripe')(apiKey);
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

module.exports = { PaymentService, PaymentProvider, StripeProvider, WaveProvider, OrangeMoneyProvider };
