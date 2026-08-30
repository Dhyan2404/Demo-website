import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  Zap,
  Package,
  CreditCard,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const LiveShopTicker = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');

  const sales = useSalesStore((state) => state.sales || []);
  const products = useInventoryStore((state) => state.products || []);
  const customers = useCustomerStore((state) => state.customers || []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { todaySalesCount, todayProfit } = useMemo(() => {
    const today = new Date();
    const matches = sales.filter((s) => {
      const d = new Date(s.createdAt);
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    });
    const profit = matches.reduce((acc, s) => acc + (Number(s.netProfit) || 0), 0);
    return { todaySalesCount: matches.length, todayProfit: profit };
  }, [sales]);

  const lowStockItem = useMemo(() => {
    return products.find((p) => p.stock > 0 && p.stock <= (p.minThreshold || 5));
  }, [products]);

  const pendingUdhaarTotal = useMemo(() => {
    return customers.reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0);
  }, [customers]);

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-amber-500/10 dark:from-amber-950/20 dark:via-gray-950 dark:to-amber-950/20 border-y border-amber-500/20 py-1.5 px-4 overflow-hidden text-xs select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-slate-700 dark:text-gray-300">
        
        {/* Left: Live Pulse Tag */}
        <div className="flex items-center gap-2 shrink-0 font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-700 dark:text-amber-400">
            Live Shop Feed
          </span>
        </div>

        {/* Center: Marquee Stream */}
        <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap text-[11px] font-medium">
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <strong className="text-slate-900 dark:text-white font-bold">{time}</strong>
          </span>

          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Today's Profit: <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">+{formatCurrency(todayProfit, currency)}</strong></span>
          </span>

          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Orders Today: <strong className="text-slate-900 dark:text-white font-bold">{todaySalesCount} sales</strong></span>
          </span>

          {lowStockItem && (
            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Low Stock: {lowStockItem.name} ({lowStockItem.stock} left)</span>
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Market Credit (Udhaar): <strong className="text-amber-700 dark:text-amber-400 font-mono font-bold">{formatCurrency(pendingUdhaarTotal, currency)}</strong></span>
          </span>
        </div>

        {/* Right: Security Badge */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0 text-[10px] font-extrabold text-slate-500 dark:text-gray-400 uppercase">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Royal Pro v2.5</span>
        </div>
      </div>
    </div>
  );
};
