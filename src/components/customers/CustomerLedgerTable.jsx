import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Send,
  CreditCard,
  CheckCircle2,
  Trash2,
  Download,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { exportCustomersToCSV } from '../../services/exportService.js';
import { Modal } from '../common/Modal.jsx';

export const CustomerLedgerTable = () => {
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);

  const customers = useCustomerStore((state) => state.customers);
  const searchQuery = useCustomerStore((state) => state.searchQuery);
  const setSearchQuery = useCustomerStore((state) => state.setSearchQuery);
  const filterStatus = useCustomerStore((state) => state.filterStatus);
  const setFilterStatus = useCustomerStore((state) => state.setFilterStatus);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);
  const totalUdhaarPending = useCustomerStore((state) => state.getTotalUdhaarPending());
  const filteredCustomers = useCustomerStore((state) => state.getFilteredCustomers());

  // Add customer modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', email: '', address: '', initialBalance: '' });

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.name.trim() || !newCust.phone.trim()) {
      showToast('Name and phone are required', 'warning');
      return;
    }

    const created = await addCustomer(newCust);
    showToast(`Added customer "${created.name}"`, 'success');
    setNewCust({ name: '', phone: '', email: '', address: '', initialBalance: '' });
    setIsAddModalOpen(false);
  };

  const handleDelete = (cust) => {
    if (cust.currentBalance > 0) {
      if (!window.confirm(`Warning: ${cust.name} still has an outstanding Udhaar balance of ${formatCurrency(cust.currentBalance, currency)}. Delete anyway?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete customer "${cust.name}"?`)) return;
    }
    deleteCustomer(cust.id || cust._id);
    showToast(`Deleted ${cust.name}`, 'info');
  };

  return (
    <section id="udhaar-section" className="space-y-6 pt-4">
      {/* Header & Pending Udhaar KPI Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <CreditCard className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Customer Credit (Udhaar) Ledger</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Track customer debts, log partial payments, view statements & send 1-click WhatsApp payment reminders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl glass-panel border border-amber-500/30 bg-amber-500/5 text-xs">
            <span className="text-amber-400 block text-[10px] uppercase font-bold">Total Udhaar Pending</span>
            <span className="font-extrabold text-amber-300 text-base font-mono">{formatCurrency(totalUdhaarPending, currency)}</span>
          </div>

          <button
            onClick={() => exportCustomersToCSV(customers)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/[0.04] hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 transition-all"
            title="Download Customer Ledger CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold rounded-xl text-xs shadow-glow-amber hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 text-gray-950" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Customers', count: customers.length },
            { id: 'has_debt', label: 'Pending Debt', count: customers.filter(c => (c.currentBalance || 0) > 0).length },
            { id: 'settled', label: 'Settled / Clear', count: customers.filter(c => (c.currentBalance || 0) === 0).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Customer Ledger Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4 text-right">Total Credit Taken</th>
                <th className="py-3.5 px-4 text-right">Total Paid Back</th>
                <th className="py-3.5 px-4 text-right">Current Udhaar Balance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredCustomers.map((c) => {
                const hasDebt = (c.currentBalance || 0) > 0;

                return (
                  <tr key={c.id || c.phone} className="hover:bg-white/[0.02] transition-colors group">
                    
                    {/* Customer Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {c.name}
                      </div>
                      {c.address && <p className="text-[11px] text-gray-500 mt-0.5">{c.address}</p>}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span>{c.phone}</span>
                      </div>
                    </td>

                    {/* Total Credit */}
                    <td className="py-3.5 px-4 text-right font-mono text-gray-400">
                      {formatCurrency(c.totalCredit || 0, currency)}
                    </td>

                    {/* Total Paid */}
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                      {formatCurrency(c.totalPaid || 0, currency)}
                    </td>

                    {/* Current Balance */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={`text-sm font-extrabold ${hasDebt ? 'text-amber-400 text-glow-amber' : 'text-emerald-400'}`}>
                        {formatCurrency(c.currentBalance || 0, currency)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {hasDebt ? (
                        <Badge variant="warning" size="sm">Debt Pending</Badge>
                      ) : (
                        <Badge variant="success" size="sm">All Clear</Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasDebt && (
                          <>
                            {/* WhatsApp Reminder */}
                            <button
                              onClick={() => openModal('whatsapp_reminder', c)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Send WhatsApp Reminder"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>

                            {/* Record Payment */}
                            <button
                              onClick={() => openModal('record_payment', c)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-sm transition-all"
                              title="Settle or Record Payment"
                            >
                              Settle
                            </button>
                          </>
                        )}

                        {/* View Statement */}
                        <button
                          onClick={() => openModal('customer_detail', c)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="View Ledger Statement"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer Account"
        subtitle="Register customer for sales tracking and Udhaar ledger management"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Customer Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Phone Number (10 Digits) *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={newCust.phone}
              onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Email Address (Optional)</label>
            <input
              type="email"
              placeholder="e.g. ramesh@example.com"
              value={newCust.email}
              onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Address / Location (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Shop 2, Main Bazaar"
              value={newCust.address}
              onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Opening Udhaar Debt Balance ({currency})</label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={newCust.initialBalance}
              onChange={(e) => setNewCust({ ...newCust, initialBalance: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-glow-amber transition-all"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};
