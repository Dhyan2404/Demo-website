import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { generateTimelineChartData } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find(p => p.dataKey === 'revenue')?.value || 0;
    const cost = payload.find(p => p.dataKey === 'cost')?.value || 0;
    const profit = payload.find(p => p.dataKey === 'profit')?.value || 0;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    return (
      <div className="glass-panel p-3.5 rounded-xl border border-white/15 shadow-2xl space-y-1.5 min-w-[170px]">
        <p className="text-xs font-bold text-gray-300 border-b border-white/10 pb-1">{label}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Revenue:</span>
          <span className="font-semibold text-cyan-400">{formatCurrency(revenue, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Cost:</span>
          <span className="font-semibold text-rose-400">{formatCurrency(cost, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
          <span className="text-emerald-400 font-bold">Net Profit:</span>
          <span className="font-extrabold text-emerald-300 text-glow-green">+{formatCurrency(profit, currency)}</span>
        </div>
        <div className="text-[10px] text-right text-gray-500 font-medium">
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
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');

  const chartData = generateTimelineChartData(sales, periodFilter);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Sales & Net Profit Trajectory</h4>
            <p className="text-xs text-gray-400">Live breakdown of revenue, product costs, and true net margin</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-gray-300 font-medium">Net Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-gray-300 font-medium">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="text-gray-300 font-medium">Cost</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${currency}${formatCompactNumber(v)}`}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
              <Area
                type="monotone"
                dataKey="cost"
                name="Cost"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#22c55e"
                strokeWidth={3}
                fill="url(#profitGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No sales recorded in the selected period. Enter a sale to see live profit curves.
          </div>
        )}
      </div>
    </div>
  );
};
