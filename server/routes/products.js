import express from 'express';
import { Product } from '../models/Product.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

// Helper to escape regex special characters and prevent ReDoS attacks
const escapeRegex = (string) => {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Get all products with search & category filters
router.get('/', async (req, res) => {
  try {
    if (!getDBStatus()) {
      return res.json({ success: true, fromCache: true, data: [] });
    }
    const { search, category, stockStatus } = req.query;
    let query = {};

    if (search && search.trim()) {
      const sanitized = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { sku: { $regex: sanitized, $options: 'i' } },
        { category: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (stockStatus === 'out_of_stock') {
      query.stock = 0;
    } else if (stockStatus === 'low_stock') {
      query.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$minThreshold'] }] };
    }

    const products = await Product.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { sku, name, category, costPrice, sellingPrice, stock, minThreshold, unit, notes } = req.body;
    
    // Check if SKU exists
    const existing = await Product.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `SKU ${sku} already exists.` });
    }

    const product = new Product({
      sku: sku.toUpperCase(),
      name,
      category: category || 'General',
      costPrice: Math.max(0, Number(costPrice) || 0),
      sellingPrice: Math.max(0, Number(sellingPrice) || 0),
      stock: Math.max(0, Number(stock) || 0),
      minThreshold: Math.max(1, Number(minThreshold) || 5),
      unit: unit || 'pcs',
      notes: notes || '',
      updatedAt: new Date(),
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { sku, name, category, costPrice, sellingPrice, stock, minThreshold, unit, notes } = req.body;
    const updateData = {
      name,
      category,
      costPrice: Math.max(0, Number(costPrice) || 0),
      sellingPrice: Math.max(0, Number(sellingPrice) || 0),
      stock: Math.max(0, Number(stock) || 0),
      minThreshold: Math.max(1, Number(minThreshold) || 5),
      unit,
      notes,
      updatedAt: new Date(),
    };

    if (sku) {
      updateData.sku = sku.toUpperCase();
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Quick Stock Adjustment (+/- quantity) using Atomic MongoDB $inc
router.patch('/:id/adjust-stock', async (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    const num = Number(adjustment);
    if (isNaN(num)) {
      return res.status(400).json({ success: false, message: 'Valid adjustment number required' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      [
        {
          $set: {
            stock: { $max: [0, { $add: ['$stock', num] }] },
            updatedAt: new Date(),
          }
        }
      ],
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product, message: `Stock adjusted by ${num > 0 ? '+' : ''}${num}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
