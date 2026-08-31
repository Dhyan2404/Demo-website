import React, { useMemo } from 'react';
import { Users, Award, Shield, DollarSign } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const StaffSalesLeaderboard = () => {
  const sales = useSalesStore((state) => state.sales);
  const employees = useEmployeeStore((state) => state.employees);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');

  const staffStats = useMemo(() => {
    const map = {};

    // Initialize all existing employees
    (employees || []).forEach((emp) => {
      map[emp.id || emp.name] = {
        id: emp.id,
        name: emp.name,
        role: emp.role || 'Cashier',
        billsCount: 0,
        revenue: 0,
        profit: 0,
      };
    });

    // Default "Admin / Store Owner"
    map['admin'] = {
      id: 'admin',
      name: 'Owner / Main Counter',
      role: 'Store Admin',
      billsCount: 0,
      revenue: 0,
      profit: 0,
    };

    (sales || []).forEach((s) => {
      const staffKey = s.cashierId || s.cashierName || 'admin';
      if (!map[staffKey]) {
        map[staffKey] = {
          id: staffKey,
          name: s.cashierName || 'Cashier Desk',
          role: 'Cashier',
          billsCount: 0,
          revenue: 0,
          profit: 0,
        };
      }
      map[staffKey].billsCount += 1;
      map[staffKey].revenue += Number(s.totalAmount) || 0;
      map[staffKey].profit += Number(s.netProfit) || (Number(s.totalAmount) || 0) - (Number(s.totalCost) || 0);
    });

    return Object.values(map)
      .filter((st) => st.billsCount > 0 || st.revenue > 0 || st.id === 'admin')
      .sort((a, b) => b.revenue - a.revenue);
  }, [sales, employees]);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Staff & Cashier Counter Leaderboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Billing productivity and revenue generated across counters and staff
          </p>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {staffStats.map((st, idx) => (
          <div
            key={st.id}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{st.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">{st.role}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {st.billsCount} bills
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 dark:border-white/5 text-xs">
              <span className="text-slate-500 dark:text-gray-400">Total Billed:</span>
              <span className="font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(st.revenue, currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
