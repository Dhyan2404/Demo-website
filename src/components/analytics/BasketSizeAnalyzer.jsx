import React, { useMemo } from 'react';
import { ShoppingBag, Target, Layers, Hash } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { computeBasketMetrics } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

export const BasketSizeAnalyzer = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');

  const { aov, upt, totalOrders, totalRevenue, buckets } = useMemo(() => {
    return computeBasketMetrics(sales);
  }, [sales]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Basket Size & Average Order Value (AOV)
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Customer spending power, ticket size buckets, and units per transaction
          </p>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20">
          <p className="text-[10px] uppercase font-bold text-purple-800 dark:text-purple-400">Average Order Value (AOV)</p>
          <p className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono mt-0.5">
            {formatCurrency(aov, currency)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">Avg bill per shopper</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20">
          <p className="text-[10px] uppercase font-bold text-cyan-800 dark:text-cyan-400">Units Per Transaction (UPT)</p>
          <p className="text-xl font-black text-cyan-700 dark:text-cyan-300 font-mono mt-0.5">
            {upt} items
          </p>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">Avg items per checkout</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400">Total Billed Volume</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
            {totalOrders} receipts
          </p>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">Processed till date</p>
        </div>
      </div>

      {/* Ticket Size Buckets */}
      <div className="space-y-2 pt-1">
        <p className="text-xs font-bold text-slate-700 dark:text-gray-300">Ticket Size Segmentation</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {buckets.map((b) => {
            const pct = totalOrders > 0 ? ((b.count / totalOrders) * 100).toFixed(1) : 0;
            return (
              <div
                key={b.label}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs space-y-1"
              >
                <span className="font-bold text-slate-900 dark:text-white block">{b.label}</span>
                <p className="font-extrabold text-purple-600 dark:text-purple-400 font-mono">{b.count} orders</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400">{pct}% of transactions</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
