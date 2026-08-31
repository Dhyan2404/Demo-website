import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { User, Phone, Mail, MapPin, IndianRupee, CreditCard, Briefcase, Calendar } from 'lucide-react';
import { useEmployeeStore } from '../../store/useEmployeeStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';

export const EmployeeFormModal = ({ isOpen, onClose, employeeToEdit }) => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Sales Associate',
    phone: '',
    email: '',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salaryType: 'monthly',
    baseSalary: '',
    status: 'active',
    upiId: '',
    bankDetails: {
      accountNo: '',
      ifsc: '',
      bankName: '',
    },
  });

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        name: employeeToEdit.name || '',
        role: employeeToEdit.role || 'Sales Associate',
        phone: employeeToEdit.phone || '',
        email: employeeToEdit.email || '',
        address: employeeToEdit.address || '',
        joiningDate: employeeToEdit.joiningDate || new Date().toISOString().split('T')[0],
        salaryType: employeeToEdit.salaryType || 'monthly',
        baseSalary: employeeToEdit.baseSalary || '',
        status: employeeToEdit.status || 'active',
        upiId: employeeToEdit.upiId || '',
        bankDetails: {
          accountNo: employeeToEdit.bankDetails?.accountNo || '',
          ifsc: employeeToEdit.bankDetails?.ifsc || '',
          bankName: employeeToEdit.bankDetails?.bankName || '',
        },
      });
    } else {
      setFormData({
        name: '',
        role: 'Sales Associate',
        phone: '',
        email: '',
        address: '',
        joiningDate: new Date().toISOString().split('T')[0],
        salaryType: 'monthly',
        baseSalary: '',
        status: 'active',
        upiId: '',
        bankDetails: { accountNo: '', ifsc: '', bankName: '' },
      });
    }
  }, [employeeToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Name and phone number are required', 'warning');
      return;
    }

    if (!formData.baseSalary || Number(formData.baseSalary) <= 0) {
      showToast('Please enter a valid base salary', 'warning');
      return;
    }

    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, formData);
      showToast(`Updated staff details for "${formData.name}"`, 'success');
    } else {
      const created = addEmployee(formData);
      showToast(`Added new staff member "${created.name}"`, 'success');
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeToEdit ? `Edit Staff Member (${employeeToEdit.id})` : 'Register New Staff / Employee'}
      subtitle="Configure staff profile, role, salary structure, and payout details"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>Role / Designation *</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Store Manager">Store Manager</option>
              <option value="Lead Cashier / Billing">Lead Cashier / Billing</option>
              <option value="Sales Associate">Sales Associate</option>
              <option value="Stock & Inventory Executive">Stock & Inventory Executive</option>
              <option value="Delivery & Support">Delivery & Support</option>
              <option value="Accountant">Accountant</option>
              <option value="Helper / Cleaner">Helper / Cleaner</option>
              <option value="Custom Role">Other / Custom</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile Phone Number *</span>
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>Email Address (Optional)</span>
            </label>
            <input
              type="email"
              placeholder="staff@store.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Salary & Employment Terms */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Salary & Compensation Structure</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">Salary Model</label>
              <select
                value={formData.salaryType}
                onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="monthly">Monthly Fixed</option>
                <option value="daily">Daily Wage (Per Day)</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">
                Base Rate ({currency} / {formData.salaryType === 'monthly' ? 'Month' : formData.salaryType === 'daily' ? 'Day' : 'Hour'}) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="100"
                placeholder="e.g. 20000"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">Employment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="active">Active & Working</option>
                <option value="on_leave">On Extended Leave</option>
                <option value="inactive">Resigned / Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment & Bank Details */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bank & UPI Payout Info (Optional)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">UPI ID / VPA</label>
              <input
                type="text"
                placeholder="e.g. employee@upi"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank"
                value={formData.bankDetails.bankName}
                onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">Bank Account Number</label>
              <input
                type="text"
                placeholder="Account number"
                value={formData.bankDetails.accountNo}
                onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNo: e.target.value } })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400">IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. HDFC0001234"
                value={formData.bankDetails.ifsc}
                onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifsc: e.target.value.toUpperCase() } })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white font-mono uppercase focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>Residential Address</span>
          </label>
          <input
            type="text"
            placeholder="Street, Landmark, City"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3.5 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-black text-xs shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {employeeToEdit ? 'Save Changes' : 'Register Staff Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
