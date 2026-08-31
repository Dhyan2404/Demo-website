import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Flame,
  Download,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { computeTopProducts } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';
import {
  exportSalesToCSV,
  exportInventoryToCSV,
  exportCustomersToCSV,
  exportFullBackupJSON,
  readBackupJSONFile,
} from '../../services/exportService.js';

// Modular Analytics Tools
import { MonthDailySalesChart } from './MonthDailySalesChart.jsx';
import { YearMonthlySalesChart } from './YearMonthlySalesChart.jsx';
import { HourlyHeatmapChart } from './HourlyHeatmapChart.jsx';
import { PaymentBreakdownCard } from './PaymentBreakdownCard.jsx';
import { MarginHealthAnalyzer } from './MarginHealthAnalyzer.jsx';
import { DeadStockAnalyzer } from './DeadStockAnalyzer.jsx';
import { BasketSizeAnalyzer } from './BasketSizeAnalyzer.jsx';
import { UdhaarAgingMatrix } from './UdhaarAgingMatrix.jsx';
import { SalesTargetTracker } from './SalesTargetTracker.jsx';
import { StaffSalesLeaderboard } from './StaffSalesLeaderboard.jsx';
import { BusinessAuditModal } from './BusinessAuditModal.jsx';

export const AnalyticsSection = () => {
  const sales = useSalesStore((state) => state.sales);
  const periodFilter = useSalesStore((state) => state.periodFilter);
  const setPeriodFilter = useSalesStore((state) => state.setPeriodFilter);
  const importSales = useSalesStore((state) => state.importSales);

  const products = useInventoryStore((state) => state.products);
  const importProducts = useInventoryStore((state) => state.importProducts);

  const customers = useCustomerStore((state) => state.customers);
  const importCustomers = useCustomerStore((state) => state.importCustomers);

  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [activeAnalyticsView, setActiveAnalyticsView] = useState('overview'); // 'overview' | 'monthly' | 'yearly' | 'deep'

  const { topProfitable, topSold } = useMemo(() => {
    return computeTopProducts(sales, products);
  }, [sales, products]);

  // Group profit by category for bar chart safely with useMemo
  const categoryChartData = useMemo(() => {
    const categoryProfitMap = {};
    (sales || []).forEach((s) => {
      (s.items || []).forEach((item) => {
        const cat = item.category || 'General';
        if (!categoryProfitMap[cat]) categoryProfitMap[cat] = 0;
        categoryProfitMap[cat] += Number(item.profit) || 0;
      });
    });

    return Object.entries(categoryProfitMap).map(([name, profit]) => ({
      name,
      profit,
    }));
  }, [sales]);

  const handleBackupExport = () => {
    exportFullBackupJSON({
      products,
      sales,
      customers,
    });
    showToast('Full shop backup downloaded successfully', 'success');
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readBackupJSONFile(file);
      if (data.products) importProducts(data.products);
      if (data.sales) importSales(data.sales);
      if (data.customers) importCustomers(data.customers);
      showToast('Database restored successfully from backup!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to restore backup.', 'error');
    }
  };

  const barColors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

  return (
    <section id="analytics-section" className="scroll-mt-24 space-y-6 pb-20 lg:pb-0">
      {/* Header & Main Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Profit Intelligence & Analytics Suite
            </h2>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Deep operational analytics, day-by-day monthly breakdowns, 12-month trends, and financial reports
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
            <span>Generate Business Audit</span>
          </button>

          {/* Quick Period Filters */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-300 dark:border-white/10 overflow-x-auto custom-scrollbar">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7D' },
              { id: '30days', label: '30D' },
              { id: '1year', label: '1Y' },
              { id: 'all', label: 'All' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPeriodFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  periodFilter === f.id
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.05]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Target & Run-Rate Goal Tracker */}
      <SalesTargetTracker />

      {/* Primary Graphs: Month Day-by-Day & Year Month-by-Month */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Month Graph Tracking Day-to-Day Sales */}
        <MonthDailySalesChart />

        {/* 2. Year Graph Tracking Month-to-Month Sales */}
        <YearMonthlySalesChart />
      </div>

      {/* Top Performers Highlights (Profitable & Volume Kings) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Profitable Product Highlight */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-white to-white dark:from-emerald-950/20 dark:via-gray-900/40 dark:to-transparent flex items-start justify-between gap-4 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Most Profitable Product</span>
            </div>

            {topProfitable ? (
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{topProfitable.name}</h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
                  Sold {topProfitable.unitsSold} units • Total Revenue: {formatCurrency(topProfitable.totalRevenue, currency)}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 text-glow-green font-mono">
                    +{formatCurrency(topProfitable.totalProfit, currency)}
                  </span>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">Net Profit Generated</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-gray-500 py-3">No sales data recorded yet.</p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>

        {/* Most Sold Product Highlight */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-300 dark:border-cyan-500/30 bg-gradient-to-br from-cyan-50/80 via-white to-white dark:from-cyan-950/20 dark:via-gray-900/40 dark:to-transparent flex items-start justify-between gap-4 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Highest Volume Product</span>
            </div>

            {topSold ? (
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{topSold.name}</h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
                  Total Revenue: {formatCurrency(topSold.totalRevenue, currency)} • Profit: +{formatCurrency(topSold.totalProfit, currency)}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-cyan-700 dark:text-cyan-400 text-glow-cyan font-mono">
                    {topSold.unitsSold} Units
                  </span>
                  <span className="text-xs text-cyan-800 dark:text-cyan-300 font-semibold">Total Quantity Sold</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-gray-500 py-3">No sales data recorded yet.</p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shrink-0">
            <Flame className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Operational Intelligence Row: Hourly Heatmap & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HourlyHeatmapChart />
        <PaymentBreakdownCard />
      </div>

      {/* Profit Margin & Basket Size Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarginHealthAnalyzer />
        <BasketSizeAnalyzer />
      </div>

      {/* Working Capital & Receivables Risk Row: Dead Stock & Udhaar Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeadStockAnalyzer />
        <UdhaarAgingMatrix />
      </div>

      {/* Staff Counter Performance & Category Margin Realization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Staff Leaderboard */}
        <div className="lg:col-span-6">
          <StaffSalesLeaderboard />
        </div>

        {/* Category Profit Distribution */}
        <div className="lg:col-span-6 glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Profit Realized by Category</h4>
            </div>
            <span className="text-xs text-slate-500 dark:text-gray-400">Total {categoryChartData.length} active categories</span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#6b7280' : '#475569'} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                <YAxis stroke={isDarkMode ? '#6b7280' : '#475569'} tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} tickFormatter={(val) => `₹${formatCompactNumber(val)}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel p-3 rounded-xl border border-slate-300 dark:border-white/15 text-xs shadow-lg space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                          <p className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                            Profit: {formatCurrency(payload[0].value, currency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CSV & JSON Export / Backup Suite */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Reports Export & Data Backup Center</h4>
          <p className="text-xs text-slate-500 dark:text-gray-400">Download Excel-compatible CSVs or export full JSON backups</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => exportSalesToCSV(sales)}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/10 flex items-center gap-3 text-left transition-all cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Export Sales CSV</p>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">{(sales || []).length} Transaction rows</p>
            </div>
          </button>

          <button
            onClick={() => exportInventoryToCSV(products)}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/10 flex items-center gap-3 text-left transition-all cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Export Inventory CSV</p>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">{(products || []).length} Stock items</p>
            </div>
          </button>

          <button
            onClick={() => exportCustomersToCSV(customers)}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/10 flex items-center gap-3 text-left transition-all cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Export Udhaar Ledger</p>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">{(customers || []).length} Customers</p>
            </div>
          </button>

          <button
            onClick={handleBackupExport}
            className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 flex items-center gap-3 text-left transition-all cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-700 dark:text-purple-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Full JSON Backup</p>
              <p className="text-[11px] text-purple-700 dark:text-purple-300">All data in 1 snapshot</p>
            </div>
          </button>
        </div>
      </div>

      {/* Business Audit Modal */}
      <BusinessAuditModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />
    </section>
  );
};
