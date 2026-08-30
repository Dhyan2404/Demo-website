import { describe, it, expect } from 'vitest';
import {
  roundCurrency,
  calculateMargin,
  calculateTaxAmount,
  calculateGrandTotal,
  filterByPeriod,
  computeTopProducts,
} from './calculations.js';

describe('Financial & Accounting Calculation Suite', () => {
  describe('roundCurrency', () => {
    it('rounds numbers to 2 decimal places without floating drift', () => {
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
      expect(roundCurrency(10.555)).toBe(10.56);
      expect(roundCurrency(0)).toBe(0);
      expect(roundCurrency(-5.234)).toBe(-5.23);
    });

    it('handles NaN and undefined safely', () => {
      expect(roundCurrency(NaN)).toBe(0);
      expect(roundCurrency(undefined)).toBe(0);
      expect(roundCurrency(null)).toBe(0);
    });
  });

  describe('calculateMargin', () => {
    it('calculates gross profit margin percentage accurately', () => {
      // Cost: 60, Selling: 100 -> Margin = 40%
      expect(calculateMargin(60, 100)).toBe(40);
      // Cost: 80, Selling: 100 -> Margin = 20%
      expect(calculateMargin(80, 100)).toBe(20);
    });

    it('handles zero selling price gracefully without returning NaN or Infinity', () => {
      expect(calculateMargin(10, 0)).toBe(0);
      expect(calculateMargin(0, 0)).toBe(0);
      expect(calculateMargin(50, -10)).toBe(0);
    });
  });

  describe('calculateTaxAmount', () => {
    it('calculates GST tax amounts correctly', () => {
      expect(calculateTaxAmount(1000, 18)).toBe(180);
      expect(calculateTaxAmount(500, 5)).toBe(25);
      expect(calculateTaxAmount(250, 12)).toBe(30);
      expect(calculateTaxAmount(1000, 0)).toBe(0);
    });

    it('handles zero and negative subtotals safely', () => {
      expect(calculateTaxAmount(0, 18)).toBe(0);
      expect(calculateTaxAmount(-500, 18)).toBe(0);
    });
  });

  describe('calculateGrandTotal', () => {
    it('computes subtotal + tax - discount correctly', () => {
      // Subtotal: 1000, Tax: 18% (180), Discount: 50 -> 1130
      expect(calculateGrandTotal(1000, 18, 50)).toBe(1130);
      // Subtotal: 500, Tax: 0%, Discount: 100 -> 400
      expect(calculateGrandTotal(500, 0, 100)).toBe(400);
    });

    it('prevents grand total from dropping below zero when discount exceeds total', () => {
      expect(calculateGrandTotal(100, 0, 200)).toBe(0);
    });
  });

  describe('computeTopProducts', () => {
    it('ranks products by profit and volume correctly', () => {
      const mockSales = [
        {
          items: [
            { productId: 'p1', name: 'Product A', sku: 'SKU-A', quantity: 5, sellingPrice: 100, costPrice: 60, profit: 200 },
            { productId: 'p2', name: 'Product B', sku: 'SKU-B', quantity: 20, sellingPrice: 20, costPrice: 15, profit: 100 },
          ],
        },
      ];

      const { topProfitable, topSold, allPerformers } = computeTopProducts(mockSales);

      expect(topProfitable.id).toBe('p1');
      expect(topProfitable.totalProfit).toBe(200);
      expect(topSold.id).toBe('p2');
      expect(topSold.unitsSold).toBe(20);
      expect(allPerformers.length).toBe(2);
    });
  });
});
