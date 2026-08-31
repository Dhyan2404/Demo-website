import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_EMPLOYEES = [
  {
    id: 'EMP-001',
    name: 'Rahul Sharma',
    role: 'Store Manager',
    phone: '9876543210',
    email: 'rahul.sharma@example.com',
    joiningDate: '2025-01-15',
    salaryType: 'monthly',
    baseSalary: 28000,
    status: 'active',
    upiId: 'rahulsharma@oksbi',
    bankDetails: { accountNo: '3489101002345', ifsc: 'SBIN0001234', bankName: 'State Bank of India' },
    address: 'Flat 402, Sunshine Apts, Main City',
  },
  {
    id: 'EMP-002',
    name: 'Priya Verma',
    role: 'Lead Cashier / Billing',
    phone: '9811223344',
    email: 'priya.v@example.com',
    joiningDate: '2025-03-01',
    salaryType: 'monthly',
    baseSalary: 19500,
    status: 'active',
    upiId: 'priyaverma@okaxis',
    bankDetails: { accountNo: '9180200456123', ifsc: 'UTIB0000456', bankName: 'Axis Bank' },
    address: 'House 12, Gandhi Nagar',
  },
  {
    id: 'EMP-003',
    name: 'Amit Patel',
    role: 'Stock & Inventory Executive',
    phone: '9822334455',
    email: 'amit.patel@example.com',
    joiningDate: '2025-06-10',
    salaryType: 'monthly',
    baseSalary: 16000,
    status: 'active',
    upiId: 'amitpatel@paytm',
    bankDetails: { accountNo: '5010023456789', ifsc: 'HDFC0000789', bankName: 'HDFC Bank' },
    address: 'Near Station Road',
  },
  {
    id: 'EMP-004',
    name: 'Suresh Kumar',
    role: 'Delivery & Customer Support',
    phone: '9733445566',
    email: '',
    joiningDate: '2025-09-01',
    salaryType: 'monthly',
    baseSalary: 14500,
    status: 'active',
    upiId: 'sureshk@ybl',
    bankDetails: { accountNo: '2019485761230', ifsc: 'PUNB0012340', bankName: 'Punjab National Bank' },
    address: 'Sector 4, Market Colony',
  },
];

// Helper to pre-populate some recent attendance records
const getInitialAttendance = () => {
  const att = {};
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    att[dateStr] = {
      'EMP-001': { status: 'present', inTime: '09:00', outTime: '19:30' },
      'EMP-002': { status: 'present', inTime: '09:15', outTime: '19:15' },
      'EMP-003': { status: i === 2 ? 'half_day' : 'present', inTime: '09:30', outTime: i === 2 ? '14:00' : '19:00' },
      'EMP-004': { status: i === 4 ? 'absent' : 'present', inTime: '09:00', outTime: '18:30' },
    };
  }
  return att;
};

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: INITIAL_EMPLOYEES,
      attendance: getInitialAttendance(), // { 'YYYY-MM-DD': { 'EMP-001': { status: 'present', inTime: '...', outTime: '...' } } }
      payrollRecords: [],
      selectedDate: new Date().toISOString().split('T')[0],
      selectedMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      searchQuery: '',
      filterRole: 'all',

      // Navigation & Filter setters
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterRole: (role) => set({ filterRole: role }),

      // Employee CRUD
      addEmployee: (employeeData) => {
        const newId = `EMP-${String(get().employees.length + 1).padStart(3, '0')}`;
        const newEmployee = {
          id: newId,
          ...employeeData,
          baseSalary: Number(employeeData.baseSalary) || 0,
          status: employeeData.status || 'active',
          joiningDate: employeeData.joiningDate || new Date().toISOString().split('T')[0],
          bankDetails: employeeData.bankDetails || { accountNo: '', ifsc: '', bankName: '' },
        };

        set((state) => ({
          employees: [newEmployee, ...state.employees],
        }));
        return newEmployee;
      },

      updateEmployee: (id, updates) => {
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.id === id ? { ...emp, ...updates, baseSalary: Number(updates.baseSalary ?? emp.baseSalary) || 0 } : emp
          ),
        }));
      },

      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== id),
        }));
      },

      // Attendance Operations
      markAttendance: (dateStr, employeeId, statusData) => {
        set((state) => {
          const currentDay = state.attendance[dateStr] || {};
          return {
            attendance: {
              ...state.attendance,
              [dateStr]: {
                ...currentDay,
                [employeeId]: {
                  ...(currentDay[employeeId] || {}),
                  ...(typeof statusData === 'string' ? { status: statusData } : statusData),
                },
              },
            },
          };
        });
      },

      markAllPresent: (dateStr, defaultStatus = 'present') => {
        const { employees } = get();
        set((state) => {
          const updatedDay = {};
          employees.forEach((emp) => {
            if (emp.status === 'active') {
              updatedDay[emp.id] = {
                status: defaultStatus,
                inTime: '09:30',
                outTime: '19:00',
              };
            }
          });
          return {
            attendance: {
              ...state.attendance,
              [dateStr]: updatedDay,
            },
          };
        });
      },

      // Compute Attendance Stats for an Employee for a given month (YYYY-MM)
      getEmployeeMonthStats: (employeeId, monthStr) => {
        const { attendance } = get();
        let present = 0;
        let halfDay = 0;
        let absent = 0;
        let paidLeave = 0;

        Object.entries(attendance).forEach(([dateKey, dayRecords]) => {
          if (dateKey.startsWith(monthStr) && dayRecords[employeeId]) {
            const st = dayRecords[employeeId].status;
            if (st === 'present') present++;
            else if (st === 'half_day') halfDay++;
            else if (st === 'absent') absent++;
            else if (st === 'paid_leave') paidLeave++;
          }
        });

        // Days in month calculation
        const [year, month] = monthStr.split('-').map(Number);
        const totalDaysInMonth = new Date(year, month, 0).getDate();
        const effectiveWorkingDays = present + (halfDay * 0.5) + paidLeave;

        return {
          present,
          halfDay,
          absent,
          paidLeave,
          effectiveWorkingDays,
          totalDaysInMonth,
        };
      },

      // Record / Update Payroll payment
      savePayrollRecord: (payrollData) => {
        set((state) => {
          const existingIndex = state.payrollRecords.findIndex(
            (p) => p.employeeId === payrollData.employeeId && p.month === payrollData.month
          );
          if (existingIndex >= 0) {
            const updated = [...state.payrollRecords];
            updated[existingIndex] = { ...updated[existingIndex], ...payrollData, updatedAt: new Date().toISOString() };
            return { payrollRecords: updated };
          }
          return {
            payrollRecords: [
              {
                id: `PAY-${Date.now()}`,
                ...payrollData,
                createdAt: new Date().toISOString(),
              },
              ...state.payrollRecords,
            ],
          };
        });
      },
    }),
    {
      name: 'smartshop-employees-storage',
      version: 1,
    }
  )
);
