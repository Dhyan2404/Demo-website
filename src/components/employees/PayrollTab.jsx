import React, { useState, useMemo } from 'react';
import {
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { Modal } from '../common/Modal.jsx';
import { SalarySlipModal } from './SalarySlipModal.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const PayrollTab = () => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  const employees = useEmployeeStore((state) => state.employees);
  const selectedMonth = useEmployeeStore((state) => state.selectedMonth);
  const setSelectedMonth = useEmployeeStore((state) => state.setSelectedMonth);
  const payrollRecords = useEmployeeStore((state) => state.payrollRecords);
  const savePayrollRecord = useEmployeeStore((state) => state.savePayrollRecord);
  const getEmployeeMonthStats = useEmployeeStore((state) => state.getEmployeeMonthStats);

  // Payslip Modal State
  const [selectedSlipData, setSelectedSlipData] = useState(null);
  const [selectedSlipEmployee, setSelectedSlipEmployee] = useState(null);

  // Pay Now Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activePayItem, setActivePayItem] = useState(null);
  const [payForm, setPayForm] = useState({
    paymentMethod: 'upi',
    bonus: 0,
    deductions: 0,
    advances: 0,
    notes: '',
  });

  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const totalDaysInMonth = new Date(yearNum, monthNum, 0).getDate();

  // Compute calculated payroll for every employee for the selected month
  const monthlyPayrollList = useMemo(() => {
    return (employees || []).map((emp) => {
      const stats = getEmployeeMonthStats(emp.id, selectedMonth);
      const existingRecord = (payrollRecords || []).find(
        (p) => p.employeeId === emp.id && p.month === selectedMonth
      );

      const baseSalary = Number(emp.baseSalary) || 0;
      
      // Calculate per-day rate
      const perDayRate = totalDaysInMonth > 0 ? baseSalary / totalDaysInMonth : 0;
      
      // Effective worked days = present + (0.5 * halfDay) + paidLeave
      // If no attendance records at all for month, assume default full month unless marked
      const hasAttendanceRecorded = (stats.present + stats.halfDay + stats.absent + stats.paidLeave) > 0;
      const effectiveDays = hasAttendanceRecorded ? stats.effectiveWorkingDays : totalDaysInMonth;
      
      const earnedSalary = Math.round(perDayRate * effectiveDays);
      const lopDeduction = Math.max(0, Math.round(baseSalary - earnedSalary));

      const bonus = existingRecord?.bonus ?? 0;
      const deductions = existingRecord?.deductions ?? 0;
      const advances = existingRecord?.advances ?? 0;

      const netSalary = Math.max(0, earnedSalary + Number(bonus) - Number(deductions) - Number(advances));
      const paymentStatus = existingRecord?.paymentStatus || 'pending';

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        month: selectedMonth,
        baseSalary,
        totalDaysInMonth,
        presentDays: stats.present,
        halfDays: stats.halfDay,
        absentDays: stats.absent,
        paidLeaveDays: stats.paidLeave,
        effectiveDays,
        perDayRate: Math.round(perDayRate),
        earnedSalary,
        lopDeduction,
        bonus,
        deductions,
        advances,
        netSalary,
        paymentStatus,
        paymentDate: existingRecord?.paymentDate,
        paymentMethod: existingRecord?.paymentMethod || 'upi',
        rawEmployee: emp,
      };
    });
  }, [employees, selectedMonth, payrollRecords, getEmployeeMonthStats, totalDaysInMonth]);

  // Overall Payroll Summary Metrics
  const payrollSummary = useMemo(() => {
    const totalWageBill = monthlyPayrollList.reduce((acc, p) => acc + p.netSalary, 0);
    const paidAmount = monthlyPayrollList
      .filter((p) => p.paymentStatus === 'paid')
      .reduce((acc, p) => acc + p.netSalary, 0);
    const pendingAmount = totalWageBill - paidAmount;
    const paidCount = monthlyPayrollList.filter((p) => p.paymentStatus === 'paid').length;

    return { totalWageBill, paidAmount, pendingAmount, paidCount, totalCount: monthlyPayrollList.length };
  }, [monthlyPayrollList]);

  const handleOpenPayModal = (item) => {
    setActivePayItem(item);
    setPayForm({
      paymentMethod: 'upi',
      bonus: item.bonus || 0,
      deductions: item.deductions || 0,
      advances: item.advances || 0,
      notes: '',
    });
    setPayModalOpen(true);
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (!activePayItem) return;

    const bonus = Number(payForm.bonus) || 0;
    const deductions = Number(payForm.deductions) || 0;
    const advances = Number(payForm.advances) || 0;
    const netSalary = Math.max(0, activePayItem.earnedSalary + bonus - deductions - advances);

    savePayrollRecord({
      employeeId: activePayItem.employeeId,
      month: selectedMonth,
      baseSalary: activePayItem.baseSalary,
      totalDaysInMonth: activePayItem.totalDaysInMonth,
      presentDays: activePayItem.presentDays,
      halfDays: activePayItem.halfDays,
      absentDays: activePayItem.absentDays,
      paidLeaveDays: activePayItem.paidLeaveDays,
      earnedSalary: activePayItem.earnedSalary,
      lopDeduction: activePayItem.lopDeduction,
      bonus,
      deductions,
      advances,
      netSalary,
      paymentStatus: 'paid',
      paymentDate: new Date().toISOString(),
      paymentMethod: payForm.paymentMethod,
      notes: payForm.notes,
    });

    showToast(`Recorded salary payment for ${activePayItem.employeeName}`, 'success');
    setPayModalOpen(false);
  };

  const handleOpenSlip = (item) => {
    setSelectedSlipData(item);
    setSelectedSlipEmployee(item.rawEmployee);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-4">
      {/* Month Selector & Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Staff Payroll & Salary Disbursal</h3>
            <p className="text-xs text-gray-400">Automated calculation from attendance days, bonuses & deductions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Payroll Month:</span>
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Payroll KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Monthly Salary Bill</span>
          <p className="text-xl font-extrabold text-white font-mono">{formatCurrency(payrollSummary.totalWageBill, currency)}</p>
          <p className="text-[10px] text-gray-500">{payrollSummary.totalCount} Total Employees</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Disbursed (Paid)</span>
          <p className="text-xl font-extrabold text-emerald-400 font-mono">{formatCurrency(payrollSummary.paidAmount, currency)}</p>
          <p className="text-[10px] text-emerald-400/70">{payrollSummary.paidCount} Staff Paid</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400">Pending Disbursal</span>
          <p className="text-xl font-extrabold text-amber-400 font-mono">{formatCurrency(payrollSummary.pendingAmount, currency)}</p>
          <p className="text-[10px] text-amber-400/70">{payrollSummary.totalCount - payrollSummary.paidCount} Staff Remaining</p>
        </div>
      </div>

      {/* Monthly Payroll Grid / Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-center">Days Worked</th>
                <th className="py-3 px-4 text-right">Earned Wage</th>
                <th className="py-3 px-4 text-right">Bonus / Deductions</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {monthlyPayrollList.map((item) => {
                const isPaid = item.paymentStatus === 'paid';

                return (
                  <tr key={item.employeeId} className="hover:bg-white/[0.02] transition-colors">
                    {/* Employee Info */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.employeeName}</div>
                      <span className="text-[10px] text-gray-400">{item.role} • {item.employeeId}</span>
                    </td>

                    {/* Base Salary */}
                    <td className="py-3 px-4 text-right font-mono text-gray-300">
                      {formatCurrency(item.baseSalary, currency)}
                    </td>

                    {/* Attendance Days */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 font-mono text-gray-300">
                        <span className="text-emerald-400 font-bold">{item.presentDays}P</span>
                        {item.halfDays > 0 && <span className="text-amber-400 font-bold">{item.halfDays}H</span>}
                        {item.absentDays > 0 && <span className="text-rose-400 font-bold">{item.absentDays}A</span>}
                        <span className="text-gray-500">/ {item.totalDaysInMonth}d</span>
                      </span>
                    </td>

                    {/* Earned Wage */}
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      {formatCurrency(item.earnedSalary, currency)}
                    </td>

                    {/* Bonus / Deductions */}
                    <td className="py-3 px-4 text-right font-mono text-[11px]">
                      {item.bonus > 0 && <span className="text-emerald-400">+{item.bonus} </span>}
                      {(item.deductions > 0 || item.advances > 0) && (
                        <span className="text-rose-400">-{item.deductions + item.advances}</span>
                      )}
                      {item.bonus === 0 && item.deductions === 0 && item.advances === 0 && (
                        <span className="text-gray-500">₹0</span>
                      )}
                    </td>

                    {/* Net Payable */}
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-white text-sm">
                      {formatCurrency(item.netSalary, currency)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isPaid ? (
                        <Badge variant="success" size="sm">Paid</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Pending</Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isPaid ? (
                          <button
                            onClick={() => handleOpenPayModal(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-sm transition-all"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPayModal(item)}
                            className="px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/10 text-gray-400 hover:text-white transition-all text-[11px]"
                          >
                            Edit
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenSlip(item)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                          title="Generate Salary Slip"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Now / Disburse Modal */}
      {activePayItem && (
        <Modal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          title={`Disburse Salary: ${activePayItem.employeeName}`}
          subtitle={`Payroll record for month ${monthNames[monthNum - 1]} ${yearNum}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-gray-300">Base Earned Wage:</span>
              <span className="font-extrabold text-emerald-400 font-mono text-sm">
                {formatCurrency(activePayItem.earnedSalary, currency)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400">Bonus / OT</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={payForm.bonus}
                  onChange={(e) => setPayForm({ ...payForm, bonus: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400">Advance Ded.</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={payForm.advances}
                  onChange={(e) => setPayForm({ ...payForm, advances: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400">Other Deduct.</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={payForm.deductions}
                  onChange={(e) => setPayForm({ ...payForm, deductions: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Payment Mode</label>
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="upi">UPI / Online Transfer {activePayItem.rawEmployee?.upiId ? `(${activePayItem.rawEmployee.upiId})` : ''}</option>
                <option value="cash">Cash in Hand</option>
                <option value="bank_transfer">Direct Bank Transfer (NEFT/IMPS)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Remarks (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Cleared via GPay"
                value={payForm.notes}
                onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-300">Net Disbursed Amount:</span>
              <span className="font-mono text-base font-black text-emerald-400">
                {formatCurrency(
                  Math.max(
                    0,
                    activePayItem.earnedSalary +
                      (Number(payForm.bonus) || 0) -
                      (Number(payForm.advances) || 0) -
                      (Number(payForm.deductions) || 0)
                  ),
                  currency
                )}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-glow-green transition-all"
              >
                Record as Paid
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Salary Slip Modal */}
      <SalarySlipModal
        isOpen={Boolean(selectedSlipData)}
        onClose={() => setSelectedSlipData(null)}
        payrollData={selectedSlipData}
        employee={selectedSlipEmployee}
      />
    </div>
  );
};
