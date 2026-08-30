import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  UserCheck,
  UserPlus,
  X,
  Phone,
  AlertTriangle,
  User,
  Plus,
} from 'lucide-react';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const CustomerTypeaheadPicker = ({ isUdhaar = false }) => {
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);

  const selectedCustomerStore = useSalesStore((state) => state.selectedCustomer);
  const setCartCustomer = useSalesStore((state) => state.setCartCustomer);

  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter existing customers by name OR phone number
  const filteredCustomers = useMemo(() => {
    const list = customers || [];
    if (!query.trim()) return list.slice(0, 5); // show top 5 recent when focused
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').includes(q);
      return matchName || matchPhone;
    });
  }, [customers, query]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerStore) return null;
    const storeId = selectedCustomerStore.id || selectedCustomerStore._id;
    return (customers || []).find((c) => (c.id && c.id === storeId) || (c._id && c._id === storeId)) || selectedCustomerStore;
  }, [customers, selectedCustomerStore]);

  const isGuest = !selectedCustomerStore;

  const handleSelectCustomer = (cust) => {
    setCartCustomer(cust.id || cust._id, cust.name, cust.phone);
    setQuery('');
    setIsOpen(false);
    setIsAddingNew(false);
    showToast(`Attached customer: ${cust.name}`, 'info');
  };

  const handleSelectGuest = () => {
    setCartCustomer(null, 'Walk-in Customer', '');
    setQuery('');
    setIsOpen(false);
    setIsAddingNew(false);
  };

  const handleCreateNewCustomer = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Please enter customer name', 'warning');
      return;
    }
    const cleanPhone = newPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      showToast('Please enter valid numeric phone number', 'warning');
      return;
    }

    const created = await addCustomer({
      name: newName.trim(),
      phone: cleanPhone,
      totalCredit: 0,
      totalPaid: 0,
    });

    setCartCustomer(created.id || created._id, created.name, created.phone);
    setNewName('');
    setNewPhone('');
    setIsAddingNew(false);
    setIsOpen(false);
    showToast(`Registered & attached "${created.name}"`, 'success');
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-600 dark:text-cyan-400" />
          <span>Customer & Account</span>
        </label>

        {/* Quick Guest Toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSelectGuest}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              isGuest && !isUdhaar
                ? 'bg-slate-200 dark:bg-white/15 text-slate-900 dark:text-white border border-slate-300 dark:border-white/20'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Guest (Walk-in)
          </button>
        </div>
      </div>

      {/* Selected Customer Card or Search Field */}
      {selectedCustomer ? (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-100 dark:from-cyan-950/40 dark:via-gray-900/60 dark:to-emerald-950/30 border border-amber-500/30 dark:border-cyan-500/40 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 dark:bg-cyan-500/20 text-amber-600 dark:text-cyan-400 border border-amber-500/30 dark:border-cyan-500/40 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedCustomer.name}</p>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                  (selectedCustomer.currentBalance || 0) > 0
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {(selectedCustomer.currentBalance || 0) > 0
                    ? `Udhaar: ${formatCurrency(selectedCustomer.currentBalance, currency)}`
                    : 'All Clear'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-600 dark:text-cyan-400" />
                <span>{selectedCustomer.phone}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSelectGuest}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            title="Remove Customer / Switch to Guest"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isAddingNew ? (
        /* Inline Fast Add New Customer Form */
        <form onSubmit={handleCreateNewCustomer} className="p-3 rounded-2xl bg-white dark:bg-gray-900 border border-amber-500/40 dark:border-emerald-500/40 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-emerald-400" /> Register New Customer
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-[11px] text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              autoFocus
              placeholder="Customer Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-gray-950 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="tel"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Phone (Digits only)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-gray-950 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-[11px] font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-shimmer px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-[11px] rounded-lg shadow-sm cursor-pointer"
            >
              Save & Attach
            </button>
          </div>
        </form>
      ) : (
        /* Search / Autocomplete Field */
        <div className="relative">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type name (e.g. 'pri') or phone number..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full pl-8 pr-8 py-2 bg-slate-100 dark:bg-gray-900/90 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-cyan-500 text-xs font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 dark:bg-gray-900/95 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto custom-scrollbar p-1 space-y-1">
              {filteredCustomers.map((cust) => {
                const debt = cust.currentBalance || 0;
                return (
                  <div
                    key={cust.id || cust._id}
                    onClick={() => handleSelectCustomer(cust)}
                    className="p-2 rounded-xl hover:bg-amber-500/15 dark:hover:bg-cyan-500/15 cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-cyan-300 truncate">
                        {cust.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-slate-400 dark:text-gray-500" />
                        <span>{cust.phone}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold shrink-0 ${
                        debt > 0
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {debt > 0 ? `Udhaar: ${formatCurrency(debt, currency)}` : 'Clear'}
                    </span>
                  </div>
                );
              })}

              {filteredCustomers.length === 0 && (
                <div className="p-3 text-center text-slate-500 dark:text-gray-400 text-xs">
                  No customer matching "{query}"
                </div>
              )}

              {/* Add New Customer Button */}
              <button
                type="button"
                onClick={() => {
                  setNewName(query);
                  setIsAddingNew(true);
                  setIsOpen(false);
                }}
                className="w-full p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-amber-800 dark:text-emerald-300 border border-amber-500/30 dark:border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Customer</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warning if Udhaar mode is active without a customer selected */}
      {isUdhaar && isGuest && (
        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-2 text-[11px] font-semibold animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Select an existing customer or register one above to record Udhaar debt.</span>
        </div>
      )}
    </div>
  );
};
