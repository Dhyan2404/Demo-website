import React from 'react';
import { Receipt, ArrowUpRight, Clock, Eye, ShoppingCart } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export const RecentActivityFeed = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const openModal = useThemeStore((state) => state.openModal);

  const recentSales = sales.slice(0, 6);

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
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Recent Sales Activity</h4>
            <p className="text-xs text-gray-400">Live feed of transactions, profit margins & receipts</p>
          </div>
        </div>

        <button
          onClick={() => openModal('pos')}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          + Quick Billing
        </button>
      </div>

      <div className="divide-y divide-white/[0.06] -mx-1">
        {recentSales.map((sale) => (
          <div
            key={sale.id || sale.invoiceNo}
            className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl transition-colors group"
          >
            {/* Left Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-300 group-hover:text-white">
                  {sale.invoiceNo}
                </span>
                {getPaymentBadge(sale.paymentMethod)}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span>{sale.customerName || 'Walk-in'}</span>
                <span>•</span>
                <span>{(sale.items || []).length} item{(sale.items || []).length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span className="text-[11px] text-gray-500">{formatDateTime(sale.createdAt)}</span>
              </div>
            </div>

            {/* Right Amount & Profit */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold text-white">{formatCurrency(sale.totalAmount, currency)}</p>
                <p className="text-[11px] font-semibold text-emerald-400">
                  Profit: +{formatCurrency(sale.netProfit, currency)}
                </p>
              </div>

              <button
                onClick={() => openModal('receipt', sale)}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-all"
                title="View & Print Receipt"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {recentSales.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-sm">
            No sales recorded yet. Click "New Sale" to create your first transaction.
          </div>
        )}
      </div>
    </div>
  );
};
