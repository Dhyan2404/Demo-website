import React, { useMemo } from 'react';
import { CreditCard, AlertTriangle, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { computeUdhaarAging } from '../../utils/calculations.js';
import { formatCurrency } from '../../utils/formatters.js';

export const UdhaarAgingMatrix = () => {
  const customers = useCustomerStore((state) => state.customers);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const setActiveSection = useThemeStore((state) => state.setActiveSection);

  const { aging, totalDebt, totalCreditLimit, creditUtilization, debtorCount } = useMemo(() => {
    return computeUdhaarAging(customers);
  }, [customers]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Customer Credit Aging & Risk Matrix</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                {debtorCount} Active Debtors
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Breakdown of pending receivables by overdue age to prevent bad debts
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection('udhaar')}
          className="px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-100 transition-all cursor-pointer"
        >
          <span>Open Ledger CRM</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Credit Summary Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Total Outstanding Market Debt</span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {formatCurrency(totalDebt, currency)}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Credit Line Exposure</span>
          <span className="text-sm font-black text-slate-700 dark:text-gray-300 font-mono">
            {creditUtilization}% utilized
          </span>
        </div>
      </div>

      {/* Aging Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {aging.map((bucket) => {
          const pct = totalDebt > 0 ? ((bucket.amount / totalDebt) * 100).toFixed(1) : 0;
          return (
            <div
              key={bucket.label}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs space-y-1.5"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bucket.color }} />
                <span className="font-bold text-slate-800 dark:text-gray-200 text-[11px] truncate">{bucket.label}</span>
              </div>
              <p className="text-sm sm:text-base font-black font-mono" style={{ color: bucket.color }}>
                {formatCurrency(bucket.amount, currency)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">
                {bucket.count} customers • {pct}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
