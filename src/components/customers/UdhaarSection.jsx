import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { exportCustomersToCSV } from '../../services/exportService.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export const UdhaarSection = () => {
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState(null);

  const customers = useCustomerStore((state) => state.customers || []);
  const searchQuery = useCustomerStore((state) => state.searchQuery);
  const setSearchQuery = useCustomerStore((state) => state.setSearchQuery);
  const filterStatus = useCustomerStore((state) => state.filterStatus);
  const setFilterStatus = useCustomerStore((state) => state.setFilterStatus);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);

  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 16;

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Compute filtered customers with useMemo
  const filteredCustomers = useMemo(() => {
    return (customers || []).filter((c) => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q));

      let matchesFilter = true;
      if (filterStatus === 'has_debt') {
        matchesFilter = (c.currentBalance || 0) > 0;
      } else if (filterStatus === 'settled') {
        matchesFilter = (c.currentBalance || 0) <= 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [customers, searchQuery, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedCustomers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, safePage, pageSize]);

  // Compute total pending Udhaar with useMemo
  const totalPendingUdhaar = useMemo(() => {
    return (customers || []).reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0);
  }, [customers]);

  const debtorsCount = useMemo(() => {
    return (customers || []).filter((c) => (c.currentBalance || 0) > 0).length;
  }, [customers]);

  const totalPaidAll = useMemo(() => {
    return (customers || []).reduce((acc, c) => acc + (Number(c.totalPaid) || 0), 0);
  }, [customers]);

  const handleSendWhatsAppReminder = (customer) => {
    if (!customer?.phone) {
      showToast('No phone number saved for this customer', 'warning');
      return;
    }
    openModal('whatsapp_templates', customer);
  };

  const handleDelete = (id, name) => {
    deleteCustomer(id);
    showToast(`Removed customer ${name}`, 'info');
  };

  return (
    <section id="udhaar-section" className="scroll-mt-24 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer CRM & Udhaar Ledger
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Track credit sales, record settlements, and send 1-tap WhatsApp payment reminders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => exportCustomersToCSV(customers)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title="Export Customer Ledger CSV"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-gray-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openModal('customer_form')}
            className="btn-shimmer flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-white dark:from-amber-950/25 dark:via-gray-900/40 space-y-1">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Total Pending Udhaar</span>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 text-glow-amber font-mono">
            {formatCurrency(totalPendingUdhaar, currency)}
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300/80 font-medium">{debtorsCount} customer accounts with outstanding debt</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total Repayments Collected</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(totalPaidAll, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-400">Cumulative recovered revenue</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total Registered Accounts</span>
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{(customers || []).length}</p>
          <p className="text-xs text-slate-500 dark:text-gray-400">{Math.max(0, (customers || []).length - debtorsCount)} accounts all clear</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-gray-900/90 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 text-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'has_debt', label: `Pending Debt (${debtorsCount})` },
            { id: 'settled', label: 'Settled' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {paginatedCustomers.map((customer) => {
          const hasDebt = (customer.currentBalance || 0) > 0;
          return (
            <div
              key={customer.id || customer._id}
              className={`glass-panel p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all shadow-sm ${
                hasDebt
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-white dark:from-amber-950/15 dark:to-transparent'
                  : 'border-slate-200 dark:border-white/10 hover:border-amber-500/30'
              }`}
            >
              {/* Customer Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{customer.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                      <a
                        href={`tel:${customer.phone}`}
                        className="flex items-center gap-1 text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-emerald-400 font-mono font-bold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-emerald-400" />
                        <span>{customer.phone || 'No phone'}</span>
                      </a>
                    </div>
                  </div>
                  <Badge variant={hasDebt ? 'warning' : 'success'} size="sm">
                    {hasDebt ? 'Pending Debt' : 'Settled'}
                  </Badge>
                </div>

                {customer.address && (
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5 truncate font-medium">{customer.address}</p>
                )}
              </div>

              {/* Debt & Credit Metrics */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Total Credit Given:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(customer.totalCredit, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Total Paid Back:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency(customer.totalPaid, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-1.5 border-t border-slate-200 dark:border-white/5">
                  <span className={hasDebt ? 'text-amber-800 dark:text-amber-400' : 'text-slate-700 dark:text-gray-300'}>
                    Pending Balance (Udhaar):
                  </span>
                  <span className={`font-mono font-black ${hasDebt ? 'text-amber-700 dark:text-amber-400 text-glow-amber' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(customer.currentBalance, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                {hasDebt && (
                  <button
                    onClick={() => openModal('record_payment', customer)}
                    className="btn-shimmer flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <ArrowDownLeft className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Collect Payment</span>
                  </button>
                )}

                {hasDebt && customer.phone && (
                  <button
                    onClick={() => handleSendWhatsAppReminder(customer)}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-amber-800 dark:text-emerald-300 border border-amber-500/30 dark:border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Send WhatsApp Payment Reminder"
                  >
                    <MessageCircle className="w-4 h-4 text-amber-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Reminder</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedCustomerForHistory(customer)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
                  title="View Ledger Statement"
                >
                  <History className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(customer.id || customer._id, customer.name)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-white/[0.04] dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-white/5 transition-all cursor-pointer"
                  title="Delete Customer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-gray-400 text-xs glass-panel rounded-2xl border border-slate-200 dark:border-white/5">
            No customer accounts found for "{searchQuery}".
          </div>
        )}
      </div>

      {/* Customer Pagination Controls */}
      {filteredCustomers.length > pageSize && (
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-gray-400">
            Showing <span className="font-bold text-slate-900 dark:text-white">{(safePage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-slate-900 dark:text-white">{Math.min(safePage * pageSize, filteredCustomers.length)}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{filteredCustomers.length}</span> customers
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all cursor-pointer"
            >
              Previous
            </button>

            <div className="flex items-center gap-1 px-2">
              <span className="font-bold text-amber-600 dark:text-amber-400">{safePage}</span>
              <span className="text-slate-400 dark:text-gray-600">/</span>
              <span className="text-slate-600 dark:text-gray-400">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Customer Ledger History Statement Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-white dark:bg-gray-950 rounded-3xl border border-slate-200 dark:border-white/10 p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Udhaar Statement: {selectedCustomerForHistory.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">{selectedCustomerForHistory.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-gray-400">Total Credit:</span>
                <p className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                  {formatCurrency(selectedCustomerForHistory.totalCredit, currency)}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30">
                <span className="text-amber-800 dark:text-amber-300 font-bold">Remaining Udhaar Balance:</span>
                <p className="text-base font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                  {formatCurrency(selectedCustomerForHistory.currentBalance, currency)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-wider">
                Full Transaction Statement
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {(selectedCustomerForHistory.transactions || []).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            tx.type === 'credit' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {tx.type === 'credit' ? 'Udhaar Taken' : 'Payment Received'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">
                          {formatDateTime(tx.date)}
                        </span>
                      </div>
                      {tx.note && <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-0.5 font-medium">{tx.note}</p>}
                    </div>

                    <span
                      className={`text-sm font-black font-mono ${
                        tx.type === 'credit' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                ))}

                {(!selectedCustomerForHistory.transactions ||
                  selectedCustomerForHistory.transactions.length === 0) && (
                  <p className="text-center py-6 text-xs text-slate-500 dark:text-gray-400">
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
