import React, { useState, useEffect } from 'react';
import { Store, User, DollarSign, Bell, Shield, Phone, MapPin, QrCode, Download, Upload, Check, Sparkles, ShoppingBag, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { exportFullBackupJSON, readBackupJSONFile } from '../../services/exportService.js';
import { SHOP_TYPE_LIST } from '../../data/shopTemplates.js';

export const SettingsModal = ({ isOpen, onClose }) => {
  const settings = useThemeStore((state) => state.settings);
  const updateSettings = useThemeStore((state) => state.updateSettings);
  const showToast = useThemeStore((state) => state.showToast);

  const products = useInventoryStore((state) => state.products);
  const importProducts = useInventoryStore((state) => state.importProducts);
  const sales = useSalesStore((state) => state.sales);
  const importSales = useSalesStore((state) => state.importSales);
  const customers = useCustomerStore((state) => state.customers);
  const importCustomers = useCustomerStore((state) => state.importCustomers);

  const addProduct = useInventoryStore((state) => state.addProduct);

  const [form, setForm] = useState({
    shopName: '',
    ownerName: '',
    currencySymbol: '₹',
    currencyCode: 'INR',
    phone: '',
    address: '',
    lowStockDefaultThreshold: 5,
    upiId: '',
    gstNumber: '',
    shopType: '',
  });

  const [selectedShopType, setSelectedShopType] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (settings) {
      setForm({
        shopName: settings.shopName || '',
        ownerName: settings.ownerName || '',
        currencySymbol: settings.currencySymbol || '₹',
        currencyCode: settings.currencyCode || 'INR',
        phone: settings.phone || '',
        address: settings.address || '',
        lowStockDefaultThreshold: settings.lowStockDefaultThreshold || 5,
        upiId: settings.upiId || '',
        gstNumber: settings.gstNumber || '',
        shopType: settings.shopType || '',
      });
      if (settings.shopType) {
        setSelectedShopType(SHOP_TYPE_LIST.find(t => t.id === settings.shopType) || null);
      }
    }
  }, [settings, isOpen]);

  const handleLoadShopProducts = async () => {
    if (!selectedShopType) return;
    setLoadingProducts(true);
    try {
      let count = 0;
      for (const p of selectedShopType.products) {
        // Check if SKU already exists
        const exists = products.some(ep => ep.sku === p.sku || ep.name.toLowerCase() === p.name.toLowerCase());
        if (!exists) {
          addProduct({ ...p, id: undefined });
          count++;
        }
      }
      setLoadedCount(count);
      showToast(`${count} products added to inventory!`, 'success');
      updateSettings({ ...form, shopType: selectedShopType.id });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(form);
    showToast('Shop settings saved successfully', 'success');
    onClose();
  };

  const handleExportBackup = () => {
    exportFullBackupJSON({
      settings: form,
      products,
      sales,
      customers,
    });
    showToast('Full system backup JSON downloaded', 'success');
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readBackupJSONFile(file);
      if (data.products && Array.isArray(data.products)) importProducts(data.products);
      if (data.sales && Array.isArray(data.sales)) importSales(data.sales);
      if (data.customers && Array.isArray(data.customers)) importCustomers(data.customers);
      if (data.settings) updateSettings(data.settings);

      showToast('Data snapshot restored successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Store Settings & Data Backup"
      subtitle="Customize shop branding, currency, UPI details & manage snapshots"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Shop Type Selector */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            Shop Category
          </h4>
          <p className="text-[11px] text-gray-400">Select your shop type to get a starter product catalog instantly loaded into your inventory.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SHOP_TYPE_LIST.map((type) => {
              const isSelected = selectedShopType?.id === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedShopType(isSelected ? null : type);
                    setForm(f => ({ ...f, shopType: isSelected ? '' : type.id }));
                    setLoadedCount(0);
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-gray-300'
                  }`}
                >
                  <div className="text-lg mb-0.5">{type.icon}</div>
                  <div className="text-[11px] font-bold leading-tight">{type.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{type.products.length} products</div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedShopType && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">{selectedShopType.icon} {selectedShopType.label} selected</p>
                <p className="text-[11px] text-gray-400">
                  {selectedShopType.products.length} products ready to load
                  {loadedCount > 0 && <span className="text-emerald-400 font-semibold"> · {loadedCount} added ✓</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadShopProducts}
                disabled={loadingProducts}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Package className="w-3.5 h-3.5" />
                {loadingProducts ? 'Loading...' : 'Load Products'}
              </button>
            </div>
          )}
        </div>

        {/* Shop Branding */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Shop Identity</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Shop / Store Name</label>
              <input
                type="text"
                required
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Owner Name</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">UPI ID for Payments</label>
              <input
                type="text"
                placeholder="yourshop@upi"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Shop Address (Printed on receipts)</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Currency & Thresholds */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Currency & Stock Threshold</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Currency Symbol</label>
              <select
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="₹">₹ (Indian Rupee - INR)</option>
                <option value="$">$ (US Dollar - USD)</option>
                <option value="€">€ (Euro - EUR)</option>
                <option value="£">£ (British Pound - GBP)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Default Low Stock Alert</label>
              <input
                type="number"
                min="1"
                value={form.lowStockDefaultThreshold}
                onChange={(e) => setForm({ ...form, lowStockDefaultThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Full System Backup & Restore */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Portability & Backup Snapshots</span>
          </h4>
          <p className="text-[11px] text-gray-400">
            Export a full JSON backup of all products, sales history, customer Udhaar accounts, and settings.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Backup JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Restore Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-glow-green transition-all"
          >
            Save Settings
          </button>
        </div>

      </form>
    </Modal>
  );
};
