import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  Zap,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const LiveShopTicker = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');

  const sales = useSalesStore((state) => state.sales || []);
  const products = useInventoryStore((state) => state.products || []);
  const customers = useCustomerStore((state) => state.customers || []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
    <div className="w-full bg-slate-100/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.06] py-1.5 px-3 sm:px-8 text-xs select-none overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Live dot + label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="hidden sm:block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-gray-400">Live</span>
        </div>

        {/* Scrollable data — on mobile shows only 2 key items */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto custom-scrollbar whitespace-nowrap font-medium flex-1 min-w-0">
          {/* Clock — always visible */}
          <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-gray-300 text-[11px]">
            <Clock className="w-3 h-3 text-slate-400 dark:text-gray-500 shrink-0" />
            <span>{time}</span>
          </span>

          {/* Today's Profit — always visible */}
          <span className="flex items-center gap-1 text-[11px]">
            <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-600 dark:text-gray-400">Profit: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{formatCurrency(todayProfit, currency)}</strong></span>
          </span>

          {/* Orders — hidden on xs */}
          <span className="hidden sm:flex items-center gap-1 text-[11px]">
            <Zap className="w-3 h-3 text-slate-400 dark:text-gray-500 shrink-0" />
            <span className="text-slate-600 dark:text-gray-400">Orders: <strong className="text-slate-900 dark:text-white">{todaySalesCount}</strong></span>
          </span>

          {/* Low stock alert — hidden on xs */}
          {lowStockItem && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>Low: {lowStockItem.name} ({lowStockItem.stock})</span>
            </span>
          )}

          {/* Pending credit — hidden on xs */}
          <span className="hidden md:flex items-center gap-1 text-[11px]">
            <CreditCard className="w-3 h-3 text-slate-400 dark:text-gray-500 shrink-0" />
            <span className="text-slate-600 dark:text-gray-400">Credit: <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(pendingUdhaarTotal, currency)}</strong></span>
          </span>
        </div>

        <div className="hidden lg:block text-[10px] text-slate-400 dark:text-gray-500 font-medium shrink-0">Offline Ready</div>
      </div>
    </div>
  );

};
