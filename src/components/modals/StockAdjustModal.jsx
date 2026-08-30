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
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  useEffect(() => {
    setAmount('10');
    setOperation('add');
  }, [product, isOpen]);

  if (!product) return null;

  const currentStock = product.stock || 0;
  const numAmount = Number(amount) || 0;

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
      showToast('Please enter a valid stock quantity.', 'warning');
      return;
    }

    if (operation === 'set') {
      updateProduct(product.id, { stock: calculatedNewStock });
    } else if (operation === 'add') {
      adjustStock(product.id, numAmount);
    } else if (operation === 'subtract') {
      adjustStock(product.id, -numAmount);
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
              className={`p-2.5 rounded-xl border text-center transition-all ${
                operation === op.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <p className="text-xs font-bold">{op.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{op.sub}</p>
            </button>
          ))}
        </div>

        {/* Quantity Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">
            {operation === 'set' ? 'New Total Stock Count' : 'Quantity to Adjust'} ({product.unit})
          </label>
          <input
            type="number"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/15 rounded-xl text-white text-base font-bold focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Quick Quantity Buttons */}
        <div className="flex items-center gap-1.5">
          {[5, 10, 20, 50, 100].map((qty) => (
            <button
              key={qty}
              type="button"
              onClick={() => setAmount(qty.toString())}
              className="flex-1 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-xs font-semibold text-gray-300 border border-white/5 transition-all"
            >
              +{qty}
            </button>
          ))}
        </div>

        {/* Result Preview Box */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400">Resulting Stock Level:</span>
          <span className="text-sm font-extrabold text-emerald-400 text-glow-green">
            {calculatedNewStock} {product.unit}
          </span>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-extrabold rounded-xl shadow-glow-green flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Apply Adjustment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
