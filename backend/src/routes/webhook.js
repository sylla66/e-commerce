const express = require('express');
const { paymentService } = require('../services/paymentService');

const router = express.Router();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const result = await paymentService.getProvider('stripe').handleWebhook(req.body, sig);
    res.json(result);
  } catch (error) {
    console.error('Stripe webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

router.post('/wave', express.json(), async (req, res) => {
  try {
    const result = await paymentService.getProvider('wave').handleWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('Wave webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

router.post('/orange-money', express.json(), async (req, res) => {
  try {
    const result = await paymentService.getProvider('orange_money').handleWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error('Orange Money webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;
