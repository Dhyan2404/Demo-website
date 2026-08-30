import express from 'express';
import { Customer } from '../models/Customer.js';
import { Setting } from '../models/Setting.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

// Get all customers with search and debt filters
router.get('/', async (req, res) => {
  try {
    if (!getDBStatus()) {
      return res.json({ success: true, fromCache: true, data: [] });
    }
    const { search, filter } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (filter === 'has_debt') {
      query.currentBalance = { $gt: 0 };
    } else if (filter === 'settled') {
      query.currentBalance = 0;
    }

    const customers = await Customer.find(query).sort({ currentBalance: -1, lastActivityDate: -1 });
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    // Check if phone already registered
    const existing = await Customer.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Customer with phone ${phone} already exists.` });
    }

    const customer = new Customer({
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      address: (address || '').trim(),
      totalCredit: 0,
      totalPaid: 0,
      currentBalance: 0,
      transactions: [],
      createdAt: new Date(),
      lastActivityDate: new Date(),
    });

    await customer.save();
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Record Payment towards Udhaar / Credit
router.post('/:id/pay', async (req, res) => {
  try {
    const { amount, paymentMethod, note } = req.body;
    const payAmount = Number(amount);

    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive payment amount required' });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.totalPaid += payAmount;
    customer.currentBalance = Math.max(0, customer.currentBalance - payAmount);
    customer.transactions.push({
      date: new Date(),
      type: 'payment',
      amount: payAmount,
      paymentMethod: paymentMethod || 'cash',
      note: note || 'Udhaar payment received',
    });
    customer.lastActivityDate = new Date();

    await customer.save();
    res.json({
      success: true,
      data: customer,
      message: `Payment of ${payAmount} recorded successfully. Remaining balance: ${customer.currentBalance}`
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get single customer details with full ledger
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate WhatsApp Payment Reminder text
router.get('/:id/whatsapp-reminder', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const settings = await Setting.findOne() || { shopName: 'Our Shop', currencySymbol: '₹', upiId: 'shop@upi' };
    const currency = settings.currencySymbol || '₹';

    const message = `Hello ${customer.name},\n\nThis is a friendly reminder from *${settings.shopName}* regarding your pending balance of *${currency}${customer.currentBalance.toLocaleString()}*.\n\nYou can settle via UPI to: *${settings.upiId}* or visit our shop.\n\nThank you for your business! 🙏`;
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(message)}`;

    res.json({
      success: true,
      data: {
        customerName: customer.name,
        phone: customer.phone,
        currentBalance: customer.currentBalance,
        message,
        whatsappUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
