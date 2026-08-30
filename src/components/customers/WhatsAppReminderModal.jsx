import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const WhatsAppReminderModal = ({ isOpen, onClose, customer }) => {
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const upiId = useThemeStore((state) => state.settings?.upiId || 'shop@upi');
  const showToast = useThemeStore((state) => state.showToast);

  const [selectedTemplate, setSelectedTemplate] = useState('friendly'); // 'friendly' | 'overdue' | 'settlement'

  const messageTemplates = useMemo(() => {
    if (!customer) return {};
    const balance = formatCurrency(customer.currentBalance, currency);

    return {
      friendly: `Hello ${customer.name}, 👋\n\nThis is a gentle reminder from *${shopName}* regarding your pending account balance of *${balance}*.\n\nYou can easily pay via UPI to:\n📱 *${upiId}*\n\nThank you for your business! 🙏`,
      
      overdue: `Dear ${customer.name},\n\nThis is an official account statement update from *${shopName}*.\n\n📌 *Pending Balance:* ${balance}\n📌 *Customer Contact:* ${customer.phone}\n\nPlease settle this balance at your earliest convenience via UPI (*${upiId}*) or at our store counter.\n\nThank you for your cooperation.`,

      settlement: `Thank you ${customer.name}! 🌟\n\nWe have successfully recorded your recent payment with *${shopName}*.\n\nRemaining Balance: *${balance}*\n\nWe appreciate your continued patronage!`
    };
  }, [customer, shopName, currency, upiId]);

  const [customText, setCustomText] = useState('');

  // Update text when template or customer changes
  React.useEffect(() => {
    if (messageTemplates[selectedTemplate]) {
      setCustomText(messageTemplates[selectedTemplate]);
    }
  }, [selectedTemplate, messageTemplates]);

  if (!customer) return null;

  const handleSendWhatsApp = () => {
    if (!customer.phone) {
      showToast('No phone number saved for this customer', 'warning');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(customText);
    const url = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    onClose();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customText);
    showToast('Message copied to clipboard!', 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send WhatsApp Statement / Reminder"
      subtitle={`Send customized billing notifications directly to ${customer.name}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Template Selector Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'friendly', label: 'Gentle Reminder', icon: Sparkles },
            { id: 'overdue', label: 'Account Notice', icon: AlertTriangle },
            { id: 'settlement', label: 'Thank You Note', icon: Receipt },
          ].map((t) => {
            const Icon = t.icon;
            const active = selectedTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 text-xs font-bold border transition-all ${
                  active
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-glow-green'
                    : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <label className="font-bold uppercase tracking-wider text-[11px]">
              WhatsApp Message Preview & Editor
            </label>
            <button
              onClick={handleCopyText}
              className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <Copy className="w-3 h-3" /> Copy Text
            </button>
          </div>

          <textarea
            rows={7}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full p-3.5 bg-gray-900 border border-white/15 rounded-2xl text-white text-xs leading-relaxed font-sans focus:outline-none focus:border-emerald-500 custom-scrollbar"
          />
        </div>

        {/* Recipient info & Trigger */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-400">
            Sending to: <strong className="text-white">{customer.name}</strong> ({customer.phone})
          </div>

          <button
            onClick={handleSendWhatsApp}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Send className="w-4 h-4 text-gray-950 stroke-[3]" />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
