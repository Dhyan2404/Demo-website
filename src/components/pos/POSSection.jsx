import React from 'react';
import { ShoppingBag, Plus, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const POSSection = () => {
  const openModal = useThemeStore((state) => state.openModal);
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const products = useInventoryStore((state) => state.products);
  const addToCart = useSalesStore((state) => state.addToCart);

  // Top 4 quick-pick items
  const popularProducts = products.slice(0, 4);

  return (
    <section id="pos-section" className="scroll-mt-24 space-y-4">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-emerald-950/20 to-gray-900/80 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Express Billing Counter</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Quick POS & Sales Entry
            </h2>
            <p className="text-sm text-gray-300 max-w-xl">
              Record walk-in retail sales, calculate live gross margins, collect UPI/Cash, or record customer Udhaar ledger credits in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal('pos')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-extrabold text-sm shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5 text-gray-950 stroke-[3]" />
              <span>Open Full POS Terminal</span>
            </button>
          </div>
        </div>

        {/* Quick-Pick Strip */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Quick Add Popular Items to New Sale
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {popularProducts.map((product) => {
              const inStock = product.stock > 0;
              const profit = product.sellingPrice - product.costPrice;
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    if (inStock) {
                      addToCart(product, 1);
                      openModal('pos');
                    }
                  }}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all select-none ${
                    inStock
                      ? 'bg-white/[0.03] hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/30 cursor-pointer active:scale-95'
                      : 'bg-gray-900/30 border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.sku}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">
                        {formatCurrency(product.sellingPrice, currency)}
                      </p>
                      <p className="text-[10px] text-emerald-400">
                        +{formatCurrency(profit, currency)} margin
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
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
