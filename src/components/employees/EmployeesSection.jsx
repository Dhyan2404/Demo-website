import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  IndianRupee,
  Plus,
  TrendingUp,
  UserCheck,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { StaffListTab } from './StaffListTab.jsx';
import { AttendanceTab } from './AttendanceTab.jsx';
import { PayrollTab } from './PayrollTab.jsx';
import { EmployeeFormModal } from './EmployeeFormModal.jsx';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const EmployeesSection = () => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const employees = useEmployeeStore((state) => state.employees);
  const attendance = useEmployeeStore((state) => state.attendance);

  const [activeSubTab, setActiveSubTab] = useState('staff'); // 'staff' | 'attendance' | 'payroll'
  const [modalOpen, setModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance[todayStr] || {};

  const activeEmployeesCount = (employees || []).filter((e) => e.status === 'active').length;
  const presentTodayCount = (employees || []).filter(
    (e) => todayAttendance[e.id]?.status === 'present' || todayAttendance[e.id]?.status === 'half_day'
  ).length;

  const totalMonthlyWage = (employees || [])
    .filter((e) => e.status === 'active')
    .reduce((acc, e) => acc + (Number(e.baseSalary) || 0), 0);

  const handleOpenAddModal = () => {
    setEmployeeToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEmployeeToEdit(emp);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Metrics Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Staff & Workforce Management</h2>
              <p className="text-xs text-gray-400">
                Staff registry, daily biometric & attendance logs, salary configuration & 1-click payroll disbursal
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-black text-xs shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 rounded-2xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-white">{employees.length}</p>
          <p className="text-[10px] text-gray-400">{activeEmployeesCount} Active on duty</p>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Present Today</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-xl font-extrabold text-emerald-400">{presentTodayCount} / {activeEmployeesCount}</p>
          <p className="text-[10px] text-emerald-400/80">
            {activeEmployeesCount > 0 ? `${Math.round((presentTodayCount / activeEmployeesCount) * 100)}% attendance rate` : '0%'}
          </p>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 space-y-1">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Base Wage</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <p className="text-xl font-extrabold text-cyan-400 font-mono">{formatCurrency(totalMonthlyWage, currency)}</p>
          <p className="text-[10px] text-cyan-400/80">Active monthly liability</p>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Security & Roles</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xl font-extrabold text-amber-400">Configured</p>
          <p className="text-[10px] text-amber-400/80">Manager, Cashier & Stock</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white/10 w-full sm:w-max">
        {[
          { id: 'staff', label: 'Staff Directory', icon: Users },
          { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
          { id: 'payroll', label: 'Salary & Payroll', icon: IndianRupee },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-gray-950 shadow-glow-green'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeSubTab === 'staff' && (
        <StaffListTab
          onOpenAddModal={handleOpenAddModal}
          onOpenEditModal={handleOpenEditModal}
        />
      )}

      {activeSubTab === 'attendance' && <AttendanceTab />}

      {activeSubTab === 'payroll' && <PayrollTab />}

      {/* Staff Modal */}
      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEmployeeToEdit(null);
        }}
        employeeToEdit={employeeToEdit}
      />
    </div>
  );
};
