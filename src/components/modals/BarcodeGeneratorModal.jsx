import React, { useState, useMemo, useRef } from 'react';
import {
  Scan,
  Printer,
  QrCode,
  Package,
  Copy,
  CheckCircle2,
  Download,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const BarcodeGeneratorModal = ({ isOpen, onClose }) => {
  const products = useInventoryStore((state) => state.products || []);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const showToast = useThemeStore((state) => state.showToast);

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [customSKU, setCustomSKU] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [labelCopies, setLabelCopies] = useState(6);

  const activeProduct = useMemo(() => {
    if (selectedProductId === 'custom') {
      return {
        name: customName || 'Custom Retail Item',
        sku: (customSKU || 'SKU-9999').toUpperCase(),
        sellingPrice: Number(customPrice) || 0,
      };
    }
    return products.find((p) => (p.id === selectedProductId || p._id === selectedProductId)) || products[0] || {
      name: 'Retail Product',
      sku: 'SKU-1001',
      sellingPrice: 199,
    };
  }, [products, selectedProductId, customName, customSKU, customPrice]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  // Generate pseudo-random barcode line heights for visual realism
  const generateBarcodeLines = (seed = '1001') => {
    const chars = seed.split('');
    return Array.from({ length: 48 }).map((_, i) => {
      const charCode = chars[i % chars.length]?.charCodeAt(0) || 65;
      const width = ((charCode + i) % 3) + 1.5;
      const isSpace = (i % 7 === 0);
      return { width, isSpace };
    });
  };

  const barcodeBars = generateBarcodeLines(activeProduct.sku || 'SKU');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode & Price Sticker Generator"
      subtitle="Generate and print physical adhesive barcode tags for store shelves and products"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Product Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Select Inventory Product:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              {(products || []).map((p) => (
                <option key={p.id || p._id || p.sku} value={p.id || p._id}>
                  {p.name} ({p.sku}) - {formatCurrency(p.sellingPrice, currency)}
                </option>
              ))}
              <option value="custom">+ Custom Barcode / Manual Entry</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Stickers to Print:</label>
            <div className="flex items-center gap-1">
              {[2, 6, 12, 24].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setLabelCopies(count)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    labelCopies === count
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {count}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Input Fields if custom selected */}
        {selectedProductId === 'custom' && (
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-gray-900/60 border border-slate-200 dark:border-white/10">
            <input
              type="text"
              placeholder="Item Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-950 border border-slate-300 dark:border-white/15 rounded-xl text-xs"
            />
            <input
              type="text"
              placeholder="SKU Code"
              value={customSKU}
              onChange={(e) => setCustomSKU(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-950 border border-slate-300 dark:border-white/15 rounded-xl text-xs font-mono uppercase"
            />
            <input
              type="text"
              placeholder="Price"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value.replace(/[^0-9.]/g, ''))}
              className="px-3 py-2 bg-white dark:bg-gray-950 border border-slate-300 dark:border-white/15 rounded-xl text-xs font-mono font-bold"
            />
          </div>
        )}

        {/* Printable Labels Sheet Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-gray-400 font-semibold">
            <span>Sticker Sheet Preview (Thermal / A4 compatible):</span>
            <span className="text-[11px] font-mono font-bold">{labelCopies} labels generated</span>
          </div>

          <div className="printable-receipt-area p-4 sm:p-6 bg-slate-200/60 dark:bg-gray-900/80 rounded-2xl border border-slate-300 dark:border-white/10 max-h-72 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: labelCopies }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white text-gray-950 p-3 rounded-xl border border-gray-300 shadow-sm flex flex-col justify-between items-center text-center font-sans space-y-1.5"
                >
                  <div className="w-full">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block truncate">
                      {shopName}
                    </span>
                    <p className="text-xs font-black text-gray-950 truncate leading-tight mt-0.5">
                      {activeProduct.name}
                    </p>
                  </div>

                  {/* High Resolution CSS Barcode Graphic */}
                  <div className="w-full flex items-center justify-center gap-[2px] h-8 bg-gray-50 px-2 py-1 rounded">
                    {barcodeBars.map((bar, bIdx) => (
                      <div
                        key={bIdx}
                        style={{
                          width: `${bar.width}px`,
                          backgroundColor: bar.isSpace ? 'transparent' : '#000000',
                          height: '100%',
                        }}
                      />
                    ))}
                  </div>

                  <div className="w-full flex items-center justify-between font-mono pt-1 border-t border-dashed border-gray-300 text-[10px]">
                    <span className="font-semibold text-gray-600 tracking-wider">
                      {activeProduct.sku}
                    </span>
                    <span className="font-extrabold text-xs text-gray-950">
                      {formatCurrency(activeProduct.sellingPrice, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 text-slate-700 dark:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-shimmer px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-glow-gold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Print {labelCopies} Adhesive Stickers</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
