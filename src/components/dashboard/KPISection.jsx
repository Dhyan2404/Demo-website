import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { StatCard } from '../common/StatCard.jsx';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency, formatPercentage } from '../../utils/formatters.js';

export const KPISection = () => {
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const metrics = useSalesStore((state) => state.getPeriodMetrics());
  const periodFilter = useSalesStore((state) => state.periodFilter);
  const setPeriodFilter = useSalesStore((state) => state.setPeriodFilter);
  const totalUdhaar = useCustomerStore((state) => state.getTotalUdhaarPending());

  const periodLabels = {
    'today': 'Today',
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    '1year': 'This Year',
    'all': 'All Time',
  };

  return (
    <div className="space-y-4">
      {/* Time filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Business Financial Overview</h3>
          <p className="text-xs text-gray-400">Filter sales & net profit across different time periods</p>
        </div>

        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriodFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodFilter === key
                  ? 'bg-emerald-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <StatCard
          title="Total Sales (Revenue)"
          value={metrics.totalSales}
          formattedValue={formatCurrency(metrics.totalSales, currency)}
          subtitle={`${metrics.totalOrders} total completed orders`}
          icon={ShoppingCart}
          color="cyan"
          trend={14.2}
        />

        {/* Total Cost */}
        <StatCard
          title="Total Cost of Goods"
          value={metrics.totalCost}
          formattedValue={formatCurrency(metrics.totalCost, currency)}
          subtitle="Inventory cost basis"
          icon={DollarSign}
          color="rose"
        />

        {/* Net Profit */}
        <StatCard
          title="Net Profit (True Margin)"
          value={metrics.netProfit}
          formattedValue={`+${formatCurrency(metrics.netProfit, currency)}`}
          subtitle={`${metrics.marginPercentage}% overall net margin`}
          icon={TrendingUp}
          color="green"
          trend={metrics.marginPercentage}
          trendLabel="net margin"
        />

        {/* Total Udhaar (Credit) Pending */}
        <StatCard
          title="Customer Udhaar (Credit)"
          value={totalUdhaar}
          formattedValue={formatCurrency(totalUdhaar, currency)}
          subtitle="Total outstanding money owed"
          icon={CreditCard}
          color="amber"
          onClick={() => {
            const el = document.getElementById('udhaar-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
};
