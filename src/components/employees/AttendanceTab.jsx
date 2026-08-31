import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  UserCheck,
} from 'lucide-react';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';

export const AttendanceTab = () => {
  const showToast = useThemeStore((state) => state.showToast);
  const employees = useEmployeeStore((state) => state.employees);
  const attendance = useEmployeeStore((state) => state.attendance);
  const markAttendance = useEmployeeStore((state) => state.markAttendance);
  const markAllPresent = useEmployeeStore((state) => state.markAllPresent);
  const selectedDate = useEmployeeStore((state) => state.selectedDate);
  const setSelectedDate = useEmployeeStore((state) => state.setSelectedDate);

  const activeEmployees = useMemo(() => {
    return (employees || []).filter((e) => e.status === 'active');
  }, [employees]);

  const currentDayAttendance = useMemo(() => {
    return attendance[selectedDate] || {};
  }, [attendance, selectedDate]);

  // Today's summary stats
  const dailySummary = useMemo(() => {
    let present = 0;
    let halfDay = 0;
    let absent = 0;
    let paidLeave = 0;
    let notMarked = 0;

    activeEmployees.forEach((emp) => {
      const record = currentDayAttendance[emp.id];
      if (!record || !record.status) {
        notMarked++;
      } else if (record.status === 'present') {
        present++;
      } else if (record.status === 'half_day') {
        halfDay++;
      } else if (record.status === 'absent') {
        absent++;
      } else if (record.status === 'paid_leave') {
        paidLeave++;
      }
    });

    return { present, halfDay, absent, paidLeave, notMarked, total: activeEmployees.length };
  }, [activeEmployees, currentDayAttendance]);

  const handleStatusChange = (employeeId, status) => {
    const current = currentDayAttendance[employeeId] || {};
    markAttendance(selectedDate, employeeId, {
      ...current,
      status,
      inTime: current.inTime || (status === 'present' || status === 'half_day' ? '09:30' : ''),
      outTime: current.outTime || (status === 'present' ? '19:00' : status === 'half_day' ? '14:00' : ''),
    });
    showToast(`Marked ${status.replace('_', ' ')} for ${employeeId}`, 'info');
  };

  const handleTimeChange = (employeeId, field, value) => {
    const current = currentDayAttendance[employeeId] || { status: 'present' };
    markAttendance(selectedDate, employeeId, {
      ...current,
      [field]: value,
    });
  };

  const handleMarkAll = (status) => {
    markAllPresent(selectedDate, status);
    showToast(`Marked all active staff as ${status}`, 'success');
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-4">
      {/* Date & Action Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-gray-300 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex-1 md:flex-initial">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-48 px-3.5 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-gray-300 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors"
          >
            Today
          </button>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => handleMarkAll('present')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-glow-green transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-gray-950" />
            <span>Mark All Present</span>
          </button>

          <button
            onClick={() => handleMarkAll('paid_leave')}
            className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/5 text-xs text-gray-300 hover:text-white transition-all"
          >
            Holiday / Off
          </button>
        </div>
      </div>

      {/* Daily Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="glass-panel p-3 rounded-xl border border-white/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Active</span>
          <p className="text-lg font-black text-white">{dailySummary.total}</p>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Present</span>
          <p className="text-lg font-black text-emerald-400">{dailySummary.present}</p>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-amber-400">Half Day</span>
          <p className="text-lg font-black text-amber-400">{dailySummary.halfDay}</p>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-rose-400">Absent</span>
          <p className="text-lg font-black text-rose-400">{dailySummary.absent}</p>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-cyan-400">Paid Leave</span>
          <p className="text-lg font-black text-cyan-400">{dailySummary.paidLeave}</p>
        </div>
      </div>

      {/* Staff Attendance Register Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
                <th className="py-3 px-4">In Time</th>
                <th className="py-3 px-4">Out Time</th>
                <th className="py-3 px-4 text-right">Notes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {activeEmployees.map((emp) => {
                const record = currentDayAttendance[emp.id] || { status: 'present', inTime: '09:30', outTime: '19:00' };
                const currentStatus = record.status || 'not_marked';

                return (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Name & ID */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{emp.name}</div>
                      <span className="text-[10px] font-mono text-gray-500">{emp.id} • {emp.phone}</span>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4 text-gray-300 font-medium">
                      {emp.role}
                    </td>

                    {/* Status Toggle Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 p-1 bg-gray-900 border border-white/10 rounded-xl">
                        {[
                          { id: 'present', label: 'Present', activeClass: 'bg-emerald-500 text-gray-950 font-bold' },
                          { id: 'half_day', label: 'Half Day', activeClass: 'bg-amber-500 text-gray-950 font-bold' },
                          { id: 'absent', label: 'Absent', activeClass: 'bg-rose-500 text-white font-bold' },
                          { id: 'paid_leave', label: 'Leave', activeClass: 'bg-cyan-500 text-gray-950 font-bold' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => handleStatusChange(emp.id, btn.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                              currentStatus === btn.id
                                ? btn.activeClass
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* In Time */}
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        value={record.inTime || ''}
                        onChange={(e) => handleTimeChange(emp.id, 'inTime', e.target.value)}
                        disabled={currentStatus === 'absent' || currentStatus === 'paid_leave'}
                        className="px-2 py-1 bg-gray-900 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-30"
                      />
                    </td>

                    {/* Out Time */}
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        value={record.outTime || ''}
                        onChange={(e) => handleTimeChange(emp.id, 'outTime', e.target.value)}
                        disabled={currentStatus === 'absent' || currentStatus === 'paid_leave'}
                        className="px-2 py-1 bg-gray-900 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-30"
                      />
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-right">
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={record.notes || ''}
                        onChange={(e) => handleTimeChange(emp.id, 'notes', e.target.value)}
                        className="w-32 px-2 py-1 bg-gray-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                );
              })}

              {activeEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No active staff members found. Add staff in the Team tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
