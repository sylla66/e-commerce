const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  attributes: { type: Map, of: String },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    attributes: { type: Map, of: mongoose.Schema.Types.Mixed },
    variants: [productVariantSchema],
    basePrice: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    searchText: { type: String },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text', searchText: 'text' });
productSchema.index({ category: 1, isActive: 1 });
module.exports = mongoose.model('Product', productSchema);
