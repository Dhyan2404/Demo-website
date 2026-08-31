import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { CreditCard, QrCode, Banknote, Users, ArrowUpRight } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

export const PaymentBreakdownCard = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const { paymentData, totalRevenue, digitalPercentage, cashPercentage, udhaarPercentage } = useMemo(() => {
    const map = {
      upi: { label: 'UPI / QR Code', revenue: 0, count: 0, color: '#06b6d4' },
      cash: { label: 'Cash in Hand', revenue: 0, count: 0, color: '#10b981' },
      card: { label: 'Card Swipe', revenue: 0, count: 0, color: '#8b5cf6' },
      udhaar: { label: 'Udhaar (Credit)', revenue: 0, count: 0, color: '#f59e0b' },
    };

    let total = 0;
    (sales || []).forEach((s) => {
      const amt = Number(s.totalAmount) || 0;
      total += amt;
      const method = (s.paymentMethod || 'cash').toLowerCase();
      if (map[method]) {
        map[method].revenue += amt;
        map[method].count += 1;
      } else {
        map.cash.revenue += amt;
        map.cash.count += 1;
      }
    });

    const list = Object.entries(map).map(([key, val]) => ({
      key,
      name: val.label,
      value: val.revenue,
      count: val.count,
      color: val.color,
      avgTicket: val.count > 0 ? val.revenue / val.count : 0,
      share: total > 0 ? ((val.revenue / total) * 100).toFixed(1) : 0,
    }));

    const digitalRev = map.upi.revenue + map.card.revenue;
    const digPct = total > 0 ? ((digitalRev / total) * 100).toFixed(1) : 0;
    const cashPct = total > 0 ? ((map.cash.revenue / total) * 100).toFixed(1) : 0;
    const udhPct = total > 0 ? ((map.udhaar.revenue / total) * 100).toFixed(1) : 0;

    return {
      paymentData: list,
      totalRevenue: total,
      digitalPercentage: digPct,
      cashPercentage: cashPct,
      udhaarPercentage: udhPct,
    };
  }, [sales]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Payment Settlement & Digital Split
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              UPI, Cash, Card, and Udhaar credit distribution
            </p>
          </div>
        </div>
      </div>

      {/* Progress Split Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-cyan-600 dark:text-cyan-400">UPI & Digital: {digitalPercentage}%</span>
          <span className="text-emerald-600 dark:text-emerald-400">Cash: {cashPercentage}%</span>
          <span className="text-amber-600 dark:text-amber-400">Udhaar: {udhaarPercentage}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex">
          <div style={{ width: `${digitalPercentage}%` }} className="bg-cyan-500 transition-all duration-500" title={`Digital ${digitalPercentage}%`} />
          <div style={{ width: `${cashPercentage}%` }} className="bg-emerald-500 transition-all duration-500" title={`Cash ${cashPercentage}%`} />
          <div style={{ width: `${udhaarPercentage}%` }} className="bg-amber-500 transition-all duration-500" title={`Udhaar ${udhaarPercentage}%`} />
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {paymentData.map((p) => (
          <div
            key={p.key}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 truncate">{p.name}</span>
            </div>
            <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(p.value, currency)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400">
              {p.count} bills • {p.share}% share
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
