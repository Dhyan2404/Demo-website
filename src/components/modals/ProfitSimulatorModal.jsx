import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  Percent,
  DollarSign,
  Package,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const ProfitSimulatorModal = ({ isOpen, onClose }) => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const openModal = useThemeStore((state) => state.openModal);

  const [costPrice, setCostPrice] = useState('120');
  const [sellingPrice, setSellingPrice] = useState('200');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [quantity, setQuantity] = useState('50');

  const calculations = useMemo(() => {
    const cost = Number(costPrice) || 0;
    const baseSell = Number(sellingPrice) || 0;
    const discP = Number(discountPercent) || 0;
    const taxP = Number(taxRate) || 0;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const discountedPrice = Math.max(0, baseSell * (1 - discP / 100));
    const profitPerUnit = discountedPrice - cost;
    const marginPercent = discountedPrice > 0 ? (profitPerUnit / discountedPrice) * 100 : 0;
    const markupPercent = cost > 0 ? (profitPerUnit / cost) * 100 : 0;

    const subtotal = discountedPrice * qty;
    const totalCost = cost * qty;
    const totalTax = (subtotal * taxP) / 100;
    const grandTotal = subtotal + totalTax;
    const totalNetProfit = subtotal - totalCost;

    return {
      discountedPrice,
      profitPerUnit,
      marginPercent,
      markupPercent,
      subtotal,
      totalCost,
      totalTax,
      grandTotal,
      totalNetProfit,
      qty,
    };
  }, [costPrice, sellingPrice, discountPercent, taxRate, quantity]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Retail Profit & Margin Simulator"
      subtitle="Simulate cost price, volume discounts, GST tax, and net revenue yield"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Top Summary Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Projected Total Net Profit
            </span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 text-glow-green">
              +{formatCurrency(calculations.totalNetProfit, currency)}
            </p>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
              Based on {calculations.qty} units @ {formatCurrency(calculations.discountedPrice, currency)}/unit
            </p>
          </div>

          <div className="text-right sm:border-l border-slate-200 dark:border-white/10 sm:pl-5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block">
              Net Profit Margin
            </span>
            <span className={`text-2xl font-black font-mono ${calculations.marginPercent >= 20 ? 'text-emerald-600 dark:text-emerald-400' : calculations.marginPercent > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {calculations.marginPercent.toFixed(1)}%
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-gray-400">
              ({calculations.markupPercent.toFixed(1)}% Markup)
            </span>
          </div>
        </div>

        {/* 2-Column Controls & Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Cost Price */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-gray-900/60 border border-slate-200 dark:border-white/10">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between">
              <span>Unit Purchase Cost:</span>
              <span className="font-mono text-amber-700 dark:text-amber-400">{formatCurrency(Number(costPrice) || 0, currency)}</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Base Retail Selling Price */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-gray-900/60 border border-slate-200 dark:border-white/10">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between">
              <span>Base Selling Price:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">{formatCurrency(Number(sellingPrice) || 0, currency)}</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value.replace(/[^0-9.]/g, ''))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Discount Slider */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-gray-900/60 border border-slate-200 dark:border-white/10">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-gray-300">
              <span>Customer Bulk Discount:</span>
              <span className="text-amber-700 dark:text-amber-400 font-mono font-black">{discountPercent}% OFF</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 dark:text-gray-400 font-mono">
              <span>0%</span>
              <span>10%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Projected Quantity */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-100 dark:bg-gray-900/60 border border-slate-200 dark:border-white/10">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between">
              <span>Projected Units Sold:</span>
              <span className="font-mono text-cyan-700 dark:text-cyan-400">{quantity} units</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Detailed Financial Breakdown Table */}
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-gray-400">
            <span>Net Unit Selling Price (after {discountPercent}% discount):</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{formatCurrency(calculations.discountedPrice, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-gray-400">
            <span>Profit per Unit Sold:</span>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">+{formatCurrency(calculations.profitPerUnit, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-gray-400">
            <span>Total Inventory Cost Basis:</span>
            <span className="font-bold font-mono text-rose-600 dark:text-rose-400">{formatCurrency(calculations.totalCost, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-2 border-t border-slate-200 dark:border-white/10">
            <span>Total Customer Billing (Gross Revenue):</span>
            <span className="font-mono font-black text-amber-700 dark:text-amber-400 text-sm">{formatCurrency(calculations.subtotal, currency)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 text-slate-700 dark:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              openModal('product_form');
            }}
            className="btn-shimmer px-5 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-glow-gold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Create Product with this Margin</span>
            <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
