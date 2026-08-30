import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  MessageCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  History,
  Phone,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { exportCustomersToCSV } from '../../services/exportService.js';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters.js';

export const UdhaarSection = () => {
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);

  const customers = useCustomerStore((state) => state.customers);
  const searchQuery = useCustomerStore((state) => state.searchQuery);
  const setSearchQuery = useCustomerStore((state) => state.setSearchQuery);
  const filterStatus = useCustomerStore((state) => state.filterStatus);
  const setFilterStatus = useCustomerStore((state) => state.setFilterStatus);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);
  const filteredCustomers = useCustomerStore((state) => state.getFilteredCustomers());
  const totalPendingUdhaar = useCustomerStore((state) => state.getTotalUdhaarPending());

  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const shopName = useThemeStore((state) => state.settings.shopName || 'SmartShop');
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);

  const debtorsCount = customers.filter((c) => (c.currentBalance || 0) > 0).length;
  const totalPaidAll = customers.reduce((acc, c) => acc + (c.totalPaid || 0), 0);

  const handleSendWhatsAppReminder = (customer) => {
    if (!customer.phone) {
      showToast('No phone number saved for this customer', 'warning');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const amountStr = formatCurrency(customer.currentBalance, currency);
    const msg = encodeURIComponent(
      `Hello ${customer.name}, this is a friendly reminder from ${shopName} regarding your pending balance of ${amountStr}. Please let us know when you would like to clear this. Thank you!`
    );
    window.open(`https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${msg}`, '_blank');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete customer account for "${name}"?`)) {
      deleteCustomer(id);
      showToast(`Removed customer ${name}`, 'info');
    }
  };

  return (
    <section id="udhaar-section" className="scroll-mt-24 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Customer Tracking & Udhaar Ledger
            </h2>
            <p className="text-xs text-gray-400">
              Manage credit sales, record repayments, and send instant WhatsApp debt reminders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => exportCustomersToCSV(customers)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all"
            title="Export Customer Ledger CSV"
          >
            <Download className="w-4 h-4 text-gray-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openModal('customer_form')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-xs shadow-glow-amber hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 text-gray-950 stroke-[3]" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/25 to-gray-900/40 space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Total Pending Udhaar</span>
          <p className="text-2xl font-extrabold text-amber-400 text-glow-amber">
            {formatCurrency(totalPendingUdhaar, currency)}
          </p>
          <p className="text-xs text-amber-300/80">{debtorsCount} customer accounts with outstanding debt</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Repayments Collected</span>
          <p className="text-2xl font-extrabold text-emerald-400">
            {formatCurrency(totalPaidAll, currency)}
          </p>
          <p className="text-xs text-gray-500">Cumulative recovered money</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Customer Accounts</span>
          <p className="text-2xl font-extrabold text-cyan-400">{customers.length}</p>
          <p className="text-xs text-gray-500">{customers.length - debtorsCount} accounts fully settled</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-900/90 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'has_debt', label: `Pending Debt (${debtorsCount})` },
            { id: 'settled', label: 'Settled' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === f.id
                  ? 'bg-amber-500 text-gray-950 shadow-sm'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const hasDebt = (customer.currentBalance || 0) > 0;
          return (
            <div
              key={customer.id}
              className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                hasDebt
                  ? 'border-amber-500/30 bg-gradient-to-b from-amber-950/10 to-transparent'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Customer Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{customer.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-500" />
                      <span>{customer.phone || 'No phone'}</span>
                    </div>
                  </div>
                  <Badge variant={hasDebt ? 'warning' : 'success'} size="sm">
                    {hasDebt ? 'Pending Debt' : 'Settled'}
                  </Badge>
                </div>

                {customer.address && (
                  <p className="text-[11px] text-gray-500 mt-1 truncate">{customer.address}</p>
                )}
              </div>

              {/* Debt & Credit Metrics */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Total Credit Given:</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(customer.totalCredit, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Total Paid Back:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(customer.totalPaid, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-white/5">
                  <span className={hasDebt ? 'text-amber-400' : 'text-gray-300'}>
                    Current Pending (Udhaar):
                  </span>
                  <span className={hasDebt ? 'text-amber-400 text-glow-amber' : 'text-emerald-400'}>
                    {formatCurrency(customer.currentBalance, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                {hasDebt && (
                  <button
                    onClick={() => openModal('record_payment', customer)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Collect Payment</span>
                  </button>
                )}

                {hasDebt && customer.phone && (
                  <button
                    onClick={() => handleSendWhatsAppReminder(customer)}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
                    title="Send WhatsApp Payment Reminder"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedCustomerForHistory(customer)}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-all"
                  title="View Ledger Statement"
                >
                  <History className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(customer.id, customer.name)}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 border border-white/5 transition-all"
                  title="Delete Customer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 text-xs glass-panel rounded-2xl border border-white/5">
            No customer accounts found for "{searchQuery}".
          </div>
        )}
      </div>

      {/* Customer Ledger History Modal / Drawer */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-xl glass-panel rounded-2xl border border-white/10 p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Udhaar Statement: {selectedCustomerForHistory.name}
                </h3>
                <p className="text-xs text-gray-400">{selectedCustomerForHistory.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="text-gray-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-gray-400">Total Credit:</span>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(selectedCustomerForHistory.totalCredit, currency)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-amber-300">Remaining Balance:</span>
                <p className="text-sm font-extrabold text-amber-400">
                  {formatCurrency(selectedCustomerForHistory.currentBalance, currency)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Transaction Ledger History
              </p>
              <div className="space-y-2">
                {(selectedCustomerForHistory.transactions || []).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            tx.type === 'credit' ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {tx.type === 'credit' ? 'Udhaar Purchase' : 'Payment Received'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {formatDateTime(tx.date)}
                        </span>
                      </div>
                      {tx.note && <p className="text-[11px] text-gray-400 mt-0.5">{tx.note}</p>}
                    </div>

                    <span
                      className={`text-sm font-extrabold ${
                        tx.type === 'credit' ? 'text-amber-300' : 'text-emerald-400'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                ))}

                {(!selectedCustomerForHistory.transactions ||
                  selectedCustomerForHistory.transactions.length === 0) && (
                  <p className="text-center py-6 text-xs text-gray-500">
                    No individual ledger records logged yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
