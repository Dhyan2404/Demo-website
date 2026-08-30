import React from 'react';
import { Receipt, ArrowUpRight, Clock, Eye, ShoppingCart } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useScrollStore } from '../../store/useScrollStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export const RecentActivityFeed = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const openModal = useThemeStore((state) => state.openModal);
  const setActiveSection = useScrollStore((state) => state.setActiveSection);

  const recentSales = (sales || []).slice(0, 6);

  const getPaymentBadge = (method) => {
    switch (method) {
      case 'upi':
        return <Badge variant="info" size="sm">UPI Online</Badge>;
      case 'card':
        return <Badge variant="purple" size="sm">Card</Badge>;
      case 'udhaar':
        return <Badge variant="warning" size="sm">Udhaar (Credit)</Badge>;
      default:
        return <Badge variant="success" size="sm">Cash</Badge>;
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-black/[0.06] dark:border-white/10 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Sales Activity</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">Live feed of transactions, profit margins & receipts</p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection('pos')}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          + Quick Billing
        </button>
      </div>

      <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06] -mx-1">
        {recentSales.map((sale) => (
          <div
            key={sale.id || sale.invoiceNumber || sale.invoiceNo}
            onClick={() => openModal('receipt', sale)}
            className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] rounded-xl transition-all cursor-pointer group"
          >
            {/* Left Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {sale.invoiceNumber || sale.invoiceNo}
                </span>
                {getPaymentBadge(sale.paymentMethod)}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 truncate font-medium">
                {sale.customerName || 'Walk-in'} • {sale.items?.length || 1} items
              </p>
            </div>

            {/* Right Financials */}
            <div className="text-right shrink-0">
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(sale.totalAmount, currency)}
              </p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                <span>Profit:</span>
                <span>+{formatCurrency(sale.netProfit || 0, currency)}</span>
              </div>
            </div>
          </div>
        ))}

        {recentSales.length === 0 && (
          <div className="py-8 text-center text-slate-400 dark:text-gray-500 text-xs">
            No sales recorded yet. Click Express POS to bill your first order!
          </div>
        )}
      </div>
    </div>
  );
};
