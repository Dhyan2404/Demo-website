import React from 'react';
import { ShoppingBag, Plus, Sparkles, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const POSSection = () => {
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const products = useInventoryStore((state) => state.products);
  const addToCart = useSalesStore((state) => state.addToCart);

  // Top 4 popular quick-pick items
  const popularProducts = products.slice(0, 4);

  return (
    <section id="pos-section" className="scroll-mt-24 space-y-4">
      <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-emerald-950/20 to-gray-900/80 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Express Billing Counter</span>
              <span className="text-emerald-400 font-mono text-[11px]">• Fast POS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Instant Point-of-Sale Terminal
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
              Record walk-in retail transactions in seconds. Every item calculated with live gross margin percentage, multi-mode payments (Cash, UPI QR, Card, Udhaar credit) and instant printable receipts.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => openModal('pos')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black text-xs sm:text-sm shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Zap className="w-4 h-4 text-gray-950 stroke-[3]" />
              <span>Open Express POS Terminal</span>
            </button>
          </div>
        </div>

        {/* Quick-Pick Strip */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              1-Tap Quick Add (Top Selling Products)
            </p>
            <span className="text-[11px] text-emerald-400 font-medium">Click any item to bill instantly</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularProducts.map((product) => {
              const inStock = product.stock > 0;
              const profit = product.sellingPrice - product.costPrice;
              const margin = product.sellingPrice > 0 ? ((profit / product.sellingPrice) * 100).toFixed(0) : 0;

              return (
                <div
                  key={product.id}
                  onClick={() => {
                    if (inStock) {
                      addToCart(product, 1);
                      showToast(`Added "${product.name}" to cart!`, 'success');
                      openModal('pos');
                    }
                  }}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all select-none ${
                    inStock
                      ? 'bg-white/[0.03] hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/30 cursor-pointer active:scale-95 shadow-sm'
                      : 'bg-gray-900/30 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white line-clamp-1">{product.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.sku}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-white font-mono">
                        {formatCurrency(product.sellingPrice, currency)}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium font-mono">
                        +{formatCurrency(profit, currency)} ({margin}%)
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      + Add
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
