import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['credit', 'payment'], // credit = took goods on udhaar; payment = paid back
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
    default: 'cash',
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    default: null,
  },
  invoiceNo: String,
  note: {
    type: String,
    default: '',
  }
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    default: '',
  },
  totalCredit: {
    type: Number,
    default: 0,
  },
  totalPaid: {
    type: Number,
    default: 0,
  },
  currentBalance: {
    type: Number,
    default: 0, // totalCredit - totalPaid (Amount customer still owes)
  },
  transactions: [transactionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivityDate: {
    type: Date,
    default: Date.now,
  }
});

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
