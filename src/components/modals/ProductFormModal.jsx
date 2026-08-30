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
    if (isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) < 0) {
      showToast('Please enter a valid selling price.', 'warning');
      return;
    }

    if (isEditing) {
      updateProduct(product.id, formData);
      showToast(`Updated "${formData.name}"`, 'success');
    } else {
      addProduct(formData);
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
            <label className="text-xs font-semibold text-gray-300">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Wireless Mouse, Basmati Rice"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">SKU / Barcode</label>
            <input
              type="text"
              placeholder="SKU-1001"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-brand-500 uppercase"
            />
          </div>
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Category</label>
            <input
              type="text"
              list="category-suggestions"
              placeholder="e.g. Electronics, Grocery"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
            />
            <datalist id="category-suggestions">
              {categories.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Unit of Measurement</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
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

        {/* Cost vs Selling Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Cost Price ({currency})</label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Selling Price ({currency}) *</label>
            <input
              type="number"
              step="any"
              min="0"
              required
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Live Profit & Margin Indicator */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Calculated Profit per Unit:</span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-emerald-300 text-sm">
              +{formatCurrency(unitProfit, currency)}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium ml-2">({marginPercent}% margin)</span>
          </div>
        </div>

        {/* Stock & Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Initial Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Low Stock Alert Threshold</label>
            <input
              type="number"
              min="0"
              value={formData.minThreshold}
              onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Supplier / Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Local Distributor batch #4"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Submit */}
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
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
