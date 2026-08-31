import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Printer, Download, CheckCircle2, User, Building2, Calendar, FileText } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const SalarySlipModal = ({ isOpen, onClose, payrollData, employee }) => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const shopName = useThemeStore((state) => state.settings?.storeName || 'SmartShop Store');
  const shopAddress = useThemeStore((state) => state.settings?.storeAddress || 'Main Market, City Center');
  const shopPhone = useThemeStore((state) => state.settings?.storePhone || '9876543210');

  if (!payrollData || !employee) return null;

  const handlePrint = () => {
    window.print();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const [year, monthNum] = (payrollData.month || '2026-08').split('-').map(Number);
  const formattedMonth = `${monthNames[monthNum - 1]} ${year}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Payslip / Salary Voucher"
      subtitle={`Generated salary statement for ${employee.name} (${formattedMonth})`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Printable Slip Container */}
        <div id="printable-salary-slip" className="p-6 bg-slate-900 border border-white/10 rounded-2xl text-white space-y-6 print:bg-white print:text-black print:p-0 print:border-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-black tracking-tight text-white print:text-black">{shopName}</h3>
              <p className="text-xs text-gray-400 print:text-gray-600">{shopAddress} • Phone: {shopPhone}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:border-black print:text-black">
                Payslip Voucher
              </span>
              <p className="text-xs text-gray-400 print:text-gray-600 mt-1 font-bold">Month: {formattedMonth}</p>
            </div>
          </div>

          {/* Employee & Attendance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white/[0.02] p-3.5 rounded-xl border border-white/5 print:bg-gray-50 print:border-gray-200 print:text-black">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Employee ID</p>
              <p className="font-mono font-bold text-white print:text-black">{employee.id}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Employee Name</p>
              <p className="font-bold text-white print:text-black">{employee.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Designation</p>
              <p className="font-medium text-gray-300 print:text-black">{employee.role}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Joining Date</p>
              <p className="font-mono text-gray-300 print:text-black">{employee.joiningDate}</p>
            </div>

            <div className="pt-2 border-t border-white/5 print:border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Days in Month</p>
              <p className="font-mono font-bold text-white print:text-black">{payrollData.totalDaysInMonth || 30}</p>
            </div>
            <div className="pt-2 border-t border-white/5 print:border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Present Days</p>
              <p className="font-mono font-bold text-emerald-400 print:text-green-700">{payrollData.presentDays || 0}</p>
            </div>
            <div className="pt-2 border-t border-white/5 print:border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Half Days</p>
              <p className="font-mono font-bold text-amber-400 print:text-yellow-700">{payrollData.halfDays || 0}</p>
            </div>
            <div className="pt-2 border-t border-white/5 print:border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Absent Days</p>
              <p className="font-mono font-bold text-rose-400 print:text-red-700">{payrollData.absentDays || 0}</p>
            </div>
          </div>

          {/* Salary Breakup Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden print:border-gray-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10 font-bold uppercase tracking-wider text-[10px] text-gray-400 print:bg-gray-100 print:text-black">
                  <th className="py-2.5 px-3.5">Earnings Description</th>
                  <th className="py-2.5 px-3.5 text-right">Amount ({currency})</th>
                  <th className="py-2.5 px-3.5 border-l border-white/10 print:border-gray-300">Deductions</th>
                  <th className="py-2.5 px-3.5 text-right">Amount ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] print:divide-gray-200 print:text-black">
                <tr>
                  <td className="py-2.5 px-3.5 text-gray-300 print:text-black">Base Monthly Salary</td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-white print:text-black">{formatCurrency(payrollData.baseSalary, currency)}</td>
                  <td className="py-2.5 px-3.5 border-l border-white/10 print:border-gray-300 text-gray-300 print:text-black">Absence Loss of Pay</td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-rose-400 print:text-black">{formatCurrency(payrollData.lopDeduction || 0, currency)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 text-gray-300 print:text-black">Calculated Earned Wage</td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-emerald-400 print:text-black">{formatCurrency(payrollData.earnedSalary || payrollData.baseSalary, currency)}</td>
                  <td className="py-2.5 px-3.5 border-l border-white/10 print:border-gray-300 text-gray-300 print:text-black">Advances / Loan Deductions</td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-rose-400 print:text-black">{formatCurrency(payrollData.advances || 0, currency)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 text-gray-300 print:text-black">Overtime / Performance Bonus</td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-emerald-400 print:text-black">+{formatCurrency(payrollData.bonus || 0, currency)}</td>
                  <td className="py-2.5 px-3.5 border-l border-white/10 print:border-gray-300 text-gray-300 print:text-black">Other Deductions</td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-rose-400 print:text-black">{formatCurrency(payrollData.deductions || 0, currency)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-emerald-950/30 border-t border-emerald-500/30 font-bold print:bg-gray-100 print:border-black">
                  <td className="py-3 px-3.5 text-sm text-emerald-300 print:text-black">Total Net Payable Salary</td>
                  <td colSpan={3} className="py-3 px-3.5 text-right text-lg font-extrabold text-emerald-400 font-mono print:text-black">
                    {formatCurrency(payrollData.netSalary, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Status & Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10 print:border-gray-300 text-xs">
            <div className="space-y-1">
              <p className="text-gray-400 print:text-gray-600">Payment Status: <span className="font-bold text-emerald-400 uppercase print:text-black">{payrollData.paymentStatus || 'PAID'}</span></p>
              {payrollData.paymentMethod && (
                <p className="text-gray-400 print:text-gray-600">Mode: <span className="font-mono uppercase text-gray-200 print:text-black">{payrollData.paymentMethod}</span></p>
              )}
              {employee.upiId && (
                <p className="text-gray-400 print:text-gray-600">UPI: <span className="font-mono text-gray-200 print:text-black">{employee.upiId}</span></p>
              )}
            </div>

            <div className="flex flex-col justify-end items-end space-y-8">
              <div className="w-36 border-b border-white/30 print:border-black"></div>
              <p className="text-[11px] text-gray-400 print:text-gray-600">Authorized Signature & Seal</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-gray-400 hover:text-white"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-glow-green transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
