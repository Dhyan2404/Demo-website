import React, { useState, useMemo } from 'react';
import { FileText, Printer, Download, X, CheckCircle2, Building, Calendar, DollarSign } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';
import { computeTopProducts } from '../../utils/calculations.js';

export const BusinessAuditModal = ({ isOpen, onClose }) => {
  const sales = useSalesStore((state) => state.sales);
  const products = useInventoryStore((state) => state.products);
  const customers = useCustomerStore((state) => state.customers);
  const settings = useThemeStore((state) => state.settings);
  const currency = settings?.currencySymbol || '₹';

  const [auditPeriod, setAuditPeriod] = useState('today'); // 'today' | 'month' | 'all'

  const auditData = useMemo(() => {
    const now = new Date();
    let filteredSales = sales || [];

    if (auditPeriod === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      filteredSales = (sales || []).filter((s) => new Date(s.createdAt || s.date).getTime() >= todayStart);
    } else if (auditPeriod === 'month') {
      filteredSales = (sales || []).filter((s) => {
        const d = new Date(s.createdAt || s.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    }

    let grossSales = 0;
    let netProfit = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    const paymentBreakdown = { cash: 0, upi: 0, card: 0, udhaar: 0 };

    filteredSales.forEach((s) => {
      grossSales += Number(s.totalAmount) || 0;
      netProfit += Number(s.netProfit) || (Number(s.totalAmount) || 0) - (Number(s.totalCost) || 0);
      totalTax += Number(s.taxAmount) || 0;
      totalDiscount += Number(s.discountAmount) || 0;
      const m = (s.paymentMethod || 'cash').toLowerCase();
      if (paymentBreakdown[m] !== undefined) {
        paymentBreakdown[m] += Number(s.totalAmount) || 0;
      } else {
        paymentBreakdown.cash += Number(s.totalAmount) || 0;
      }
    });

    const totalInventoryValue = (products || []).reduce(
      (acc, p) => acc + (Number(p.costPrice) || 0) * (Number(p.stock) || 0),
      0
    );

    const totalPendingUdhaar = (customers || []).reduce(
      (acc, c) => acc + (Number(c.currentBalance) || 0),
      0
    );

    const { topProfitable, topSold } = computeTopProducts(filteredSales, products);

    return {
      billCount: filteredSales.length,
      grossSales,
      netProfit,
      totalTax,
      totalDiscount,
      paymentBreakdown,
      totalInventoryValue,
      totalPendingUdhaar,
      topProfitable,
      topSold,
      generatedAt: new Date().toLocaleString('en-IN'),
    };
  }, [sales, products, customers, auditPeriod]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-extrabold text-base">Store Business Audit & Reconciliation Report</h3>
              <p className="text-xs text-gray-400">Formal financial statement and cash closure</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Audit Scope:</span>
            {[
              { id: 'today', label: "Today's Close (EOD)" },
              { id: 'month', label: 'Current Month' },
              { id: 'all', label: 'All-Time Financials' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setAuditPeriod(p.id)}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  auditPeriod === p.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Generated: {auditData.generatedAt}</span>
        </div>

        {/* Audit Printable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 printable-area">
          {/* Shop Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">{settings?.storeName || 'KIRANA STORE'}</h2>
              <p className="text-xs text-slate-600">{settings?.storeAddress || 'Main Market Road'}</p>
              <p className="text-xs text-slate-600">GSTIN: {settings?.gstNumber || '27AAAAA0000A1Z5'}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 bg-slate-100 rounded border border-slate-300">
                AUDIT STATEMENT
              </span>
              <p className="text-xs text-slate-500 mt-1.5">Invoices Count: {auditData.billCount}</p>
            </div>
          </div>

          {/* Key Financial Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Gross Sales</span>
              <p className="text-base font-black text-slate-900 font-mono mt-0.5">
                {formatCurrency(auditData.grossSales, currency)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Net Realized Profit</span>
              <p className="text-base font-black text-emerald-700 font-mono mt-0.5">
                +{formatCurrency(auditData.netProfit, currency)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total GST / Tax</span>
              <p className="text-base font-black text-slate-900 font-mono mt-0.5">
                {formatCurrency(auditData.totalTax, currency)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Discounts Given</span>
              <p className="text-base font-black text-slate-900 font-mono mt-0.5">
                {formatCurrency(auditData.totalDiscount, currency)}
              </p>
            </div>
          </div>

          {/* Payment Mode Reconciliations */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Cash Drawer & Payment Settlement Reconciliation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 font-medium block">Physical Cash In Drawer:</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  {formatCurrency(auditData.paymentBreakdown.cash, currency)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 font-medium block">UPI / QR Bank Credits:</span>
                <span className="font-bold text-cyan-700 font-mono text-sm">
                  {formatCurrency(auditData.paymentBreakdown.upi, currency)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 font-medium block">Card POS Settlement:</span>
                <span className="font-bold text-purple-700 font-mono text-sm">
                  {formatCurrency(auditData.paymentBreakdown.card, currency)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 font-medium block">Udhaar Extended:</span>
                <span className="font-bold text-amber-700 font-mono text-sm">
                  {formatCurrency(auditData.paymentBreakdown.udhaar, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Balance Sheet Highlights */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold block">Current Stock Valuation (Cost basis)</span>
              <p className="font-black text-slate-900 text-sm font-mono mt-0.5">
                {formatCurrency(auditData.totalInventoryValue, currency)}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">Total Pending Market Udhaar (Receivables)</span>
              <p className="font-black text-amber-700 text-sm font-mono mt-0.5">
                {formatCurrency(auditData.totalPendingUdhaar, currency)}
              </p>
            </div>
          </div>

          {/* Signoff */}
          <div className="pt-8 border-t border-slate-300 flex justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Cashier Signature</p>
              <div className="w-36 border-b border-slate-400 mt-6" />
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Store Manager / Owner Verification</p>
              <div className="w-48 border-b border-slate-400 mt-6 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
