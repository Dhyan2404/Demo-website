import React from 'react';
import { CreditCard, Banknote, QrCode, Phone, Mail, MapPin, Send, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export const CustomerDetailModal = ({ isOpen, onClose, customer, onRecordPayment, onSendReminder }) => {
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');

  if (!customer) return null;

  const currentBalance = customer.currentBalance || 0;
  const transactions = customer.transactions || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      subtitle={`Customer Account & Udhaar Statement`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Outstanding Debt */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Current Outstanding</span>
            <p className="text-2xl font-extrabold text-amber-300 font-mono mt-1">
              {formatCurrency(currentBalance, currency)}
            </p>
            <span className="text-[11px] text-gray-400 block mt-0.5">
              {currentBalance > 0 ? 'Pending repayment' : 'Account all clear'}
            </span>
          </div>

          {/* Total Credit Given */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Credit Taken</span>
            <p className="text-xl font-bold text-white font-mono mt-1">
              {formatCurrency(customer.totalCredit || 0, currency)}
            </p>
            <span className="text-[11px] text-gray-500 block mt-0.5">Lifetime Udhaar value</span>
          </div>

          {/* Total Repaid */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Paid Back</span>
            <p className="text-xl font-bold text-emerald-300 font-mono mt-1">
              {formatCurrency(customer.totalPaid || 0, currency)}
            </p>
            <span className="text-[11px] text-gray-400 block mt-0.5">Settled via Cash/UPI</span>
          </div>

        </div>

        {/* Contact info bar & quick actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-gray-300">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {currentBalance > 0 && (
              <>
                <button
                  onClick={() => onSendReminder && onSendReminder(customer)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-1 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onRecordPayment && onRecordPayment(customer)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 font-bold text-xs flex items-center gap-1 shadow-glow-green transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Settle / Pay</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Ledger Statement ({transactions.length} transactions)</h4>
          
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {transactions.map((tx, idx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id || idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isCredit
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-emerald-500/5 border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isCredit ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {isCredit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {isCredit ? 'Udhaar Added (Goods Taken)' : `Payment Received (${(tx.paymentMethod || 'cash').toUpperCase()})`}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDateTime(tx.date)} {tx.invoiceNo ? `• Inv #${tx.invoiceNo}` : ''} {tx.note ? `• ${tx.note}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold">
                    <span className={`text-sm ${isCredit ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                </div>
              );
            })}

            {transactions.length === 0 && (
              <div className="py-8 text-center text-gray-500 text-xs">
                No past transactions recorded for this customer yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
};
