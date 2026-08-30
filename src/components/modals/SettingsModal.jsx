import React, { useState } from 'react';
import { Settings, Sparkles, Save, RotateCcw, Download, Upload, Shield } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { initialProducts, initialSales, initialCustomers } from '../../services/mockData.js';
import { exportFullBackupJSON } from '../../services/exportService.js';

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
    shopName: settings.shopName || 'SmartShop',
    currencySymbol: settings.currencySymbol || '₹',
    ownerName: settings.ownerName || 'Shop Owner',
    contactNumber: settings.contactNumber || '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formData);
    showToast('Settings saved successfully!', 'success');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shop & System Settings"
      subtitle="Configure shop branding, 3D graphics fidelity, and database controls"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Branding */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Business Profile
          </h4>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Shop / Store Name</label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Currency Symbol</label>
              <select
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="$">$ (USD - Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - Pound)</option>
                <option value="AED ">AED (Dirham)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Owner Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* 3D Graphics Fidelity */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Visuals Fidelity</span>
            </label>
            <span className="text-[10px] text-gray-500 font-mono uppercase">{fidelity3D}</span>
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
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  fidelity3D === mode.id
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <p className="text-xs font-bold">{mode.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{mode.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Data Reset */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Database Maintenance
          </h4>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                exportFullBackupJSON({ products, sales, customers });
                showToast('Backup JSON downloaded!', 'success');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Backup</span>
            </button>

            <button
              type="button"
              onClick={handleResetSampleData}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>
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
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
