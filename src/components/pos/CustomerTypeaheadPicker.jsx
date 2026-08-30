import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  User,
  UserCheck,
  Search,
  Plus,
  X,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
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
    if (!newPhone.trim()) {
      showToast('Please enter phone number', 'warning');
      return;
    }

    const created = await addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      totalCredit: 0,
      totalPaid: 0,
    });

    setCartCustomer(created.id, created.name, created.phone);
    setNewName('');
    setNewPhone('');
    setIsAddingNew(false);
    setIsOpen(false);
    showToast(`Registered & attached "${created.name}"`, 'success');
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>Customer & Account</span>
        </label>

        {/* Quick Guest Toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSelectGuest}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              isGuest && !isUdhaar
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Guest (Walk-in)
          </button>
        </div>
      </div>

      {/* Selected Customer Card or Search Field */}
      {selectedCustomer ? (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-gray-900/60 to-emerald-950/30 border border-cyan-500/40 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-white truncate">{selectedCustomer.name}</p>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                  (selectedCustomer.currentBalance || 0) > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300'
                }`}>
                  {(selectedCustomer.currentBalance || 0) > 0
                    ? `Udhaar: ${formatCurrency(selectedCustomer.currentBalance, currency)}`
                    : 'All Clear'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>{selectedCustomer.phone}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSelectGuest}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Remove Customer / Switch to Guest"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isAddingNew ? (
        /* Inline Fast Add New Customer Form */
        <form onSubmit={handleCreateNewCustomer} className="p-3 rounded-2xl bg-gray-900 border border-emerald-500/40 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> Register New Customer
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-[11px] text-gray-400 hover:text-white"
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
              className="px-2.5 py-1.5 bg-gray-950 border border-white/15 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="tel"
              required
              placeholder="Phone (WhatsApp)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-950 border border-white/15 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-[11px] rounded-lg shadow-sm"
            >
              Save & Attach
            </button>
          </div>
        </form>
      ) : (
        /* Search / Autocomplete Field */
        <div className="relative">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type name (e.g. 'pri') or phone number..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full pl-8 pr-8 py-2 bg-gray-900/90 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-xs font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="p-1 text-gray-400 hover:text-white absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto custom-scrollbar p-1 space-y-1">
              {filteredCustomers.map((cust) => {
                const debt = cust.currentBalance || 0;
                return (
                  <div
                    key={cust.id || cust._id}
                    onClick={() => handleSelectCustomer(cust)}
                    className="p-2 rounded-xl hover:bg-cyan-500/15 cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-white group-hover:text-cyan-300 truncate">
                        {cust.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-gray-500" />
                        <span>{cust.phone}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold shrink-0 ${
                        debt > 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {debt > 0 ? `Udhaar: ${formatCurrency(debt, currency)}` : 'Clear'}
                    </span>
                  </div>
                );
              })}

              {/* Action to create new customer if not found */}
              <div
                onClick={() => {
                  if (query) {
                    if (/^\d+$/.test(query)) {
                      setNewPhone(query);
                      setNewName('');
                    } else {
                      setNewName(query);
                      setNewPhone('');
                    }
                  }
                  setIsAddingNew(true);
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add "{query || 'New Customer'}" as New Account</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warning if Udhaar selected without customer */}
      {isUdhaar && isGuest && (
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Please search & select or add a customer above to record Udhaar debt.</span>
        </div>
      )}
    </div>
  );
};
