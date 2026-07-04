const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['text', 'number', 'percentage', 'boolean', 'select'],
      default: 'text',
    },
    options: [{ type: String }],
    defaultValue: { type: mongoose.Schema.Types.Mixed },
    isRequired: { type: Boolean, default: false },
    appliesTo: {
      type: String,
      enum: ['all', 'category'],
      default: 'all',
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customFieldSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('CustomField', customFieldSchema);
