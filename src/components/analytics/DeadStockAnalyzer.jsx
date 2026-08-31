import React, { useMemo, useState } from 'react';
import { Archive, AlertOctagon, RefreshCw, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { computeDeadStock } from '../../utils/calculations.js';
import { formatCurrency } from '../../utils/formatters.js';

export const DeadStockAnalyzer = () => {
  const products = useInventoryStore((state) => state.products);
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const setActiveSection = useThemeStore((state) => state.setActiveSection);

  const [lookbackDays, setLookbackDays] = useState(30);

  const { deadItems, totalTiedCapital, count } = useMemo(() => {
    return computeDeadStock(products, sales, lookbackDays);
  }, [products, sales, lookbackDays]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Dead Stock & Trapped Capital Detector</span>
              {count > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                  {count} Slow Items
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Identify non-moving stock locking up working capital with zero sales in {lookbackDays} days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={lookbackDays}
            onChange={(e) => setLookbackDays(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.04] text-xs font-bold text-slate-800 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-rose-500"
          >
            <option value={15} className="dark:bg-slate-900">Last 15 Days</option>
            <option value={30} className="dark:bg-slate-900">Last 30 Days</option>
            <option value={60} className="dark:bg-slate-900">Last 60 Days</option>
            <option value={90} className="dark:bg-slate-900">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Trapped Capital Highlight */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider block">
            Total Working Capital Locked in Stagnant Stock
          </span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            {formatCurrency(totalTiedCapital, currency)}
          </p>
          <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">
            Across {count} unsold inventory items that could be liquidated or discounted
          </p>
        </div>

        <button
          onClick={() => setActiveSection('inventory')}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <span>Manage in Inventory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dead Items List */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {deadItems.length > 0 ? (
          deadItems.slice(0, 6).map((item) => (
            <div
              key={item.id || item.sku}
              className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                  Stock: <span className="font-bold">{item.stock} {item.unit || 'pcs'}</span> • Cost: {formatCurrency(item.costPrice, currency)}
                </p>
              </div>

              <div className="text-right">
                <span className="font-bold font-mono text-rose-600 dark:text-rose-400 block">
                  {formatCurrency(item.tiedCapital, currency)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-gray-400">Locked Capital</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5">
            Great news! No dead stock detected in the last {lookbackDays} days. All items are active.
          </div>
        )}
      </div>
    </div>
  );
};
