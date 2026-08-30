import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, Save, RotateCcw, Download, Upload, Shield, Store, Phone, MapPin, QrCode } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { initialProducts, initialSales, initialCustomers } from '../../services/mockData.js';
import { exportFullBackupJSON, readBackupJSONFile } from '../../services/exportService.js';

export const SettingsModal = ({ isOpen, onClose }) => {
  const settings = useThemeStore((state) => state.settings);
  const updateSettings = useThemeStore((state) => state.updateSettings);
  const fidelity3D = useThemeStore((state) => state.fidelity3D);
  const setFidelity3D = useThemeStore((state) => state.setFidelity3D);
  const showToast = useThemeStore((state) => state.showToast);

  const products = useInventoryStore((state) => state.products);
  const importProducts = useInventoryStore((state) => state.importProducts);
  const sales = useSalesStore((state) => state.sales);
  const importSales = useSalesStore((state) => state.importSales);
  const customers = useCustomerStore((state) => state.customers);
  const importCustomers = useCustomerStore((state) => state.importCustomers);

  const [formData, setFormData] = useState({
    shopName: 'SmartShop',
    currencySymbol: '₹',
    ownerName: 'Shop Owner',
    phone: '',
    address: '',
    upiId: '',
    gstNumber: '',
    lowStockDefaultThreshold: 5,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        shopName: settings.shopName || 'SmartShop',
        currencySymbol: settings.currencySymbol || '₹',
        ownerName: settings.ownerName || 'Shop Owner',
        phone: settings.phone || settings.contactNumber || '',
        address: settings.address || '',
        upiId: settings.upiId || '',
        gstNumber: settings.gstNumber || '',
        lowStockDefaultThreshold: settings.lowStockDefaultThreshold || 5,
      });
    }
  }, [settings, isOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      lowStockDefaultThreshold: Math.max(1, parseInt(formData.lowStockDefaultThreshold, 10) || 5),
    });
    showToast('Shop settings saved successfully!', 'success');
    onClose();
  };

  const handleResetSampleData = () => {
    if (
      window.confirm(
        'Reset all data back to the default sample dataset? Any unsaved manual additions will be replaced.'
      )
    ) {
      importProducts(initialProducts);
      importSales(initialSales);
      importCustomers(initialCustomers);
      showToast('Restored original sample dataset!', 'info');
      onClose();
    }
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readBackupJSONFile(file);
      if (Array.isArray(data.products)) importProducts(data.products);
      if (Array.isArray(data.sales)) importSales(data.sales);
      if (Array.isArray(data.customers)) importCustomers(data.customers);
      if (data.settings) updateSettings(data.settings);
      showToast('Database snapshot restored successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to restore backup.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shop & System Settings"
      subtitle="Configure shop branding, UPI payments, 3D graphics fidelity & backup snapshots"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Business Profile */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-wider">
            Business Profile & Branding
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Shop / Store Name *</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Contact Phone (Digits only)</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300">UPI ID (for instant QR billing)</label>
              <input
                type="text"
                placeholder="yourshop@upi"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Currency Symbol</label>
              <select
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="$">$ (USD - Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - Pound)</option>
                <option value="AED ">AED (Dirham)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300">GST / Tax Number</label>
              <input
                type="text"
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Low Stock Alert Level</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.lowStockDefaultThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockDefaultThreshold: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Shop Address (Printed on receipts)</label>
            <input
              type="text"
              placeholder="e.g. Shop #14, Main Market, MG Road"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>
        </div>

        {/* 3D Graphics Fidelity */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-cyan-400" />
              <span>3D Visuals Fidelity</span>
            </label>
            <span className="text-[10px] text-slate-500 dark:text-gray-500 font-mono uppercase">{fidelity3D}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'high', label: 'High 3D', sub: 'Interactive Canvas' },
              { id: 'lite', label: 'Lite 3D', sub: 'Low GPU usage' },
              { id: 'off', label: 'Off 2D', sub: 'Pure UI only' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setFidelity3D(mode.id)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  fidelity3D === mode.id
                    ? 'bg-amber-500/20 dark:bg-cyan-500/20 border-amber-500/60 dark:border-cyan-500/50 text-amber-900 dark:text-cyan-300 shadow-sm font-black'
                    : 'bg-slate-100 dark:bg-white/[0.02] border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <p className="text-xs font-bold">{mode.label}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-0.5">{mode.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Database Backup & Snapshots */}
        <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-white/[0.02] border border-amber-500/20 dark:border-white/5 space-y-2.5">
          <h4 className="text-xs font-bold text-amber-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Database Backup & Snapshots</span>
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-gray-400">
            Export a full JSON snapshot of all inventory, sales, customer ledgers, and shop settings.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                exportFullBackupJSON({ products, sales, customers, settings: formData });
                showToast('Full backup JSON downloaded!', 'success');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/[0.04] dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-600 dark:text-emerald-400" />
              <span>Download Backup</span>
            </button>

            <label className="flex-1 py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/[0.04] dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-cyan-400" />
              <span>Restore Backup</span>
              <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleResetSampleData}
              className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
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
            <Save className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
