import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Minus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const StockAdjustModal = ({ isOpen, onClose, product = null }) => {
  const [amount, setAmount] = useState('10');
  const [operation, setOperation] = useState('add'); // 'add' | 'set' | 'subtract'

  const adjustStock = useInventoryStore((state) => state.adjustStock);
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  useEffect(() => {
    setAmount('10');
    setOperation('add');
  }, [product, isOpen]);

  if (!product) return null;

  const currentStock = product.stock || 0;
  const numAmount = parseInt(amount, 10) || 0;

  let calculatedNewStock = currentStock;
  if (operation === 'add') {
    calculatedNewStock = currentStock + numAmount;
  } else if (operation === 'subtract') {
    calculatedNewStock = Math.max(0, currentStock - numAmount);
  } else if (operation === 'set') {
    calculatedNewStock = Math.max(0, numAmount);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNaN(numAmount) || numAmount < 0) {
      showToast('Please enter a valid numeric stock quantity.', 'warning');
      return;
    }

    const targetId = product.id || product._id;
    if (operation === 'set') {
      updateProduct(targetId, { stock: calculatedNewStock });
    } else if (operation === 'add') {
      adjustStock(targetId, numAmount);
    } else if (operation === 'subtract') {
      adjustStock(targetId, -numAmount);
    }

    showToast(`Updated stock for ${product.name} to ${calculatedNewStock} ${product.unit}`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Restock / Adjust: ${product.name}`}
      subtitle={`SKU: ${product.sku} • Current Level: ${currentStock} ${product.unit}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Operation Selector */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'add', label: '+ Add Stock', sub: 'Arrival' },
            { id: 'subtract', label: '- Remove Stock', sub: 'Damage/Loss' },
            { id: 'set', label: '= Set Exact', sub: 'Audit Count' },
          ].map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setOperation(op.id)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                operation === op.id
                  ? 'bg-amber-500/20 dark:bg-emerald-500/20 border-amber-500/60 dark:border-emerald-500/50 text-amber-900 dark:text-emerald-300 font-black shadow-sm'
                  : 'bg-slate-100 dark:bg-white/[0.02] border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <p className="text-xs font-bold">{op.label}</p>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-0.5">{op.sub}</p>
            </button>
          ))}
        </div>

        {/* Quantity Input (Strict Digits Only) */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
            {operation === 'set' ? 'New Total Stock Count' : 'Quantity to Adjust'} ({product.unit})
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Quick Quantity Buttons */}
        <div className="flex items-center gap-1.5">
          {[5, 10, 20, 50, 100].map((qty) => (
            <button
              key={qty}
              type="button"
              onClick={() => setAmount(qty.toString())}
              className="flex-1 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/[0.04] dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-white/5 transition-all cursor-pointer"
            >
              +{qty}
            </button>
          ))}
        </div>

        {/* Result Preview Box */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-white/[0.02] border border-amber-500/30 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-gray-400 font-semibold">Resulting Stock Level:</span>
          <span className="text-sm font-black text-amber-700 dark:text-emerald-400 font-mono">
            {calculatedNewStock} {product.unit}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-shimmer px-5 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-glow-gold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Apply Adjustment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
