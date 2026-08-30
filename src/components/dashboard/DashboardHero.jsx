import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useScrollStore } from '../../store/useScrollStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const DashboardHero = () => {
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const setActiveSection = useScrollStore((state) => state.setActiveSection);

  const sales = useSalesStore((state) => state.sales || []);
  const products = useInventoryStore((state) => state.products || []);

  const todaySales = useMemo(() => {
    return sales.filter((s) => {
      const saleDate = new Date(s.createdAt);
      const today = new Date();
      return (
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    });
  }, [sales]);

  const { todayRevenue, todayCost, todayNetProfit, todayMargin } = useMemo(() => {
    const revenue = todaySales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
    const cost = todaySales.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { todayRevenue: revenue, todayCost: cost, todayNetProfit: profit, todayMargin: margin };
  }, [todaySales]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= (p.minThreshold || 5)).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 0).length;
  }, [products]);

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-8 bg-white/70 dark:bg-gray-900/60 shadow-sm transition-all">
      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Left: Clean Minimalist Headline */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Store Command Center</span>
            <span className="text-slate-400 dark:text-gray-500">• 100% Offline Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Welcome back, <span className="gold-gradient-text">{shopName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed font-normal">
            Real-time stock valuation, per-item profit calculation, and automated customer Udhaar ledger.
          </p>

          {/* Quick status chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(lowStockCount > 0 || outOfStockCount > 0) ? (
              <button
                onClick={() => setActiveSection('inventory')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-medium cursor-pointer hover:bg-amber-500/20 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{outOfStockCount} Out • {lowStockCount} Low Stock</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Stock Healthy</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              <span>Today: <strong>{todaySales.length} Orders</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Clean Live Net Profit Tile */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50/90 dark:bg-gray-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <div className="pr-0 sm:pr-4 sm:border-r border-slate-200 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Today's Net Profit
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {todayMargin.toFixed(0)}% Margin
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                +{formatCurrency(todayNetProfit, currency)}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
              Rev: {formatCurrency(todayRevenue, currency)} • Cost: {formatCurrency(todayCost, currency)}
            </p>
          </div>

          <button
            onClick={() => setActiveSection('pos')}
            className="btn-shimmer w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Express POS</span>
          </button>
        </div>

      </div>
    </div>
  );
};
