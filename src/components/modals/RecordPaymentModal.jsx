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
      showToast('Please enter a valid payment amount.', 'warning');
      return;
    }

    const success = recordPayment(customer.id, payVal, paymentMethod, note);
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
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div>
            <span className="text-amber-300 font-medium">Total Pending Debt:</span>
            <p className="text-lg font-extrabold text-amber-400">
              {formatCurrency(currentDebt, currency)}
            </p>
          </div>
          {currentDebt > 0 && (
            <button
              type="button"
              onClick={() => setAmount(currentDebt.toString())}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              Pay Full Balance
            </button>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Amount Received ({currency}) *</label>
          <input
            type="number"
            min="1"
            step="any"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/15 rounded-xl text-white text-base font-bold focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Payment Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Payment Mode</label>
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
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Payment Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Remaining debt preview */}
        <div className="flex items-center justify-between text-xs pt-1 text-gray-400">
          <span>Remaining Balance after payment:</span>
          <span className={`font-bold ${remainingAfterPay === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {formatCurrency(remainingAfterPay, currency)}
            {remainingAfterPay === 0 && ' (Fully Settled)'}
          </span>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-extrabold rounded-xl shadow-glow-green flex items-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Payment ({formatCurrency(payVal, currency)})</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
