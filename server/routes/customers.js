import express from 'express';
import { Customer } from '../models/Customer.js';
import { Setting } from '../models/Setting.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

const escapeRegex = (string) => {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Get all customers with search and debt filters
router.get('/', async (req, res) => {
  try {
    if (!getDBStatus()) {
      return res.json({ success: true, fromCache: true, data: [] });
    }
    const { search, filter } = req.query;
    let query = {};

    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { phone: { $regex: sanitized, $options: 'i' } },
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
    const { name, phone, email, address, initialBalance } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    
    // Check if phone already registered
    const existing = await Customer.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({ success: false, message: `Customer with phone ${phone} already exists.` });
    }

    const initDebt = Math.max(0, Number(initialBalance) || 0);

    const customer = new Customer({
      name: String(name || 'New Customer').trim(),
      phone: cleanPhone,
      email: String(email || '').trim(),
      address: String(address || '').trim(),
      totalCredit: initDebt,
      totalPaid: 0,
      currentBalance: initDebt,
      transactions: initDebt > 0 ? [{
        date: new Date(),
        type: 'opening_balance',
        amount: initDebt,
        paid: 0,
        description: 'Opening Debt Balance',
      }] : [],
      createdAt: new Date(),
      lastActivityDate: new Date(),
    });

    await customer.save();
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update existing customer details
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    const updateData = {
      lastActivityDate: new Date(),
    };

    if (name) updateData.name = String(name).trim();
    if (phone) updateData.phone = String(phone).replace(/\D/g, '');
    if (email !== undefined) updateData.email = String(email).trim();
    if (address !== undefined) updateData.address = String(address).trim();

    const customer = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
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

// Delete customer with safety check
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (customer.currentBalance > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with pending debt of ${customer.currentBalance}. Settle balance or pass ?force=true.`
      });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
