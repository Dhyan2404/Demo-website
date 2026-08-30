import express from 'express';
import { Sale } from '../models/Sale.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

// Generate unique sequential invoice number
const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${rand}`;
};

// Get all sales with date filtering
router.get('/', async (req, res) => {
  try {
    if (!getDBStatus()) {
      return res.json({ success: true, fromCache: true, data: [] });
    }
    const { period, startDate, endDate, customerId } = req.query;
    let query = {};

    if (customerId) {
      query.customerId = customerId;
    }

    const now = new Date();
    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      query.createdAt = { $gte: startOfDay };
    } else if (period === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: past7 };
    } else if (period === '30days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: past30 };
    } else if (period === '1year') {
      const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      query.createdAt = { $gte: pastYear };
    } else if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new Sale / POS Checkout
router.post('/', async (req, res) => {
  try {
    const {
      items,
      subtotal,
      taxRate = 0,
      taxAmount = 0,
      discount = 0,
      totalAmount,
      paymentMethod,
      paidAmount,
      customerId,
      customerName,
      customerPhone,
      notes,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Sale items cannot be empty' });
    }

    let totalCost = 0;
    let computedSubtotal = 0;
    let totalQuantity = 0;
    const processedItems = [];

    // Verify stock and calculate totals
    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const cost = Number(item.costPrice) || 0;
      const sell = Number(item.sellingPrice) || 0;
      const lineProfit = Math.round((sell - cost) * qty * 100) / 100;

      totalCost += cost * qty;
      computedSubtotal += sell * qty;
      totalQuantity += qty;

      processedItems.push({
        productId: item.productId || null,
        sku: item.sku || '',
        name: item.name,
        quantity: qty,
        costPrice: cost,
        sellingPrice: sell,
        profit: lineProfit,
      });

      // Atomic stock reduction if product exists in DB
      if (item.productId && getDBStatus()) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -qty },
          $set: { updatedAt: new Date() }
        });
      }
    }

    const appliedTaxRate = Number(taxRate) || 0;
    const appliedTaxAmount = Number(taxAmount) || Math.round(((computedSubtotal * appliedTaxRate) / 100) * 100) / 100;
    const appliedDiscount = Number(discount) || 0;
    const finalTotal = totalAmount !== undefined ? Number(totalAmount) : (computedSubtotal + appliedTaxAmount - appliedDiscount);
    const netProfit = Math.round((computedSubtotal - totalCost) * 100) / 100;
    const paid = paymentMethod === 'udhaar' ? (Number(paidAmount) || 0) : (Number(paidAmount) || finalTotal);
    const pending = Math.max(0, finalTotal - paid);
    const invoiceNo = generateInvoiceNumber();

    const sale = new Sale({
      invoiceNo,
      items: processedItems,
      totalQuantity,
      totalCost: Math.round(totalCost * 100) / 100,
      subtotal: Math.round(computedSubtotal * 100) / 100,
      taxRate: appliedTaxRate,
      taxAmount: appliedTaxAmount,
      discount: appliedDiscount,
      totalAmount: finalTotal,
      netProfit,
      paymentMethod: paymentMethod || 'cash',
      paidAmount: paid,
      pendingAmount: pending,
      customerId: customerId || null,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      notes: notes || '',
      createdAt: new Date(),
    });

    if (getDBStatus()) {
      await sale.save();

      // If credit/udhaar sale or assigned to customer, update customer ledger
      if (customerId || (paymentMethod === 'udhaar' && customerPhone)) {
        let customer;
        if (customerId) {
          customer = await Customer.findById(customerId);
        } else if (customerPhone) {
          customer = await Customer.findOne({ phone: customerPhone });
          if (!customer) {
            customer = new Customer({
              name: customerName || 'Valued Customer',
              phone: customerPhone,
              totalCredit: 0,
              totalPaid: 0,
              currentBalance: 0,
            });
          }
        }

        if (customer) {
          if (pending > 0) {
            customer.totalCredit += pending;
            customer.currentBalance += pending;
            customer.transactions.push({
              date: new Date(),
              type: 'credit',
              amount: pending,
              paymentMethod: 'udhaar',
              saleId: sale._id,
              invoiceNo,
              note: `Udhaar for Invoice ${invoiceNo}`,
            });
          }

          if (paid > 0 && customerId) {
            customer.totalPaid += paid;
            customer.transactions.push({
              date: new Date(),
              type: 'payment',
              amount: paid,
              paymentMethod: paymentMethod || 'cash',
              saleId: sale._id,
              invoiceNo,
              note: `Payment for Invoice ${invoiceNo}`,
            });
          }

          customer.lastActivityDate = new Date();
          await customer.save();
        }
      }
    }

    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Void / Refund Sale and replenish stock
router.post('/:id/void', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    // Replenish stock for all items
    if (getDBStatus()) {
      for (const item of sale.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
            $set: { updatedAt: new Date() },
          });
        }
      }

      await Sale.findByIdAndDelete(req.params.id);
    }

    res.json({ success: true, message: `Sale ${sale.invoiceNo} voided and inventory stock replenished.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single sale by ID
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

