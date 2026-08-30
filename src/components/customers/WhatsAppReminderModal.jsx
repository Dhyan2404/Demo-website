import React, { useState } from 'react';
import { Send, Copy, Check, MessageSquare, Phone } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const WhatsAppReminderModal = ({ isOpen, onClose, customer }) => {
  const settings = useThemeStore((state) => state.settings);
  const currency = settings.currencySymbol || '₹';
  const showToast = useThemeStore((state) => state.showToast);
  const [copied, setCopied] = useState(false);

  if (!customer) return null;

  const currentBalance = customer.currentBalance || 0;
  const messageText = `Hello ${customer.name},\n\nThis is a gentle payment reminder from *${settings.shopName}* regarding your pending balance of *${currency}${currentBalance.toLocaleString()}*.\n\nYou can settle via UPI to *${settings.upiId}* or visit our store at ${settings.address}.\n\nThank you for your business! 🙏`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    showToast('Reminder message copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const rawPhone = customer.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('91') ? rawPhone : `91${rawPhone}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send WhatsApp Payment Reminder"
      subtitle={`Customer: ${customer.name} (${customer.phone})`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        
        {/* Customer Balance Summary */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Total Udhaar Pending</span>
            <p className="text-xl font-extrabold text-amber-300 font-mono mt-0.5">
              {formatCurrency(currentBalance, currency)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>+91 {customer.phone}</span>
          </div>
        </div>

        {/* Message Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Preview Reminder Message</label>
          <div className="p-4 rounded-2xl bg-gray-900 border border-white/10 text-xs font-mono text-gray-200 whitespace-pre-wrap leading-relaxed">
            {messageText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold border border-white/10 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Message'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold rounded-xl text-xs shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Open WhatsApp Web / App</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
