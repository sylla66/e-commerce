const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'color', 'boolean', 'image'],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    unit: { type: String },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    attributes: [attributeSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
