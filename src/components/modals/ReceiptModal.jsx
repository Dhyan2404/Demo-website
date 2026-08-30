import React, { useRef } from 'react';
import { Printer, CheckCircle2, Download, Share2 } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export const ReceiptModal = ({ isOpen, onClose, sale = null }) => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const receiptAreaRef = useRef(null);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const isUdhaar = sale.paymentMethod === 'udhaar';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sales Receipt • ${sale.invoiceNo}`}
      subtitle="Ready to print thermal slip or download copy"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Printable Area */}
        <div
          ref={receiptAreaRef}
          className="printable-receipt-area bg-white text-gray-900 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 font-mono text-xs"
        >
          {/* Shop Header */}
          <div className="text-center border-b border-dashed border-gray-300 pb-3">
            <h2 className="text-base font-black uppercase tracking-wider text-gray-950 font-sans">
              {shopName}
            </h2>
            <p className="text-[10px] text-gray-500 font-sans">
              Smart Retail & Inventory Management
            </p>
            <div className="text-[10px] text-gray-600 mt-1 font-mono">
              Invoice #{sale.invoiceNo}
            </div>
            <div className="text-[10px] text-gray-500">{formatDateTime(sale.createdAt)}</div>
          </div>

          {/* Customer Info */}
          <div className="flex justify-between text-[11px] border-b border-dashed border-gray-200 pb-2">
            <div>
              <span className="text-gray-500">Customer:</span>{' '}
              <strong className="text-gray-900">{sale.customerName || 'Walk-in'}</strong>
            </div>
            <div>
              <span className="text-gray-500">Payment:</span>{' '}
              <span className="uppercase font-bold text-gray-800">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Item Table */}
          <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-3">
            <div className="flex justify-between font-bold text-gray-500 text-[10px] uppercase">
              <span>Item & Qty</span>
              <span>Total</span>
            </div>
            {(sale.items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div className="pr-2">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {item.quantity} × {formatCurrency(item.sellingPrice, currency)}
                  </p>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  {formatCurrency(item.sellingPrice * item.quantity, currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Grand Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Total Items:</span>
              <span>{sale.totalQuantity}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-950 pt-1 border-t border-gray-200 font-sans">
              <span>Grand Total:</span>
              <span>{formatCurrency(sale.totalAmount, currency)}</span>
            </div>

            {isUdhaar && (
              <div className="flex justify-between text-xs text-amber-700 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                <span>Recorded as Udhaar Debt:</span>
                <span>{formatCurrency(sale.pendingAmount || sale.totalAmount, currency)}</span>
              </div>
            )}
          </div>

          {/* Owner Net Profit (Visible in App, optional print note) */}
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] flex items-center justify-between text-emerald-800 font-semibold no-print">
            <span>Owner Net Margin:</span>
            <span className="font-bold">+{formatCurrency(sale.netProfit, currency)}</span>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-gray-400 pt-2 border-t border-dashed border-gray-200">
            Thank you for your business! Have a great day.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Done
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-extrabold rounded-xl shadow-glow-green flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
