import React, { useState, useEffect, useMemo } from 'react';
import { Package, Plus, Save, TrendingUp, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const ProductFormModal = ({ isOpen, onClose, product = null }) => {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    minThreshold: '5',
    unit: 'pcs',
    notes: '',
  });

  const addProduct = useInventoryStore((state) => state.addProduct);
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const products = useInventoryStore((state) => state.products);
  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [products]);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || 'General',
        costPrice: product.costPrice?.toString() || '',
        sellingPrice: product.sellingPrice?.toString() || '',
        stock: product.stock?.toString() || '',
        minThreshold: product.minThreshold?.toString() || '5',
        unit: product.unit || 'pcs',
        notes: product.notes || '',
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        category: 'General',
        costPrice: '',
        sellingPrice: '',
        stock: '10',
        minThreshold: '5',
        unit: 'pcs',
        notes: '',
      });
    }
  }, [product, isOpen]);

  const cost = Number(formData.costPrice) || 0;
  const sell = Number(formData.sellingPrice) || 0;
  const unitProfit = sell - cost;
  const marginPercent = sell > 0 ? ((unitProfit / sell) * 100).toFixed(1) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required.', 'warning');
      return;
    }
    if (isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) < 0 || formData.sellingPrice === '') {
      showToast('Please enter a valid numeric selling price.', 'warning');
      return;
    }

    const payload = {
      ...formData,
      costPrice: Math.max(0, Number(formData.costPrice) || 0),
      sellingPrice: Math.max(0, Number(formData.sellingPrice) || 0),
      stock: Math.max(0, parseInt(formData.stock, 10) || 0),
      minThreshold: Math.max(0, parseInt(formData.minThreshold, 10) || 5),
    };

    if (isEditing) {
      updateProduct(product.id || product._id, payload);
      showToast(`Updated "${formData.name}"`, 'success');
    } else {
      addProduct(payload);
      showToast(`Added "${formData.name}" to inventory!`, 'success');
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Product: ${product?.name}` : 'Add New Inventory Product'}
      subtitle="Define cost, selling price, and automatic stock replenishment thresholds"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Wireless Mouse, Basmati Rice"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">SKU / Barcode</label>
            <input
              type="text"
              placeholder="SKU-1001"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-amber-500 uppercase font-bold"
            />
          </div>
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Category</label>
            <input
              type="text"
              list="category-suggestions"
              placeholder="e.g. Electronics, Grocery"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-medium"
            />
            <datalist id="category-suggestions">
              {categories.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Unit of Measurement</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="g">Grams (g)</option>
              <option value="ltr">Litres (ltr)</option>
              <option value="box">Boxes (box)</option>
              <option value="pkt">Packets (pkt)</option>
            </select>
          </div>
        </div>

        {/* Cost vs Selling Price (Strict Numbers Only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Cost Price ({currency})</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value.replace(/[^0-9.]/g, '') })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Selling Price ({currency}) *</label>
            <input
              type="text"
              inputMode="decimal"
              required
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value.replace(/[^0-9.]/g, '') })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-mono font-bold"
            />
          </div>
        </div>

        {/* Live Profit & Margin Indicator */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>Calculated Profit per Unit:</span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-emerald-600 dark:text-emerald-300 text-sm font-mono">
              +{formatCurrency(unitProfit, currency)}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold ml-2">({marginPercent}% margin)</span>
          </div>
        </div>

        {/* Stock & Threshold (Strict Integers Only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Initial Stock Quantity</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value.replace(/\D/g, '') })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Low Stock Alert Threshold</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.minThreshold}
              onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value.replace(/\D/g, '') })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-mono font-bold"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Supplier / Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Local Distributor batch #4"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Submit */}
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
            <Save className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
