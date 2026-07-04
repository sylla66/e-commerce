const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  sku: { type: String },
  variantSku: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  image: { type: String },
});

const customFieldValueSchema = new mongoose.Schema(
  {
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomField', required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'number', 'percentage', 'boolean', 'select'] },
    value: { type: mongoose.Schema.Types.Mixed },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      region: { type: String },
      zipCode: { type: String },
      country: { type: String, default: 'Sénégal' },
    },
    shippingMethod: { type: String },
    shippingCost: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    customFields: [customFieldValueSchema],
    totalSurcharges: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    notes: { type: String },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    invoiceGeneratedAt: { type: Date },
    invoiceNumber: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
