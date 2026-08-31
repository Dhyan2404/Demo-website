import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, CheckCircle, AlertCircle, Edit2, Check } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const SalesTargetTracker = () => {
  const sales = useSalesStore((state) => state.sales);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');

  const [monthlyTarget, setMonthlyTarget] = useState(100000); // default 1 Lakh target
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState('100000');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = now.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay);

  const { currentMonthRevenue, currentMonthProfit } = useMemo(() => {
    let rev = 0;
    let prof = 0;
    (sales || []).forEach((s) => {
      const d = new Date(s.createdAt || s.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        rev += Number(s.totalAmount) || 0;
        prof += Number(s.netProfit) || (Number(s.totalAmount) || 0) - (Number(s.totalCost) || 0);
      }
    });
    return { currentMonthRevenue: rev, currentMonthProfit: prof };
  }, [sales, currentYear, currentMonth]);

  const progressPercentage = Math.min(100, monthlyTarget > 0 ? (currentMonthRevenue / monthlyTarget) * 100 : 0);
  const remainingTarget = Math.max(0, monthlyTarget - currentMonthRevenue);
  const requiredDailyRunRate = remainingTarget / remainingDays;
  const projectedMonthEnd = (currentMonthRevenue / currentDay) * daysInMonth;
  const isAhead = projectedMonthEnd >= monthlyTarget;

  const handleSaveTarget = () => {
    const parsed = Number(tempTarget);
    if (!isNaN(parsed) && parsed > 0) {
      setMonthlyTarget(parsed);
    }
    setIsEditingTarget(false);
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Monthly Sales Target & Pace Pacing</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  isAhead
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                {isAhead ? 'Ahead of Target' : 'Pacing Behind Target'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Live run-rate tracking to ensure your store meets monthly financial goals
            </p>
          </div>
        </div>

        {/* Set Target Button */}
        {isEditingTarget ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={tempTarget}
              onChange={(e) => setTempTarget(e.target.value)}
              className="w-28 px-2.5 py-1.5 rounded-xl border border-cyan-500 bg-white dark:bg-white/[0.04] text-xs font-bold text-slate-900 dark:text-white"
              placeholder="100000"
            />
            <button
              onClick={handleSaveTarget}
              className="p-1.5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setTempTarget(String(monthlyTarget));
              setIsEditingTarget(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Target: {formatCurrency(monthlyTarget, currency)}</span>
          </button>
        )}
      </div>

      {/* Progress Gauge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-900 dark:text-white">
            Achieved: {formatCurrency(currentMonthRevenue, currency)} ({progressPercentage.toFixed(1)}%)
          </span>
          <span className="text-slate-500 dark:text-gray-400">Goal: {formatCurrency(monthlyTarget, currency)}</span>
        </div>

        <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              progressPercentage >= 100
                ? 'bg-emerald-500'
                : progressPercentage >= 60
                ? 'bg-cyan-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Target Run-rate Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Required Daily Sale</span>
          <p className="text-base font-black text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
            {formatCurrency(requiredDailyRunRate, currency)} / day
          </p>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">{remainingDays} days left in month</p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Projected Month-End Close</span>
          <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {formatCurrency(projectedMonthEnd, currency)}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">Based on current daily velocity</p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Current Month Net Profit</span>
          <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            +{formatCurrency(currentMonthProfit, currency)}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">Pocketed earnings this month</p>
        </div>
      </div>
    </div>
  );
};
