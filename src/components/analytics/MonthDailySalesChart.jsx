import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, ShoppingBag, Award, ChevronDown } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { generateMonthDailySales } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

export const MonthDailySalesChart = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
  const [showTable, setShowTable] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = useMemo(() => {
    const set = new Set([currentDate.getFullYear(), currentDate.getFullYear() - 1, 2025, 2026]);
    (sales || []).forEach((s) => {
      const d = new Date(s.createdAt || s.date);
      if (!isNaN(d.getTime())) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [sales]);

  const dailyData = useMemo(() => {
    return generateMonthDailySales(sales, selectedYear, selectedMonth);
  }, [sales, selectedYear, selectedMonth]);

  const { totalRevenue, totalProfit, totalOrders, bestDay, avgDailyRevenue } = useMemo(() => {
    let rev = 0;
    let prof = 0;
    let ord = 0;
    let peak = { day: 1, revenue: 0, dateLabel: '' };

    dailyData.forEach((d) => {
      rev += d.revenue;
      prof += d.profit;
      ord += d.orders;
      if (d.revenue > peak.revenue) {
        peak = d;
      }
    });

    const activeDays = dailyData.filter((d) => d.revenue > 0).length || 1;
    const avg = rev / dailyData.length;

    return {
      totalRevenue: rev,
      totalProfit: prof,
      totalOrders: ord,
      bestDay: peak.revenue > 0 ? peak : null,
      avgDailyRevenue: avg,
    };
  }, [dailyData]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-5 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Monthly Day-by-Day Sales Tracker</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Daily Breakdown
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Granular day-to-day revenue, profit, and order count for {monthNames[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>

        {/* Month & Year Selectors + Chart Type */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.04] text-xs font-bold text-slate-800 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-emerald-500"
          >
            {monthNames.map((m, idx) => (
              <option key={m} value={idx} className="dark:bg-slate-900">
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.04] text-xs font-bold text-slate-800 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-emerald-500"
          >
            {years.map((y) => (
              <option key={y} value={y} className="dark:bg-slate-900">
                {y}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] p-0.5 rounded-xl border border-slate-300 dark:border-white/10">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Month Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Total Month Sales</p>
          <p className="text-base sm:text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
            {formatCurrency(totalRevenue, currency)}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Month Net Profit</p>
          <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            +{formatCurrency(totalProfit, currency)}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Total Invoices</p>
          <p className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
            {totalOrders} bills
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Peak Day</p>
          <p className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 truncate mt-0.5">
            {bestDay ? `${bestDay.dateLabel} (${formatCompactNumber(bestDay.revenue)})` : 'None yet'}
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="monthRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={isDarkMode ? 0.4 : 0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="monthProfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={isDarkMode ? 0.45 : 0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
              <XAxis dataKey="day" stroke={isDarkMode ? '#6b7280' : '#475569'} tick={{ fontSize: 10, fontWeight: 600 }} tickLine={false} />
              <YAxis
                stroke={isDarkMode ? '#6b7280' : '#475569'}
                tick={{ fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-panel p-3 rounded-xl border border-slate-300 dark:border-white/15 text-xs shadow-xl space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-1">
                          {data.dateLabel}
                        </p>
                        <p className="text-cyan-600 dark:text-cyan-400 font-bold font-mono">
                          Sales: {formatCurrency(data.revenue, currency)}
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          Profit: +{formatCurrency(data.profit, currency)}
                        </p>
                        <p className="text-slate-500 dark:text-gray-400 text-[11px]">
                          Orders: {data.orders} • Items: {data.itemsSold}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} fill="url(#monthRevGrad)" name="Sales Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#monthProfGrad)" name="Net Profit" />
            </AreaChart>
          ) : (
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
              <XAxis dataKey="day" stroke={isDarkMode ? '#6b7280' : '#475569'} tick={{ fontSize: 10, fontWeight: 600 }} tickLine={false} />
              <YAxis
                stroke={isDarkMode ? '#6b7280' : '#475569'}
                tick={{ fontSize: 10, fontWeight: 600 }}
                tickLine={false}
                tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-panel p-3 rounded-xl border border-slate-300 dark:border-white/15 text-xs shadow-xl space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-1">
                          {data.dateLabel}
                        </p>
                        <p className="text-cyan-600 dark:text-cyan-400 font-bold font-mono">
                          Sales: {formatCurrency(data.revenue, currency)}
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          Profit: +{formatCurrency(data.profit, currency)}
                        </p>
                        <p className="text-slate-500 dark:text-gray-400 text-[11px]">
                          Orders: {data.orders} • Items: {data.itemsSold}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Sales" />
              <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Toggle Daily Data Table */}
      <div className="pt-2 border-t border-slate-200 dark:border-white/5">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showTable ? 'rotate-180' : ''}`} />
          <span>{showTable ? 'Hide Daily Table' : 'View Day-by-Day Table Log'}</span>
        </button>

        {showTable && (
          <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-white/[0.04] text-[11px] font-bold text-slate-600 dark:text-gray-400 uppercase">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5 text-right">Bills</th>
                  <th className="p-2.5 text-right">Items Sold</th>
                  <th className="p-2.5 text-right">Revenue</th>
                  <th className="p-2.5 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/[0.05]">
                {dailyData.map((d) => (
                  <tr key={d.day} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{d.dateLabel}</td>
                    <td className="p-2.5 text-right text-slate-600 dark:text-gray-300 font-mono">{d.orders}</td>
                    <td className="p-2.5 text-right text-slate-600 dark:text-gray-300 font-mono">{d.itemsSold}</td>
                    <td className="p-2.5 text-right font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      {formatCurrency(d.revenue, currency)}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      +{formatCurrency(d.profit, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
