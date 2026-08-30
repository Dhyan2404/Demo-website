import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X, Minus, Calendar } from 'lucide-react';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { soundEffects } from '../../utils/soundEffects.js';

const STATUS_MAP = {
  present: { label: 'P', full: 'Present', color: 'bg-emerald-500 text-white', ring: 'ring-emerald-400' },
  absent: { label: 'A', full: 'Absent', color: 'bg-rose-500 text-white', ring: 'ring-rose-400' },
  half: { label: 'H', full: 'Half Day', color: 'bg-amber-500 text-white', ring: 'ring-amber-400' },
};

export const AttendancePanel = () => {
  const employees = useEmployeeStore((state) => state.employees || []);
  const attendance = useEmployeeStore((state) => state.attendance || {});
  const markAttendance = useEmployeeStore((state) => state.markAttendance);
  const showToast = useThemeStore((state) => state.showToast);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const activeEmployees = employees.filter((e) => e.isActive);

  const cycleStatus = (empId, date) => {
    const current = attendance[empId]?.[date];
    const cycle = { undefined: 'present', present: 'absent', absent: 'half', half: 'present' };
    const next = cycle[current] || 'present';
    markAttendance(empId, date, next);
    if (soundEnabled) { try { soundEffects.playClick(); } catch (e) {} }
  };

  const markAll = (status) => {
    activeEmployees.forEach((emp) => markAttendance(emp.id, selectedDate, status));
    showToast(`All marked as ${status}`, 'success');
    if (soundEnabled) { try { soundEffects.playSuccessChime(); } catch (e) {} }
  };

  const presentCount = activeEmployees.filter((e) => attendance[e.id]?.[selectedDate] === 'present').length;
  const absentCount = activeEmployees.filter((e) => attendance[e.id]?.[selectedDate] === 'absent').length;
  const halfCount = activeEmployees.filter((e) => attendance[e.id]?.[selectedDate] === 'half').length;

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };
  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const today = new Date().toISOString().slice(0, 10);
    if (d.toISOString().slice(0, 10) <= today) setSelectedDate(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Date Navigator */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button onClick={prevDay} className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 justify-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">{displayDate}</span>
              {isToday && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">TODAY</span>}
            </div>
            <input type="date" value={selectedDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-gray-900 text-xs text-slate-700 dark:text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer" />
          </div>

          <button onClick={nextDay} disabled={isToday}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="flex items-center gap-2 justify-center text-xs">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
            <Check className="w-3 h-3" /> P: {presentCount}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/20">
            <X className="w-3 h-3" /> A: {absentCount}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
            <Minus className="w-3 h-3" /> H: {halfCount}
          </span>
        </div>

        {/* Mark All Buttons */}
        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Mark all as:</span>
          {['present', 'absent', 'half'].map((s) => {
            const info = STATUS_MAP[s];
            return (
              <button key={s} onClick={() => markAll(s)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${info.color} hover:opacity-80`}>
                {info.full}
              </button>
            );
          })}
        </div>
      </div>

      {/* Employee List */}
      {activeEmployees.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 p-10 text-center text-slate-400 dark:text-gray-500 text-sm">
          No active employees. Add employees in the Staff List tab first.
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden">
          <div className="p-3 border-b border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
            <span>Employee</span>
            <span>Tap to cycle: P → A → H</span>
          </div>
          <div className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
            {activeEmployees.map((emp) => {
              const status = attendance[emp.id]?.[selectedDate];
              const info = STATUS_MAP[status];

              return (
                <div key={emp.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">{emp.role}</p>
                  </div>

                  <button
                    onClick={() => cycleStatus(emp.id, selectedDate)}
                    className={`w-12 h-10 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ring-2 ring-offset-2 dark:ring-offset-gray-950 ${
                      info ? `${info.color} ${info.ring}` : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-gray-500 ring-transparent'
                    }`}
                    title={info?.full || 'Not marked'}
                  >
                    {info ? info.label : '?'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
