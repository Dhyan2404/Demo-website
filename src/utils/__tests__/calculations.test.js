import { describe, it, expect } from 'vitest';
import {
  calculateMargin,
  calculateTaxAmount,
  calculateGrandTotal,
  roundCurrency,
  filterByPeriod,
  computeTopProducts,
  generateTimelineChartData,
} from '../calculations.js';

describe('Financial & Currency Calculations', () => {
  describe('roundCurrency', () => {
    it('eliminates floating point precision errors', () => {
      expect(0.1 + 0.2).not.toBe(0.3); // standard JS float quirk
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
      expect(roundCurrency(19.999)).toBe(20);
      expect(roundCurrency(15.554)).toBe(15.55);
      expect(roundCurrency(15.556)).toBe(15.56);
    });

    it('handles zero, null, and NaN safely', () => {
      expect(roundCurrency(0)).toBe(0);
      expect(roundCurrency(null)).toBe(0);
      expect(roundCurrency('invalid')).toBe(0);
    });
  });

  describe('calculateMargin', () => {
    it('computes exact retail profit margin percentage', () => {
      // Cost 60, Selling 100 => Profit 40 => Margin 40%
      expect(calculateMargin(60, 100)).toBe(40.0);
      // Cost 80, Selling 100 => Profit 20 => Margin 20%
      expect(calculateMargin(80, 100)).toBe(20.0);
    });

    it('guards against division by zero on free or promo items', () => {
      expect(calculateMargin(10, 0)).toBe(0);
      expect(calculateMargin(0, 0)).toBe(0);
      expect(calculateMargin(50, -100)).toBe(0);
    });

    it('calculates negative margins accurately for loss leaders', () => {
      // Cost 120, Selling 100 => Profit -20 => Margin -20%
      expect(calculateMargin(120, 100)).toBe(-20.0);
    });
  });

  describe('calculateTaxAmount & calculateGrandTotal', () => {
    it('calculates 18% GST accurately on subtotal', () => {
      const subtotal = 1000;
      const taxRate = 18;
      expect(calculateTaxAmount(subtotal, taxRate)).toBe(180);
      expect(calculateGrandTotal(subtotal, taxRate)).toBe(1180);
    });

    it('calculates tax with discount applied', () => {
      const subtotal = 1000;
      const taxRate = 18;
      const discount = 100;
      // Grand total = subtotal (1000) + tax (180) - discount (100) = 1080
      expect(calculateGrandTotal(subtotal, taxRate, discount)).toBe(1080);
    });

    it('handles 0% and null tax rates gracefully', () => {
      expect(calculateTaxAmount(500, 0)).toBe(0);
      expect(calculateGrandTotal(500, 0, 0)).toBe(500);
      expect(calculateGrandTotal(500, null, null)).toBe(500);
    });
  });

  describe('filterByPeriod', () => {
    const today = new Date();
    const mockItems = [
      { id: '1', name: 'Today Item', createdAt: today.toISOString() },
      { id: '2', name: '3 Days Ago', createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '3', name: '15 Days Ago', createdAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { id: '4', name: '60 Days Ago', createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    it('filters items correctly for today', () => {
      const result = filterByPeriod(mockItems, 'today');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Today Item');
    });

    it('filters items correctly for 7days', () => {
      const result = filterByPeriod(mockItems, '7days');
      expect(result.length).toBe(2);
    });

    it('filters items correctly for 30days', () => {
      const result = filterByPeriod(mockItems, '30days');
      expect(result.length).toBe(3);
    });

    it('returns all items when period is all', () => {
      const result = filterByPeriod(mockItems, 'all');
      expect(result.length).toBe(4);
    });
  });

  describe('computeTopProducts', () => {
    const mockSales = [
      {
        id: 'sale-1',
        items: [
          { productId: 'p1', sku: 'SKU-001', name: 'Premium Coffee', quantity: 5, sellingPrice: 200, costPrice: 120, profit: 400 },
          { productId: 'p2', sku: 'SKU-002', name: 'Green Tea', quantity: 10, sellingPrice: 50, costPrice: 30, profit: 200 },
        ],
      },
      {
        id: 'sale-2',
        items: [
          { productId: 'p1', sku: 'SKU-001', name: 'Premium Coffee', quantity: 3, sellingPrice: 200, costPrice: 120, profit: 240 },
        ],
      },
    ];

    it('computes most profitable and highest volume products correctly', () => {
      const { topProfitable, topSold, allPerformers } = computeTopProducts(mockSales);

      // Premium Coffee: 8 units, Total Revenue = 1600, Total Cost = 960, Profit = 640
      // Green Tea: 10 units, Total Revenue = 500, Total Cost = 300, Profit = 200
      expect(topProfitable.name).toBe('Premium Coffee');
      expect(topProfitable.totalProfit).toBe(640);
      expect(topProfitable.unitsSold).toBe(8);

      expect(topSold.name).toBe('Green Tea');
      expect(topSold.unitsSold).toBe(10);

      expect(allPerformers.length).toBe(2);
      expect(allPerformers[0].name).toBe('Premium Coffee');
      expect(allPerformers[1].name).toBe('Green Tea');
    });
  });
});
