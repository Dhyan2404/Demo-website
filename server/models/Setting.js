import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  shopName: {
    type: String,
    default: 'My Smart Shop',
  },
  ownerName: {
    type: String,
    default: 'Store Owner',
  },
  currencySymbol: {
    type: String,
    default: '₹',
  },
  currencyCode: {
    type: String,
    default: 'INR',
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
  },
  address: {
    type: String,
    default: 'Shop No. 12, Main Market Road',
  },
  lowStockDefaultThreshold: {
    type: Number,
    default: 5,
  },
  upiId: {
    type: String,
    default: 'myshop@upi',
  },
  gstNumber: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
