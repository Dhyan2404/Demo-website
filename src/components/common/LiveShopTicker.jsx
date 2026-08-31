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
    <div className="w-full bg-slate-100/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.06] py-1.5 px-4 sm:px-8 text-xs select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-slate-600 dark:text-gray-400">
        
        {/* Left: Clean Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-gray-400">
            Realtime Feed
          </span>
        </div>

        {/* Center: Stream Items */}
        <div className="flex items-center gap-5 sm:gap-8 overflow-x-auto custom-scrollbar whitespace-nowrap text-xs font-medium">
          <span className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-gray-300">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
            <span>{time}</span>
          </span>

          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Today's Profit: <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">+{formatCurrency(todayProfit, currency)}</strong></span>
          </span>

          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
            <span>Today: <strong className="text-slate-900 dark:text-white font-semibold">{todaySalesCount} orders</strong></span>
          </span>

          {lowStockItem && (
            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Low Stock: {lowStockItem.name} ({lowStockItem.stock})</span>
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
            <span>Pending Credit: <strong className="text-slate-900 dark:text-white font-mono font-semibold">{formatCurrency(pendingUdhaarTotal, currency)}</strong></span>
          </span>
        </div>

        {/* Right: Clean offline status */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500 dark:text-gray-400 font-medium">
          <span>Single-Owner Edition</span>
        </div>
      </div>
    </div>
  );
};
