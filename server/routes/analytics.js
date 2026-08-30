import express from 'express';
import { Sale } from '../models/Sale.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    if (!getDBStatus()) {
      return res.json({
        success: true,
        fromCache: true,
        data: {
          totalSales: 0,
          totalCost: 0,
          netProfit: 0,
          marginPercentage: 0,
          totalProducts: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          totalUdhaarPending: 0,
          topProfitableProduct: null,
          topSellingProduct: null,
        }
      });
    }

    const { period } = req.query;
    const now = new Date();
    let dateFilter = {};

    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      dateFilter.createdAt = { $gte: startOfDay };
    } else if (period === '7days') {
      dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === '30days') {
      dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    } else if (period === '1year') {
      dateFilter.createdAt = { $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) };
    }

    const sales = await Sale.find(dateFilter);
    const products = await Product.find();
    const customers = await Customer.find();

    const totalSales = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalCost = sales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
    const netProfit = totalSales - totalCost;
    const marginPercentage = totalSales > 0 ? Number(((netProfit / totalSales) * 100).toFixed(1)) : 0;

    const outOfStockCount = products.filter(p => p.stock <= 0).length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minThreshold).length;
    const totalUdhaarPending = customers.reduce((acc, c) => acc + (c.currentBalance || 0), 0);

    // Aggregate Product Performance
    const productStats = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.name;
        if (!productStats[key]) {
          productStats[key] = {
            name: item.name,
            sku: item.sku,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }
        productStats[key].quantity += item.quantity;
        productStats[key].revenue += item.sellingPrice * item.quantity;
        productStats[key].cost += item.costPrice * item.quantity;
        productStats[key].profit += item.profit;
      });
    });

    const statsList = Object.values(productStats);
    const topProfitableProduct = statsList.sort((a, b) => b.profit - a.profit)[0] || null;
    const topSellingProduct = statsList.sort((a, b) => b.quantity - a.quantity)[0] || null;

    res.json({
      success: true,
      data: {
        totalSales,
        totalCost,
        netProfit,
        marginPercentage,
        totalProducts: products.length,
        lowStockCount,
        outOfStockCount,
        totalUdhaarPending,
        topProfitableProduct,
        topSellingProduct,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
