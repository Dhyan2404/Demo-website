import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Tag, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const ProductFormModal = ({ isOpen, onClose, initialData = null }) => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);
  const addProduct = useInventoryStore((state) => state.addProduct);
  const updateProduct = useInventoryStore((state) => state.updateProduct);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'General',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    minThreshold: '5',
    unit: 'pcs',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        name: initialData.name || '',
        category: initialData.category || 'General',
        costPrice: initialData.costPrice?.toString() || '',
        sellingPrice: initialData.sellingPrice?.toString() || '',
        stock: initialData.stock?.toString() || '0',
        minThreshold: initialData.minThreshold?.toString() || '5',
        unit: initialData.unit || 'pcs',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        category: 'General',
        costPrice: '',
        sellingPrice: '',
        stock: '10',
        minThreshold: '5',
        unit: 'pcs',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const cost = Number(formData.costPrice) || 0;
  const sell = Number(formData.sellingPrice) || 0;
  const profitPerUnit = sell - cost;
  const marginPercentage = sell > 0 ? ((profitPerUnit / sell) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required', 'warning');
      return;
    }
    if (sell < cost) {
      if (!window.confirm('Warning: Selling price is lower than cost price (Negative Profit). Do you want to proceed?')) {
        return;
      }
    }

    if (initialData) {
      await updateProduct(initialData.id || initialData._id, formData);
      showToast(`Updated product "${formData.name}"`, 'success');
    } else {
      await addProduct(formData);
      showToast(`Added product "${formData.name}" to inventory`, 'success');
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Inventory Product' : 'Add New Inventory Product'}
      subtitle="Define cost, selling price, and stock levels with instant margin calculation"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-gray-300">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Wireless Noise Canceling Earbuds"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">SKU / Code</label>
            <input
              type="text"
              placeholder="SKU-001"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Category</label>
            <input
              type="text"
              placeholder="e.g. Electronics, Groceries, Accessories"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Unit of Measure</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="pkts">Packets (pkts)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="gms">Grams (gms)</option>
              <option value="ltr">Litres (ltr)</option>
              <option value="boxes">Boxes (boxes)</option>
              <option value="pairs">Pairs (pairs)</option>
            </select>
          </div>
        </div>

        {/* Pricing: Cost Price & Selling Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-rose-400">Cost Price ({currency}) *</label>
            <input
              type="number"
              required
              min="0"
              step="any"
              placeholder="0.00"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
            <p className="text-[10px] text-gray-500">What you paid for 1 unit</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-400">Selling Price ({currency}) *</label>
            <input
              type="number"
              required
              min="0"
              step="any"
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
            <p className="text-[10px] text-gray-500">What customer pays</p>
          </div>

          {/* Live Profit Preview Box */}
          <div className="sm:col-span-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Profit per Unit:</span>
              <span className={`font-bold ${profitPerUnit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profitPerUnit >= 0 ? '+' : ''}{formatCurrency(profitPerUnit, currency)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Margin:</span>
              <span className={`px-2 py-0.5 rounded font-bold text-xs ${profitPerUnit >= 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                {marginPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Stock & Low-Stock Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Initial Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Min Alert Threshold</label>
            <input
              type="number"
              min="1"
              value={formData.minThreshold}
              onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
            <p className="text-[10px] text-gray-500">Alerts when stock drops &le; this value</p>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Supplier contact, warranty info, location"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-glow-green transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{initialData ? 'Save Changes' : 'Add to Inventory'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
