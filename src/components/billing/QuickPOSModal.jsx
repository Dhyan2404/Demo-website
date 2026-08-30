import React, { useState } from 'react';
import { Search, Plus, Package, ScanLine, ShoppingCart, Check } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { CartDrawer } from './CartDrawer.jsx';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const QuickPOSModal = ({ isOpen, onClose, onCheckoutSuccess }) => {
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const products = useInventoryStore((state) => state.products);
  const categories = useInventoryStore((state) => state.getCategories());
  const addToCart = useSalesStore((state) => state.addToCart);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick POS & Sales Entry"
      subtitle="Select or search items to create an instant invoice with real-time profit tracking"
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Columns: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search bar & barcode simulation */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by name or SKU / Barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400" title="Barcode Scanner Ready">
              <ScanLine className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredProducts.map((p) => {
              const profit = p.sellingPrice - p.costPrice;
              const isOutOfStock = p.stock <= 0;
              const isLowStock = p.stock > 0 && p.stock <= p.minThreshold;

              return (
                <div
                  key={p.id || p.sku}
                  onClick={() => !isOutOfStock && addToCart(p, 1)}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between select-none ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed bg-gray-900/40 border-gray-800'
                      : 'cursor-pointer glass-card glass-card-hover bg-white/[0.02] border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-bold text-white leading-tight line-clamp-2">{p.name}</p>
                      <span className="text-[10px] font-mono text-gray-400 uppercase bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                        {p.sku}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          {p.stock} {p.unit} left
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {p.stock} in stock
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">{p.category}</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-3 pt-2.5 border-t border-white/[0.06]">
                    <div>
                      <p className="text-sm font-extrabold text-white">
                        {formatCurrency(p.sellingPrice, currency)}
                      </p>
                      <p className="text-[10px] font-semibold text-emerald-400">
                        +{formatCurrency(profit, currency)} profit ({(((p.sellingPrice - p.costPrice)/p.sellingPrice)*100).toFixed(0)}%)
                      </p>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold transition-all"
                      title="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 text-xs">
                No products found matching your filters.
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Cart & Checkout Drawer */}
        <div className="lg:col-span-5 glass-panel p-4 rounded-2xl border border-white/10 bg-gray-950/60">
          <CartDrawer
            onCheckoutSuccess={(sale) => {
              onClose();
              if (onCheckoutSuccess) onCheckoutSuccess(sale);
            }}
          />
        </div>

      </div>
    </Modal>
  );
};
