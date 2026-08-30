import React, { useState } from 'react';
import { CreditCard, Banknote, QrCode, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal.jsx';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const RecordPaymentModal = ({ isOpen, onClose, customer }) => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);
  const recordPayment = useCustomerStore((state) => state.recordPayment);

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('Udhaar payment received');

  if (!customer) return null;

  const currentDebt = customer.currentBalance || 0;

  const handleSettleFull = () => {
    setAmount(currentDebt.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payNum = Number(amount);
    if (!payNum || payNum <= 0) {
      showToast('Please enter a valid payment amount', 'warning');
      return;
    }

    const success = await recordPayment(customer.id || customer._id, payNum, paymentMethod, note);
    if (success) {
      if (payNum >= currentDebt) {
        // Full settlement celebration
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast(`Full debt settled for ${customer.name}!`, 'success');
      } else {
        showToast(`Recorded payment of ${formatCurrency(payNum, currency)} for ${customer.name}`, 'success');
      }
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment: ${customer.name}`}
      subtitle={`Total Pending Debt: ${formatCurrency(currentDebt, currency)}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Balance Card */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Current Outstanding Debt</span>
            <p className="text-xl font-extrabold text-amber-300 font-mono mt-0.5">
              {formatCurrency(currentDebt, currency)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSettleFull}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-sm transition-all"
          >
            Settle Full Debt
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Payment Amount ({currency}) *</label>
          <input
            type="number"
            min="1"
            max={currentDebt}
            step="any"
            required
            autoFocus
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-base font-mono font-bold text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'upi', label: 'UPI Online', icon: QrCode },
              { id: 'card', label: 'Card / Bank', icon: CreditCard },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
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
          <label className="text-xs font-semibold text-gray-300">Note</label>
          <input
            type="text"
            placeholder="e.g. Cash handed at shop, GPay ref #1234"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Action buttons */}
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-glow-green transition-all"
          >
            Confirm & Update Balance
          </button>
        </div>

      </form>
    </Modal>
  );
};
