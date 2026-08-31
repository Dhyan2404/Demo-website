import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Clock, Calendar, Zap, TrendingUp } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { generateTrafficHeatmap } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

export const HourlyHeatmapChart = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const [activeTab, setActiveTab] = useState('hourly'); // 'hourly' | 'dayOfWeek'

  const { dayStats, hourStats } = useMemo(() => {
    return generateTrafficHeatmap(sales);
  }, [sales]);

  const peakHour = useMemo(() => {
    return [...hourStats].sort((a, b) => b.revenue - a.revenue)[0];
  }, [hourStats]);

  const peakDay = useMemo(() => {
    return [...dayStats].sort((a, b) => b.revenue - a.revenue)[0];
  }, [dayStats]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Peak Hours & Day-of-Week Footfall
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Identify your store's busiest sales windows to optimize staffing and stock replenishment
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-xl border border-slate-300 dark:border-white/10">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'hourly'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hourly Rush
          </button>
          <button
            onClick={() => setActiveTab('dayOfWeek')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'dayOfWeek'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Day of Week
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block">Busiest Hour Window</span>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {peakHour && peakHour.revenue > 0 ? `${peakHour.hour} (${formatCurrency(peakHour.revenue, currency)})` : 'Evenly Spread'}
            </p>
          </div>
          <Zap className="w-6 h-6 text-amber-500 shrink-0" />
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">Highest Grossing Day</span>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {peakDay && peakDay.revenue > 0 ? `${peakDay.day} (${formatCurrency(peakDay.revenue, currency)})` : 'No Sales Yet'}
            </p>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-500 shrink-0" />
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={activeTab === 'hourly' ? hourStats : dayStats}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
            <XAxis
              dataKey={activeTab === 'hourly' ? 'hour' : 'day'}
              stroke={isDarkMode ? '#6b7280' : '#475569'}
              tick={{ fontSize: 10, fontWeight: 600 }}
              tickLine={false}
            />
            <YAxis
              stroke={isDarkMode ? '#6b7280' : '#475569'}
              tick={{ fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-panel p-3 rounded-xl border border-slate-300 dark:border-white/15 text-xs shadow-xl space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-amber-600 dark:text-amber-400 font-bold font-mono">
                        Revenue: {formatCurrency(data.revenue, currency)}
                      </p>
                      <p className="text-slate-500 dark:text-gray-400 font-mono">Orders: {data.orders} transactions</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
