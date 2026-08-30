import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ShieldAlert, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency, formatPercentage } from '../../utils/formatters.js';

export const DashboardHero = () => {
  const openModal = useThemeStore((state) => state.openModal);
  const shopName = useThemeStore((state) => state.settings.shopName || 'SmartShop');
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');

  const sales = useSalesStore((state) => state.sales);
  const todaySales = sales.filter((s) => {
    const saleDate = new Date(s.createdAt);
    const today = new Date();
    return (
      saleDate.getDate() === today.getDate() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getFullYear() === today.getFullYear()
    );
  });

  const todayRevenue = todaySales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const todayCost = todaySales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
  const todayNetProfit = todayRevenue - todayCost;
  const todayMargin = todayRevenue > 0 ? (todayNetProfit / todayRevenue) * 100 : 0;

  const lowStockCount = useInventoryStore((state) => state.getLowStockProducts().length);
  const outOfStockCount = useInventoryStore((state) => state.getOutOfStockProducts().length);

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 bg-gradient-to-br from-emerald-950/40 via-gray-900/60 to-cyan-950/40 shadow-2xl">
      {/* Subtle background gradient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Welcome & Status */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Single Owner Business Mode Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{shopName}</span>
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed">
            Real-time stock monitoring and profit intelligence. Every rupee cost & margin is calculated automatically.
          </p>

          {/* Quick status pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {(lowStockCount > 0 || outOfStockCount > 0) ? (
              <div
                onClick={() => {
                  const el = document.getElementById('inventory-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-500/25 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>{outOfStockCount} Out of Stock • {lowStockCount} Low Stock</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Inventory Healthy</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Today's Orders: <strong className="text-white">{todaySales.length}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Today's Live Net Profit Widget & Quick POS Button */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-950/60 p-5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="pr-4 sm:border-r border-white/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Today's Net Profit</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 text-glow-green">
                +{formatCurrency(todayNetProfit, currency)}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300">
                {todayMargin.toFixed(0)}% Margin
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Sales: {formatCurrency(todayRevenue, currency)} | Cost: {formatCurrency(todayCost, currency)}
            </p>
          </div>

          <button
            onClick={() => openModal('pos')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-extrabold text-sm shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
          >
            <Plus className="w-5 h-5 text-gray-950 stroke-[3]" />
            <span>New Sale Entry</span>
          </button>
        </div>

      </div>
    </div>
  );
};
