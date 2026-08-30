import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  minThreshold: {
    type: Number,
    default: 5,
    min: 0,
  },
  unit: {
    type: String,
    default: 'pcs',
    trim: true,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ stock: 1, minThreshold: 1 });


// Calculate profit margin %
productSchema.virtual('profitPerUnit').get(function() {
  return this.sellingPrice - this.costPrice;
});

productSchema.virtual('marginPercentage').get(function() {
  if (this.sellingPrice === 0) return 0;
  return Number((((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100).toFixed(1));
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
