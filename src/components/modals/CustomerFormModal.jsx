import React, { useState } from 'react';
import { Users, Save } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';

export const CustomerFormModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    initialBalance: '',
  });

  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Customer name is required.', 'warning');
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      showToast('Valid numeric phone number is required.', 'warning');
      return;
    }

    const initDebt = Math.max(0, Number(formData.initialBalance) || 0);
    await addCustomer({
      name: formData.name.trim(),
      phone: cleanPhone,
      email: formData.email.trim(),
      address: formData.address.trim(),
      totalCredit: initDebt,
      totalPaid: 0,
      initialBalance: initDebt,
    });

    showToast(`Customer account for "${formData.name}" created!`, 'success');
    setFormData({ name: '', phone: '', email: '', address: '', initialBalance: '' });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer Account"
      subtitle="Register customer for Udhaar credit tracking and automated payment reminders"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Customer Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Rajesh Kumar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Phone Number (Numbers only) *</label>
          <input
            type="tel"
            required
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-mono"
          />
          <span className="text-[10px] text-slate-500 dark:text-gray-400">Strictly digits only (10-digit mobile number)</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Email Address (Optional)</label>
          <input
            type="email"
            placeholder="e.g. rajesh@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Address / Location (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Sector 12, Shop #34"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-amber-700 dark:text-amber-300">
            Existing Previous Udhaar Balance ({currency})
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={formData.initialBalance}
            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value.replace(/[^0-9.]/g, '') })}
            className="w-full px-3.5 py-2.5 bg-amber-500/10 dark:bg-gray-900 border border-amber-500/40 rounded-xl text-slate-900 dark:text-white placeholder-amber-500/40 text-xs focus:outline-none focus:border-amber-500 font-mono font-bold"
          />
          <p className="text-[10px] text-slate-500 dark:text-gray-400">Leave empty or 0 if customer starts with zero debt.</p>
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
            <span>Save Customer</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
