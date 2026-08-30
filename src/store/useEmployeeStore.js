import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => `emp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: [],
      // attendance: { [employeeId]: { [YYYY-MM-DD]: 'present'|'absent'|'half' } }
      attendance: {},

      addEmployee: (data) => {
        const employee = {
          id: generateId(),
          name: data.name || '',
          role: data.role || 'Staff',
          phone: data.phone || '',
          monthlySalary: Number(data.monthlySalary) || 0,
          joinDate: data.joinDate || new Date().toISOString().slice(0, 10),
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ employees: [...state.employees, employee] }));
        return employee;
      },

      updateEmployee: (id, updates) => {
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },

      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
          attendance: Object.fromEntries(
            Object.entries(state.attendance).filter(([k]) => k !== id)
          ),
        }));
      },

      toggleEmployeeActive: (id) => {
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === id ? { ...e, isActive: !e.isActive } : e
          ),
        }));
      },

      // Mark attendance: status = 'present' | 'absent' | 'half'
      markAttendance: (employeeId, date, status) => {
        set((state) => ({
          attendance: {
            ...state.attendance,
            [employeeId]: {
              ...(state.attendance[employeeId] || {}),
              [date]: status,
            },
          },
        }));
      },

      // Get attendance for one employee for a specific month
      getMonthAttendance: (employeeId, year, month) => {
        const att = get().attendance[employeeId] || {};
        const filtered = {};
        Object.entries(att).forEach(([date, status]) => {
          const d = new Date(date);
          if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            filtered[date] = status;
          }
        });
        return filtered;
      },

      // Calculate payroll for an employee in a given month
      calculatePayroll: (employeeId, year, month) => {
        const employee = get().employees.find((e) => e.id === employeeId);
        if (!employee) return null;

        const monthAtt = get().getMonthAttendance(employeeId, year, month);

        // Working days in the month
        const daysInMonth = new Date(year, month, 0).getDate();
        let workingDays = 0;
        for (let d = 1; d <= daysInMonth; d++) {
          const day = new Date(year, month - 1, d).getDay();
          if (day !== 0) workingDays++; // exclude Sundays
        }

        const presentDays = Object.values(monthAtt).filter((s) => s === 'present').length;
        const halfDays = Object.values(monthAtt).filter((s) => s === 'half').length;
        const absentDays = Object.values(monthAtt).filter((s) => s === 'absent').length;
        const markedDays = presentDays + halfDays + absentDays;

        const perDaySalary = employee.monthlySalary / workingDays;
        const earned = (presentDays * perDaySalary) + (halfDays * perDaySalary * 0.5);
        const deduction = (absentDays * perDaySalary);

        return {
          employee,
          year,
          month,
          workingDays,
          markedDays,
          presentDays,
          halfDays,
          absentDays,
          perDaySalary: Number(perDaySalary.toFixed(2)),
          grossSalary: employee.monthlySalary,
          earned: Number(earned.toFixed(2)),
          deduction: Number(deduction.toFixed(2)),
          netPayable: Number(earned.toFixed(2)),
        };
      },
    }),
    {
      name: 'smartshop-employees-v1',
    }
  )
);
