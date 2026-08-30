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
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Customer name is required.', 'warning');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Customer phone number is required.', 'warning');
      return;
    }

    const initDebt = Number(formData.initialBalance) || 0;
    await addCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
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
          <label className="text-xs font-semibold text-gray-300">Customer Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Rajesh Kumar"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Phone Number (for WhatsApp) *</label>
          <input
            type="tel"
            required
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Email Address (Optional)</label>
          <input
            type="email"
            placeholder="e.g. rajesh@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Address / Location (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Sector 12, Shop #34"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-amber-300">
            Existing Previous Udhaar Balance ({currency})
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={formData.initialBalance}
            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-amber-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
          />
          <p className="text-[10px] text-gray-500">Leave 0 if customer has zero previous debt.</p>
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
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-extrabold rounded-xl shadow-glow-amber flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Customer</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
