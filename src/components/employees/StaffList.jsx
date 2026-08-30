import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Phone,
  UserCheck,
  UserX,
  ChevronDown,
  Save,
  Banknote,
  User,
} from 'lucide-react';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { soundEffects } from '../../utils/soundEffects.js';
import { formatCurrency } from '../../utils/formatters.js';
import { itemVariants, listVariants } from '../modals/WelcomeIntroModal.jsx';

const ROLES = [
  'Manager', 'Assistant Manager', 'Salesperson', 'Cashier',
  'Delivery Boy', 'Accountant', 'Peon', 'Security', 'Cook', 'Helper', 'Other',
];

const EMPTY_FORM = { name: '', role: 'Salesperson', phone: '', monthlySalary: '', joinDate: new Date().toISOString().slice(0, 10) };

const EmployeeFormModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.monthlySalary || isNaN(form.monthlySalary) || Number(form.monthlySalary) < 0) e.monthlySalary = 'Valid salary required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, monthlySalary: Number(form.monthlySalary) });
  };

  const f = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 360 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-950 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl z-10">
        <div className="h-0.5 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500 rounded-t-2xl" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{initial?.id ? 'Edit Employee' : 'Add Employee'}</h3>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Full Name *</label>
              <input value={form.name} onChange={(e) => f('name', e.target.value)}
                placeholder="Employee name"
                className={`w-full px-3 py-2 rounded-xl border text-sm font-medium bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-white/10'}`} />
              {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Role</label>
              <select value={form.role} onChange={(e) => f('role', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Phone Number</label>
              <input value={form.phone} onChange={(e) => f('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile" inputMode="numeric"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Monthly Salary (₹) *</label>
              <input value={form.monthlySalary} onChange={(e) => f('monthlySalary', e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 15000" inputMode="numeric"
                className={`w-full px-3 py-2 rounded-xl border text-sm font-medium bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${errors.monthlySalary ? 'border-rose-500' : 'border-slate-200 dark:border-white/10'}`} />
              {errors.monthlySalary && <p className="text-[11px] text-rose-500 mt-0.5">{errors.monthlySalary}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-400 mb-1">Join Date</label>
              <input type="date" value={form.joinDate} onChange={(e) => f('joinDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500" />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 text-sm font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Save className="w-3.5 h-3.5" />
                {initial?.id ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export const StaffList = () => {
  const employees = useEmployeeStore((state) => state.employees || []);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
  const deleteEmployee = useEmployeeStore((state) => state.deleteEmployee);
  const toggleEmployeeActive = useEmployeeStore((state) => state.toggleEmployeeActive);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);

  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = (data) => {
    if (editEmployee?.id) {
      updateEmployee(editEmployee.id, data);
      showToast(`${data.name} updated`, 'success');
    } else {
      addEmployee(data);
      showToast(`${data.name} added to team!`, 'success');
    }
    if (soundEnabled) { try { soundEffects.playSuccessChime(); } catch (e) {} }
    setShowForm(false);
    setEditEmployee(null);
  };

  const handleDelete = (emp) => {
    deleteEmployee(emp.id);
    showToast(`${emp.name} removed`, 'info');
    setDeleteConfirm(null);
    if (soundEnabled) { try { soundEffects.playClick(); } catch (e) {} }
  };

  const totalPayroll = employees.filter((e) => e.isActive).reduce((a, e) => a + (e.monthlySalary || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary + Add Button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 dark:text-gray-400 font-medium">
          {employees.length} employees · Monthly payroll{' '}
          <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(totalPayroll, currency)}</span>
        </div>
        <button
          onClick={() => { setEditEmployee(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employee Cards */}
      {employees.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/10 p-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto">
            <Users className="w-5 h-5 text-slate-400 dark:text-gray-500" />
          </div>
          <p className="text-slate-600 dark:text-gray-400 font-semibold text-sm">No employees yet</p>
          <p className="text-slate-400 dark:text-gray-500 text-xs">Click "Add Employee" to get started</p>
        </div>
      ) : (
        <motion.div variants={listVariants} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {employees.map((emp) => (
            <motion.div
              key={emp.id}
              variants={itemVariants}
              className={`glass-panel p-4 rounded-2xl border transition-all ${
                emp.isActive
                  ? 'border-slate-200/80 dark:border-white/10'
                  : 'border-slate-200/40 dark:border-white/[0.04] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white dark:text-gray-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{emp.name}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{emp.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditEmployee(emp); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-gray-500 transition-colors cursor-pointer">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleEmployeeActive(emp.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${emp.isActive ? 'hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-400 dark:text-gray-500'}`}
                    title={emp.isActive ? 'Mark Inactive' : 'Mark Active'}>
                    {emp.isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => setDeleteConfirm(emp)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                  <Phone className="w-3 h-3" />
                  <span className="font-mono">{emp.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white font-mono">
                  <Banknote className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {formatCurrency(emp.monthlySalary, currency)}/mo
                </div>
              </div>

              {!emp.isActive && (
                <div className="mt-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-400">INACTIVE</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <EmployeeFormModal
            initial={editEmployee}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditEmployee(null); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)} className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-950 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-5 max-w-sm w-full z-10 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Remove {deleteConfirm.name}?</h4>
              <p className="text-xs text-slate-500 dark:text-gray-400">This will permanently delete the employee and all their attendance records.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold cursor-pointer">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold cursor-pointer transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
