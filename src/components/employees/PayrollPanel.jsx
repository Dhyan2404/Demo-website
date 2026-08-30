import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, IndianRupee, Calendar } from 'lucide-react';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import { listVariants, itemVariants } from '../modals/WelcomeIntroModal.jsx';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const PayrollPanel = () => {
  const employees = useEmployeeStore((state) => state.employees || []);
  const calculatePayroll = useEmployeeStore((state) => state.calculatePayroll);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const next = new Date(year, month, 1);
    const today = new Date();
    if (next <= today) {
      if (month === 12) { setMonth(1); setYear(y => y + 1); }
      else setMonth(m => m + 1);
    }
  };

  const payrolls = useMemo(() => {
    return employees
      .filter((e) => e.isActive)
      .map((e) => calculatePayroll(e.id, year, month))
      .filter(Boolean);
  }, [employees, year, month, calculatePayroll]);

  const totalPayable = payrolls.reduce((a, p) => a + p.netPayable, 0);
  const totalDeductions = payrolls.reduce((a, p) => a + p.deduction, 0);
  const totalGross = payrolls.reduce((a, p) => a + p.grossSalary, 0);

  const avgAttendance = payrolls.length > 0
    ? Math.round(payrolls.reduce((a, p) => a + (p.presentDays / Math.max(p.workingDays, 1)) * 100, 0) / payrolls.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Month Navigator */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 cursor-pointer hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-slate-900 dark:text-white">{MONTHS[month - 1]} {year}</span>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 cursor-pointer hover:bg-slate-200 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Total Payroll', value: formatCurrency(totalGross, currency), sub: 'Gross salaries', color: 'text-slate-900 dark:text-white' },
            { label: 'Deductions', value: formatCurrency(totalDeductions, currency), sub: 'Absence deductions', color: 'text-rose-700 dark:text-rose-400' },
            { label: 'Net Payable', value: formatCurrency(totalPayable, currency), sub: 'To be disbursed', color: 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Avg Attendance', value: `${avgAttendance}%`, sub: `${payrolls.length} employees`, color: 'text-amber-700 dark:text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-lg font-black font-mono mt-0.5 ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Payroll Table */}
      {payrolls.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 p-10 text-center text-slate-400 dark:text-gray-500 text-sm">
          No active employees or no attendance data for this month.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden">
          <div className="p-3 border-b border-slate-200/80 dark:border-white/[0.06]">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Individual Payslips</h4>
          </div>

          {/* Mobile: Cards */}
          <div className="block sm:hidden divide-y divide-slate-200/60 dark:divide-white/[0.05]">
            {payrolls.map((p) => (
              <div key={p.employee.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{p.employee.name}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">{p.employee.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm font-mono text-emerald-700 dark:text-emerald-400">{formatCurrency(p.netPayable, currency)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500">Net Payable</p>
                  </div>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className="flex-1 text-center px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold">P: {p.presentDays}d</span>
                  <span className="flex-1 text-center px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">H: {p.halfDays}d</span>
                  <span className="flex-1 text-center px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-semibold">A: {p.absentDays}d</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-gray-400">
                  <span>Gross: <strong className="text-slate-800 dark:text-gray-200">{formatCurrency(p.grossSalary, currency)}</strong></span>
                  <span>Deduct: <strong className="text-rose-600 dark:text-rose-400">-{formatCurrency(p.deduction, currency)}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/80 dark:bg-white/[0.02]">
                <tr className="text-left text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-2.5">Employee</th>
                  <th className="px-4 py-2.5 text-center">Working Days</th>
                  <th className="px-4 py-2.5 text-center">P / H / A</th>
                  <th className="px-4 py-2.5 text-right">Gross</th>
                  <th className="px-4 py-2.5 text-right">Deduction</th>
                  <th className="px-4 py-2.5 text-right">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                {payrolls.map((p) => (
                  <tr key={p.employee.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{p.employee.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-gray-500">{p.employee.role}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700 dark:text-gray-300 font-mono">{p.workingDays}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400">{p.presentDays}P</span>
                        {' / '}
                        <span className="text-amber-600 dark:text-amber-400">{p.halfDays}H</span>
                        {' / '}
                        <span className="text-rose-600 dark:text-rose-400">{p.absentDays}A</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-gray-300">{formatCurrency(p.grossSalary, currency)}</td>
                    <td className="px-4 py-3 text-right font-mono text-rose-600 dark:text-rose-400">-{formatCurrency(p.deduction, currency)}</td>
                    <td className="px-4 py-3 text-right font-black font-mono text-emerald-700 dark:text-emerald-400">{formatCurrency(p.netPayable, currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-200/80 dark:border-white/[0.08]">
                <tr className="font-black text-sm">
                  <td className="px-4 py-2.5 text-slate-900 dark:text-white" colSpan={3}>TOTAL</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(totalGross, currency)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-rose-600 dark:text-rose-400">-{formatCurrency(totalDeductions, currency)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400">{formatCurrency(totalPayable, currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
