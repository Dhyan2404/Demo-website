import React from 'react';
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

export const AnalyticsSection = () => {
  const sales = useSalesStore((state) => state.sales);
  const periodFilter = useSalesStore((state) => state.periodFilter);
  const setPeriodFilter = useSalesStore((state) => state.setPeriodFilter);
  const importSales = useSalesStore((state) => state.importSales);
  const metrics = useSalesStore((state) => state.getPeriodMetrics());

  const products = useInventoryStore((state) => state.products);
  const importProducts = useInventoryStore((state) => state.importProducts);

  const customers = useCustomerStore((state) => state.customers);
  const importCustomers = useCustomerStore((state) => state.importCustomers);

  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  const { topProfitable, topSold, allPerformers } = computeTopProducts(sales, products);

  // Group profit by category for bar chart
  const categoryProfitMap = {};
  sales.forEach((s) => {
    (s.items || []).forEach((item) => {
      const cat = item.category || 'General';
      if (!categoryProfitMap[cat]) categoryProfitMap[cat] = 0;
      categoryProfitMap[cat] += Number(item.profit) || 0;
    });
  });

  const categoryChartData = Object.entries(categoryProfitMap).map(([name, profit]) => ({
    name,
    profit,
  }));

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

  const barColors = ['#22c55e', '#06b6d4', '#fbbf24', '#a855f7', '#ec4899', '#f97316'];

  return (
    <section id="analytics-section" className="scroll-mt-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Profit Intelligence & Analytics
            </h2>
            <p className="text-xs text-gray-400">
              Clear insight into net profits, top selling items, and category margins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                periodFilter === f.id
                  ? 'bg-cyan-500 text-gray-950 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Highlights: Most Profitable & Most Sold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Profitable Product Highlight */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-gray-900/40 to-transparent flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Most Profitable Product</span>
            </div>

            {topProfitable ? (
              <div>
                <h3 className="text-xl font-extrabold text-white">{topProfitable.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sold {topProfitable.unitsSold} units • Total Revenue: {formatCurrency(topProfitable.totalRevenue, currency)}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-emerald-400 text-glow-green font-mono">
                    +{formatCurrency(topProfitable.totalProfit, currency)}
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold">Net Profit Generated</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-3">No sales data recorded yet.</p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>

        {/* Most Sold Product Highlight */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-gray-900/40 to-transparent flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>Highest Volume Product</span>
            </div>

            {topSold ? (
              <div>
                <h3 className="text-xl font-extrabold text-white">{topSold.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Total Revenue: {formatCurrency(topSold.totalRevenue, currency)} • Profit: +{formatCurrency(topSold.totalProfit, currency)}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-cyan-400 text-glow-cyan font-mono">
                    {topSold.unitsSold} Units
                  </span>
                  <span className="text-xs text-cyan-300 font-semibold">Total Quantity Sold</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-3">No sales data recorded yet.</p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Flame className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Category Profit Contribution Chart */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Category Profit Contribution</h4>
            <p className="text-xs text-gray-400">Total net profit accumulated across product categories</p>
          </div>
        </div>

        <div className="h-60 sm:h-64 w-full pt-2">
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${currency}${formatCompactNumber(v)}`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val, currency), 'Net Profit']}
                  contentStyle={{
                    background: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs">
              No sales logged yet to calculate category profit breakdown.
            </div>
          )}
        </div>
      </div>

      {/* Backup & Export Hub */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight">Data Export & Backup Center</h4>
          <p className="text-xs text-gray-400">
            Keep your business data safe, export spreadsheets for tax filing, or backup/restore snapshots
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => exportSalesToCSV(sales)}
            className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 flex flex-col items-center text-center gap-2 transition-all group"
          >
            <Download className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-white">Sales & Profit CSV</p>
              <p className="text-[10px] text-gray-400">Invoices & revenue</p>
            </div>
          </button>

          <button
            onClick={() => exportInventoryToCSV(products)}
            className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 flex flex-col items-center text-center gap-2 transition-all group"
          >
            <Download className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-white">Inventory CSV</p>
              <p className="text-[10px] text-gray-400">Products & costs</p>
            </div>
          </button>

          <button
            onClick={() => exportCustomersToCSV(customers)}
            className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 flex flex-col items-center text-center gap-2 transition-all group"
          >
            <Download className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-white">Customer Udhaar CSV</p>
              <p className="text-[10px] text-gray-400">Debt & credit ledger</p>
            </div>
          </button>

          <button
            onClick={handleBackupExport}
            className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/40 flex flex-col items-center text-center gap-2 transition-all group"
          >
            <Download className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-emerald-300">Full JSON Backup</p>
              <p className="text-[10px] text-emerald-400/80">Complete database snapshot</p>
            </div>
          </button>
        </div>

        {/* Restore Section */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            Have a previous SmartShop backup JSON file? Restore all inventory, sales, and customers instantly:
          </p>
          <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer transition-all shrink-0">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Restore Backup JSON</span>
            <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          </label>
        </div>
      </div>
    </section>
  );
};
