import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CalendarRange, TrendingUp, DollarSign, Layers, PieChart as PieIcon } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { generateYearMonthlySales } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

export const YearMonthlySalesChart = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = useMemo(() => {
    const set = new Set([currentYear, currentYear - 1, 2025, 2026]);
    (sales || []).forEach((s) => {
      const d = new Date(s.createdAt || s.date);
      if (!isNaN(d.getTime())) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [sales, currentYear]);

  const monthlyData = useMemo(() => {
    return generateYearMonthlySales(sales, selectedYear);
  }, [sales, selectedYear]);

  const { totalAnnualRevenue, totalAnnualProfit, totalAnnualOrders, peakMonth, quarters } = useMemo(() => {
    let rev = 0;
    let prof = 0;
    let ord = 0;
    let peak = { name: 'Jan', revenue: 0 };

    const qData = [
      { name: 'Q1 (Jan-Mar)', revenue: 0, profit: 0 },
      { name: 'Q2 (Apr-Jun)', revenue: 0, profit: 0 },
      { name: 'Q3 (Jul-Sep)', revenue: 0, profit: 0 },
      { name: 'Q4 (Oct-Dec)', revenue: 0, profit: 0 },
    ];

    monthlyData.forEach((m, idx) => {
      rev += m.revenue;
      prof += m.profit;
      ord += m.orders;
      if (m.revenue > peak.revenue) {
        peak = m;
      }
      const qIdx = Math.floor(idx / 3);
      if (qData[qIdx]) {
        qData[qIdx].revenue += m.revenue;
        qData[qIdx].profit += m.profit;
      }
    });

    return {
      totalAnnualRevenue: rev,
      totalAnnualProfit: prof,
      totalAnnualOrders: ord,
      peakMonth: peak.revenue > 0 ? peak : null,
      quarters: qData,
    };
  }, [monthlyData]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-5 shadow-sm">
      {/* Header & Year Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Yearly Month-by-Month Sales Matrix</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                12-Month Flow
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Annual comparative revenue, cost, and net profit performance for {selectedYear}
            </p>
          </div>
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.04] text-xs font-bold text-slate-800 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-cyan-500"
        >
          {years.map((y) => (
            <option key={y} value={y} className="dark:bg-slate-900">
              Year {y}
            </option>
          ))}
        </select>
      </div>

      {/* Annual Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Annual Gross Sales</p>
          <p className="text-base sm:text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
            {formatCurrency(totalAnnualRevenue, currency)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Annual Net Profit</p>
          <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            +{formatCurrency(totalAnnualProfit, currency)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Total Annual Orders</p>
          <p className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
            {totalAnnualOrders} transactions
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Peak Month</p>
          <p className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 truncate mt-0.5">
            {peakMonth ? `${peakMonth.name} (${formatCompactNumber(peakMonth.revenue)})` : 'No data'}
          </p>
        </div>
      </div>

      {/* 12-Month Bar Chart */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
            <XAxis dataKey="name" stroke={isDarkMode ? '#6b7280' : '#475569'} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
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
                        {data.fullName} {selectedYear}
                      </p>
                      <p className="text-cyan-600 dark:text-cyan-400 font-bold font-mono">
                        Revenue: {formatCurrency(data.revenue, currency)}
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                        Profit: +{formatCurrency(data.profit, currency)}
                      </p>
                      <p className="text-rose-500 font-semibold font-mono">
                        Cost of Goods: {formatCurrency(data.cost, currency)}
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
            <Bar dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Gross Revenue" />
            <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} name="Net Profit" />
            <Bar dataKey="cost" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Stock Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quarterly Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200 dark:border-white/5">
        {quarters.map((q) => (
          <div key={q.name} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-xs">
            <p className="font-bold text-slate-700 dark:text-gray-300">{q.name}</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">{formatCurrency(q.revenue, currency)}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">+{formatCompactNumber(q.profit)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
