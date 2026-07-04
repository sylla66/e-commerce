const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    provider: {
      type: String,
      enum: ['stripe', 'wave', 'orange_money'],
      required: true,
    },
    providerPaymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'XOF' },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    metadata: { type: Map, of: String },
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ providerPaymentId: 1, provider: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
