import React, { useState, useEffect } from 'react';
import { Search, Package, Users, Receipt, ArrowRight } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const QuickSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const openModal = useThemeStore((state) => state.openModal);

  const products = useInventoryStore((state) => state.products);
  const customers = useCustomerStore((state) => state.customers);
  const sales = useSalesStore((state) => state.sales);

  const q = query.trim().toLowerCase();

  const matchedProducts = q
    ? products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchedCustomers = q
    ? customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 4)
    : [];

  const matchedSales = q
    ? sales.filter(s => s.invoiceNo.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q)).slice(0, 4)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Quick Search" subtitle="Press ESC or click outside to exit" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Search input bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, customers, or invoice #..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-11 pr-4 py-3 bg-gray-900/90 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm"
          />
        </div>

        {/* Results section */}
        {q && (
          <div className="space-y-4 pt-2">
            {/* Products */}
            {matchedProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-emerald-400 mb-2">
                  <Package className="w-3.5 h-3.5" />
                  <span>Products ({matchedProducts.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedProducts.map(p => (
                    <div
                      key={p.id || p.sku}
                      onClick={() => {
                        onClose();
                        openModal('product_form', p);
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: {p.sku} | Stock: {p.stock} {p.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-400">{formatCurrency(p.sellingPrice, currency)}</p>
                        <p className="text-xs text-gray-500">Margin: {(((p.sellingPrice - p.costPrice)/p.sellingPrice)*100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customers */}
            {matchedCustomers.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-cyan-400 mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>Customers ({matchedCustomers.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedCustomers.map(c => (
                    <div
                      key={c.id || c.phone}
                      onClick={() => {
                        onClose();
                        openModal('customer_detail', c);
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.currentBalance > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {c.currentBalance > 0 ? `Udhaar: ${formatCurrency(c.currentBalance, currency)}` : 'Settled'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sales */}
            {matchedSales.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-purple-400 mb-2">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoices ({matchedSales.length})</span>
                </div>
                <div className="space-y-1.5">
                  {matchedSales.map(s => (
                    <div
                      key={s.id || s.invoiceNo}
                      onClick={() => {
                        onClose();
                        openModal('receipt', s);
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{s.invoiceNo}</p>
                        <p className="text-xs text-gray-400">{s.customerName} • {formatDate(s.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-purple-300">{formatCurrency(s.totalAmount, currency)}</p>
                        <p className="text-xs text-emerald-400">Profit: +{formatCurrency(s.netProfit, currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchedProducts.length === 0 && matchedCustomers.length === 0 && matchedSales.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">
                No matching products, customers, or invoices found for "{query}".
              </div>
            )}
          </div>
        )}

        {!q && (
          <div className="py-6 text-center text-xs text-gray-500">
            Type anything above to quickly search catalog items, customer Udhaar accounts, or historical invoice numbers.
          </div>
        )}
      </div>
    </Modal>
  );
};
