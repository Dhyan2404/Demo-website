import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ShieldAlert, Sparkles, TrendingUp, DollarSign, ShoppingBag, Zap, Award } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useScrollStore } from '../../store/useScrollStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const DashboardHero = () => {
  const openModal = useThemeStore((state) => state.openModal);
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const setActiveSection = useScrollStore((state) => state.setActiveSection);

  const sales = useSalesStore((state) => state.sales);
  const products = useInventoryStore((state) => state.products);

  const todaySales = useMemo(() => {
    return (sales || []).filter((s) => {
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
    return (products || []).filter((p) => p.stock > 0 && p.stock <= (p.minThreshold || 5)).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return (products || []).filter((p) => p.stock <= 0).length;
  }, [products]);

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-black/[0.06] dark:border-white/10 p-4 sm:p-7 lg:p-8 bg-gradient-to-br from-emerald-50/80 via-white/90 to-cyan-50/80 dark:from-emerald-950/40 dark:via-gray-900/80 dark:to-cyan-950/40 shadow-xl transition-all">
      {/* Background glow orbs */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Left: Hero Headline & Quick Status */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
            <span>Single Owner Command Center</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">• 100% Offline Ready</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
              {shopName}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
            Real-time stock valuation and automatic net profit tracking. Every rupee of purchase cost, retail margin, and customer Udhaar calculated instantly.
          </p>

          {/* Quick status chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(lowStockCount > 0 || outOfStockCount > 0) ? (
              <button
                onClick={() => setActiveSection('inventory')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-500/25 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{outOfStockCount} Out of Stock • {lowStockCount} Low Stock</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>All Inventory Healthy</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 text-slate-700 dark:text-gray-300 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Today: <strong className="text-slate-900 dark:text-white font-bold">{todaySales.length} Orders</strong></span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Express POS Active</span>
            </div>
          </div>
        </div>

        {/* Right: Live Today Net Profit Widget & Quick CTA */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/90 dark:bg-gray-950/70 p-4 sm:p-5 rounded-2xl border border-black/[0.06] dark:border-white/10 backdrop-blur-xl shadow-lg">
          <div className="pr-0 sm:pr-4 sm:border-r border-black/[0.06] dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                Today's Net Profit
              </span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {todayMargin.toFixed(0)}% Margin
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 text-glow-green font-mono">
                +{formatCurrency(todayNetProfit, currency)}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">
              Revenue: <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{formatCurrency(todayRevenue, currency)}</span> • Cost: <span className="text-rose-600 dark:text-rose-400 font-semibold">{formatCurrency(todayCost, currency)}</span>
            </p>
          </div>

          <button
            onClick={() => setActiveSection('pos')}
            className="btn-shimmer w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-glow-green hover:scale-[1.03] active:scale-[0.97] transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 text-slate-950 stroke-[3]" />
            <span>Express Billing Counter</span>
          </button>
        </div>

      </div>
    </div>
  );
};
