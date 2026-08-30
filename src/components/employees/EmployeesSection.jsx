import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  IndianRupee,
  Plus,
  ChevronRight,
  UserCheck,
  ClipboardList,
  Banknote,
} from 'lucide-react';
import { StaffList } from './StaffList.jsx';
import { AttendancePanel } from './AttendancePanel.jsx';
import { PayrollPanel } from './PayrollPanel.jsx';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { pageVariants } from '../modals/WelcomeIntroModal.jsx';

const TABS = [
  { id: 'staff', label: 'Staff List', icon: Users, desc: 'Add & manage employees' },
  { id: 'attendance', label: 'Attendance', icon: Calendar, desc: 'Mark daily attendance' },
  { id: 'payroll', label: 'Payroll', icon: IndianRupee, desc: 'Monthly salary summary' },
];

export const EmployeesSection = () => {
  const [activeTab, setActiveTab] = useState('staff');
  const employees = useEmployeeStore((state) => state.employees || []);
  const attendance = useEmployeeStore((state) => state.attendance || {});
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);

  // Today's attendance count
  const today = new Date().toISOString().slice(0, 10);
  const presentToday = employees.filter((e) => attendance[e.id]?.[today] === 'present').length;

  return (
    <motion.section
      id="employees-section"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="scroll-mt-20 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Employee Management</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {employees.filter((e) => e.isActive).length} active staff · {presentToday} present today
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{presentToday}/{employees.filter(e=>e.isActive).length} today</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-semibold">
            <Banknote className="w-3.5 h-3.5" />
            <span>₹{employees.reduce((a, e) => a + (e.isActive ? (e.monthlySalary || 0) : 0), 0).toLocaleString()}/mo</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 p-1 rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-white/10 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'staff' && <StaffList />}
        {activeTab === 'attendance' && <AttendancePanel />}
        {activeTab === 'payroll' && <PayrollPanel />}
      </div>
    </motion.section>
  );
};
