import React from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, ShoppingBag, Target } from 'lucide-react';
import { TopPerformersGrid } from './TopPerformersGrid.jsx';
import { MarginBreakdownChart } from './MarginBreakdownChart.jsx';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency, formatPercentage } from '../../utils/formatters.js';
import { exportSalesToCSV } from '../../services/exportService.js';

export const ProfitAnalyticsSection = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const metrics = useSalesStore((state) => state.getPeriodMetrics());

  return (
    <section id="analytics-section" className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Deep Profit & Performance Analytics</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Discover your highest net earners, average order margins, and cashflow dynamics
          </p>
        </div>

        <button
          onClick={() => exportSalesToCSV(sales)}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/[0.04] hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Top Performers (Most Profitable vs Most Sold) */}
      <TopPerformersGrid />

      {/* Visual Chart Distributions */}
      <MarginBreakdownChart />
    </section>
  );
};
