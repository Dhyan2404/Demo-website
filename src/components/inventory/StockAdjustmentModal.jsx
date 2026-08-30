import React, { useState } from 'react';
import { RefreshCw, Plus, Minus } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';

export const StockAdjustmentModal = ({ isOpen, onClose, product }) => {
  const showToast = useThemeStore((state) => state.showToast);
  const adjustStock = useInventoryStore((state) => state.adjustStock);

  const [type, setType] = useState('add'); // 'add' | 'reduce'
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('New shipment received');

  if (!product) return null;

  const handleAdjust = async (e) => {
    e.preventDefault();
    const num = Number(qty);
    if (!num || num <= 0) {
      showToast('Please enter a valid quantity', 'warning');
      return;
    }

    const adjustment = type === 'add' ? num : -num;
    await adjustStock(product.id, adjustment);
    showToast(`Stock updated: ${type === 'add' ? '+' : '-'}${num} ${product.unit}`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${product.name}`}
      subtitle={`Current Stock: ${product.stock} ${product.unit} (SKU: ${product.sku})`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleAdjust} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('add')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
              type === 'add'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-green'
                : 'bg-white/[0.02] border-white/10 text-gray-400'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Stock (+)</span>
          </button>

          <button
            type="button"
            onClick={() => setType('reduce')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
              type === 'reduce'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-white/[0.02] border-white/10 text-gray-400'
            }`}
          >
            <Minus className="w-4 h-4 text-rose-400" />
            <span>Reduce / Shrink (-)</span>
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Quantity to {type === 'add' ? 'Add' : 'Reduce'} ({product.unit})</label>
          <input
            type="number"
            min="1"
            required
            autoFocus
            placeholder="e.g. 10"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Reason / Note</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="New shipment received">New shipment received</option>
            <option value="Physical count correction">Physical count correction</option>
            <option value="Damaged / Expired stock">Damaged / Expired stock</option>
            <option value="Supplier return">Supplier return</option>
            <option value="Customer return">Customer return</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-glow-green transition-all"
          >
            Confirm Adjustment
          </button>
        </div>
      </form>
    </Modal>
  );
};
