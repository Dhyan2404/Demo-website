import React, { useMemo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, CreditCard } from 'lucide-react';
import { StatCard } from '../common/StatCard.jsx';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { filterByPeriod } from '../../utils/calculations.js';
import { formatCurrency } from '../../utils/formatters.js';

export const KPISection = () => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const sales = useSalesStore((state) => state.sales);
  const periodFilter = useSalesStore((state) => state.periodFilter);
  const setPeriodFilter = useSalesStore((state) => state.setPeriodFilter);
  const customers = useCustomerStore((state) => state.customers);

  const totalUdhaar = useMemo(() => {
    return customers.reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0);
  }, [customers]);

  const metrics = useMemo(() => {
    const filtered = filterByPeriod(sales, periodFilter);
    const totalSales = filtered.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
    const totalCost = filtered.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0);
    const netProfit = totalSales - totalCost;
    const marginPercentage = totalSales > 0 ? Number(((netProfit / totalSales) * 100).toFixed(1)) : 0;
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalCost,
      netProfit,
      marginPercentage,
      totalOrders,
      avgOrderValue,
    };
  }, [sales, periodFilter]);

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

        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriodFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                periodFilter === key
                  ? 'bg-emerald-500 text-gray-950 shadow-sm font-bold'
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
