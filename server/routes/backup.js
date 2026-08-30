import express from 'express';
import { Product } from '../models/Product.js';
import { Sale } from '../models/Sale.js';
import { Customer } from '../models/Customer.js';
import { Setting } from '../models/Setting.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

// Export full backup JSON
router.get('/export', async (req, res) => {
  try {
    if (!getDBStatus()) {
      return res.json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          products: [],
          sales: [],
          customers: [],
          settings: {}
        }
      });
    }

    const [products, sales, customers, settings] = await Promise.all([
      Product.find(),
      Sale.find(),
      Customer.find(),
      Setting.findOne(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      shopName: settings?.shopName || 'Smart Inventory Shop',
      products,
      sales,
      customers,
      settings: settings || {},
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=shop_backup_${new Date().toISOString().slice(0, 10)}.json`);
    res.json({ success: true, data: backupData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restore backup from JSON payload
router.post('/restore', async (req, res) => {
  try {
    const { products, sales, customers, settings } = req.body;

    if (!products && !sales && !customers) {
      return res.status(400).json({ success: false, message: 'Invalid backup file format' });
    }

    if (getDBStatus()) {
      // Clear existing records and re-insert
      if (products && products.length) {
        await Product.deleteMany({});
        await Product.insertMany(products);
      }

      if (sales && sales.length) {
        await Sale.deleteMany({});
        await Sale.insertMany(sales);
      }

      if (customers && customers.length) {
        await Customer.deleteMany({});
        await Customer.insertMany(customers);
      }

      if (settings) {
        await Setting.deleteMany({});
        await Setting.create(settings);
      }
    }

    res.json({
      success: true,
      message: 'Data successfully restored from backup snapshot',
      restored: {
        products: products?.length || 0,
        sales: sales?.length || 0,
        customers: customers?.length || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
