import React, { useMemo } from 'react';
import { Percent, ShieldCheck, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { computeMarginTiers } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

export const MarginHealthAnalyzer = () => {
  const products = useInventoryStore((state) => state.products);
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');

  const tiers = useMemo(() => {
    return computeMarginTiers(products, sales);
  }, [products, sales]);

  const totalSalesRevenue = useMemo(() => {
    return tiers.reduce((acc, t) => acc + t.revenue, 0);
  }, [tiers]);

  const totalSalesProfit = useMemo(() => {
    return tiers.reduce((acc, t) => acc + t.profit, 0);
  }, [tiers]);

  const overallMargin = totalSalesRevenue > 0 ? ((totalSalesProfit / totalSalesRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Profit Margin Health & Product Tiering
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Breakdown of store revenue by product profitability brackets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Blended Margin:</span>
          <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">{overallMargin}%</span>
        </div>
      </div>

      {/* Tier Bars */}
      <div className="space-y-3 pt-1">
        {tiers.map((tier) => {
          const revShare = totalSalesRevenue > 0 ? ((tier.revenue / totalSalesRevenue) * 100).toFixed(1) : 0;
          return (
            <div
              key={tier.label}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="font-bold text-slate-900 dark:text-white">{tier.label}</span>
                  <span className="text-slate-500 dark:text-gray-400">({tier.count} items sold)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-gray-300 font-mono">{formatCurrency(tier.revenue, currency)}</span>
                  <span className="font-bold font-mono" style={{ color: tier.color }}>
                    +{formatCurrency(tier.profit, currency)} profit
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${revShare}%`, backgroundColor: tier.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
