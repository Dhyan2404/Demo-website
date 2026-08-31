import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  IndianRupee,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Calendar,
} from 'lucide-react';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const StaffListTab = ({ onOpenAddModal, onOpenEditModal }) => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  const employees = useEmployeeStore((state) => state.employees);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);
  const searchQuery = useEmployeeStore((state) => state.searchQuery);
  const setSearchQuery = useEmployeeStore((state) => state.setSearchQuery);
  const filterRole = useEmployeeStore((state) => state.filterRole);
  const setFilterRole = useEmployeeStore((state) => state.setFilterRole);

  const roles = useMemo(() => {
    const set = new Set((employees || []).map((e) => e.role));
    return ['all', ...Array.from(set)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return (employees || []).filter((emp) => {
      const matchesSearch =
        !searchQuery ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery) ||
        (emp.role && emp.role.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = filterRole === 'all' || emp.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [employees, searchQuery, filterRole]);

  const handleDelete = (emp) => {
    deleteEmployee(emp.id);
    showToast(`Removed staff member ${emp.name}`, 'info');
  };

  const handleWhatsAppContact = (emp) => {
    const cleanPhone = emp.phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Hello ${emp.name}, message from store management.`);
    window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, ID or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Roles Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterRole === r
                  ? 'bg-emerald-500 text-gray-950 shadow-sm'
                  : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {r === 'all' ? `All Roles (${employees.length})` : r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between group space-y-3"
          >
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {emp.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium">{emp.role}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                    {emp.id}
                  </span>
                  <Badge
                    variant={emp.status === 'active' ? 'success' : emp.status === 'on_leave' ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {emp.status === 'active' ? 'Active' : emp.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Contact Details */}
              <div className="mt-3 space-y-1.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono">{emp.phone}</span>
                </div>
                {emp.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate text-gray-400">{emp.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined: {emp.joiningDate || '2025-01-01'}</span>
                </div>
              </div>
            </div>

            {/* Salary Box */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Base Salary</span>
                <p className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(emp.baseSalary, currency)}
                  <span className="text-[10px] text-gray-400 font-normal ml-1">
                    /{emp.salaryType === 'monthly' ? 'mo' : emp.salaryType === 'daily' ? 'day' : 'hr'}
                  </span>
                </p>
              </div>

              {emp.upiId && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400">UPI Payout</span>
                  <p className="text-xs font-mono text-cyan-300 truncate max-w-[120px]">{emp.upiId}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleWhatsAppContact(emp)}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                  title="Message on WhatsApp"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`tel:${emp.phone}`}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-colors"
                  title="Call Staff Phone"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenEditModal(emp)}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-colors"
                  title="Edit Staff Info"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(emp)}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 border border-white/5 transition-colors"
                  title="Remove Staff"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 space-y-2 glass-panel rounded-2xl border border-white/5">
            <Users className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No staff members found</p>
            <p className="text-xs text-gray-500">Add team members to manage attendance, salaries, and payroll.</p>
          </div>
        )}
      </div>
    </div>
  );
};
