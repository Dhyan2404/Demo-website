import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { generateTimelineChartData } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

const CustomTooltip = ({ active, payload, label, currency, isDarkMode }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find(p => p.dataKey === 'revenue')?.value || 0;
    const cost = payload.find(p => p.dataKey === 'cost')?.value || 0;
    const profit = payload.find(p => p.dataKey === 'profit')?.value || 0;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    return (
      <div className="glass-panel p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/15 shadow-2xl space-y-1.5 min-w-[170px]">
        <p className="text-xs font-bold text-slate-800 dark:text-gray-300 border-b border-black/[0.06] dark:border-white/10 pb-1">{label}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-gray-400">Revenue:</span>
          <span className="font-semibold text-cyan-600 dark:text-cyan-400 font-mono">{formatCurrency(revenue, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-gray-400">Cost:</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(cost, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-black/[0.06] dark:border-white/10">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Net Profit:</span>
          <span className="font-black text-emerald-700 dark:text-emerald-300 text-glow-green font-mono">+{formatCurrency(profit, currency)}</span>
        </div>
        <div className="text-[10px] text-right text-slate-500 dark:text-gray-400 font-bold">
          Margin: {margin}%
        </div>
      </div>
    );
  }
  return null;
};

export const ProfitOverviewChart = () => {
  const sales = useSalesStore((state) => state.sales);
  const periodFilter = useSalesStore((state) => state.periodFilter);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const chartData = generateTimelineChartData(sales, periodFilter);

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-black/[0.06] dark:border-white/10 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Financial Profit & Revenue Flow</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">Visual trend of revenue vs total cost of goods</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-glow-cyan" />
            <span className="text-slate-600 dark:text-gray-300">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-green" />
            <span className="text-emerald-600 dark:text-emerald-400">Net Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-500 dark:text-gray-400">Cost</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={isDarkMode ? 0.45 : 0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={isDarkMode ? 0.35 : 0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={isDarkMode ? 0.2 : 0.1} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke={isDarkMode ? '#6b7280' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke={isDarkMode ? '#6b7280' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${currency}${formatCompactNumber(v)}`}
            />

            <Tooltip content={<CustomTooltip currency={currency} isDarkMode={isDarkMode} />} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGrad)"
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#costGrad)"
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#profitGrad)"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
