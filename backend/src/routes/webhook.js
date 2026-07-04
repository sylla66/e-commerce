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

module.exports = router;
