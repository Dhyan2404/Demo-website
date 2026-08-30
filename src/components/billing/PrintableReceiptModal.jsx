import React, { useState } from 'react';
import { Printer, Download, CheckCircle2, ShoppingBag, CreditCard, Share2 } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';

export const PrintableReceiptModal = ({ isOpen, onClose, sale }) => {
  const settings = useThemeStore((state) => state.settings);
  const currency = settings.currencySymbol || '₹';
  const [showProfitOnReceipt, setShowProfitOnReceipt] = useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt & Invoice" subtitle={`Invoice #${sale.invoiceNo}`} maxWidth="max-w-lg">
      <div className="space-y-6">
        
        {/* Printable Area */}
        <div className="printable-receipt-area bg-white text-gray-900 p-6 rounded-2xl shadow-inner font-sans border border-gray-200">
          
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-gray-300">
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900">{settings.shopName}</h2>
            <p className="text-xs text-gray-600 mt-0.5">{settings.address}</p>
            <p className="text-xs text-gray-600">Phone: {settings.phone} {settings.gstNumber ? `| GST: ${settings.gstNumber}` : ''}</p>
            <div className="mt-2 inline-block px-2.5 py-0.5 rounded bg-gray-100 text-[11px] font-mono font-bold text-gray-800">
              TAX INVOICE / RETAIL RECEIPT
            </div>
          </div>

          {/* Metadata */}
          <div className="py-3 text-xs border-b border-dashed border-gray-300 space-y-1 text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice No:</span>
              <span className="font-mono font-bold text-gray-900">{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date & Time:</span>
              <span className="font-medium">{formatDateTime(sale.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer:</span>
              <span className="font-semibold text-gray-900">{sale.customerName || 'Walk-in'} {sale.customerPhone ? `(${sale.customerPhone})` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Mode:</span>
              <span className="font-bold uppercase text-emerald-700">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Line items table */}
          <div className="py-3 border-b border-dashed border-gray-300">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 text-left">
                  <th className="pb-1.5 font-semibold">Item</th>
                  <th className="pb-1.5 text-center font-semibold">Qty</th>
                  <th className="pb-1.5 text-right font-semibold">Rate</th>
                  <th className="pb-1.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(sale.items || []).map((item, idx) => (
                  <tr key={idx} className="py-1.5">
                    <td className="py-1.5 font-medium text-gray-900">
                      {item.name}
                      {item.sku && <span className="block text-[10px] text-gray-400 font-mono">[{item.sku}]</span>}
                    </td>
                    <td className="py-1.5 text-center text-gray-700 font-semibold">{item.quantity}</td>
                    <td className="py-1.5 text-right text-gray-700">{formatCurrency(item.sellingPrice, currency)}</td>
                    <td className="py-1.5 text-right font-bold text-gray-900">
                      {formatCurrency(item.sellingPrice * item.quantity, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-3 space-y-1.5 text-xs text-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-semibold">{sale.totalQuantity} units</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1 border-t border-gray-200">
              <span>Grand Total:</span>
              <span>{formatCurrency(sale.totalAmount, currency)}</span>
            </div>

            {sale.paymentMethod === 'udhaar' ? (
              <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-xs font-semibold text-center mt-2">
                Marked as Udhaar (Credit) - Balance Outstanding: {formatCurrency(sale.totalAmount, currency)}
              </div>
            ) : (
              <div className="flex justify-between text-xs text-gray-600">
                <span>Amount Paid:</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(sale.paidAmount || sale.totalAmount, currency)}</span>
              </div>
            )}
          </div>

          {/* Owner Net Profit Peek (Toggleable) */}
          {showProfitOnReceipt && (
            <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <span className="font-medium">Owner Net Profit for Sale:</span>
              <span className="font-extrabold text-emerald-700 text-sm">+{formatCurrency(sale.netProfit, currency)}</span>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 text-[11px] text-gray-500 border-t border-dashed border-gray-300 mt-3">
            <p>Thank you for shopping with us!</p>
            <p className="text-[10px] mt-0.5">Please retain this receipt for warranty and returns.</p>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showProfitOnReceipt}
              onChange={(e) => setShowProfitOnReceipt(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-emerald-500 focus:ring-0"
            />
            <span>Show Net Profit in Receipt (Owner Peek)</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs transition-all shadow-glow-green"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
