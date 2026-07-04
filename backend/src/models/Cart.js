const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.methods.calculateTotals = function () {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

module.exports = mongoose.model('Cart', cartSchema);
