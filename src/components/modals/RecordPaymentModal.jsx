import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, CheckCircle2, Banknote, QrCode, CreditCard } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const RecordPaymentModal = ({ isOpen, onClose, customer = null }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('Udhaar payment settled');

  const recordPayment = useCustomerStore((state) => state.recordPayment);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  useEffect(() => {
    if (customer) {
      setAmount(customer.currentBalance ? customer.currentBalance.toString() : '');
      setNote(`Udhaar repayment by ${customer.name}`);
    }
  }, [customer, isOpen]);

  if (!customer) return null;

  const currentDebt = customer.currentBalance || 0;
  const payVal = Number(amount) || 0;
  const remainingAfterPay = Math.max(0, currentDebt - payVal);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (payVal <= 0) {
      showToast('Please enter a valid numeric payment amount.', 'warning');
      return;
    }

    const custId = customer.id || customer._id;
    const success = recordPayment(custId, payVal, paymentMethod, note);
    if (success) {
      showToast(
        `Recorded ${formatCurrency(payVal, currency)} payment from ${customer.name}!`,
        'success'
      );
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Collect Payment: ${customer.name}`}
      subtitle={`Current Outstanding Udhaar: ${formatCurrency(currentDebt, currency)}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Outstanding Summary */}
        <div className="p-3.5 rounded-2xl bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div>
            <span className="text-amber-800 dark:text-amber-300 font-bold">Total Pending Debt:</span>
            <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400 font-mono mt-0.5">
              {formatCurrency(currentDebt, currency)}
            </p>
          </div>
          {currentDebt > 0 && (
            <button
              type="button"
              onClick={() => setAmount(currentDebt.toString())}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 shadow-sm transition-all cursor-pointer"
            >
              Pay Full Balance
            </button>
          )}
        </div>

        {/* Amount Input (Strict Numbers Only) */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Amount Received ({currency}) *</label>
          <input
            type="text"
            inputMode="decimal"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-base font-mono font-bold focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Payment Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Payment Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'upi', label: 'UPI Online', icon: QrCode },
              { id: 'card', label: 'Card / Bank', icon: CreditCard },
            ].map((m) => {
              const Icon = m.icon;
              const active = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500/20 dark:bg-emerald-500/20 border-amber-500/60 dark:border-emerald-500/50 text-amber-900 dark:text-emerald-300 shadow-sm'
                      : 'bg-slate-100 dark:bg-white/[0.02] border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Payment Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Remaining debt preview */}
        <div className="flex items-center justify-between text-xs pt-1 text-slate-600 dark:text-gray-400 font-medium">
          <span>Remaining Balance after payment:</span>
          <span className={`font-mono font-bold ${remainingAfterPay === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
            {formatCurrency(remainingAfterPay, currency)}
            {remainingAfterPay === 0 && ' (Fully Settled)'}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-shimmer px-5 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-glow-gold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Confirm Payment ({formatCurrency(payVal, currency)})</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
