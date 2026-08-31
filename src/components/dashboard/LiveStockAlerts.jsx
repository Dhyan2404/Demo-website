import React, { useMemo } from 'react';
import { ShieldAlert, AlertTriangle, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useScrollStore } from '../../store/useScrollStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const LiveStockAlerts = () => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);
  const setActiveSection = useScrollStore((state) => state.setActiveSection);

  const products = useInventoryStore((state) => state.products);
  const restockItem = useInventoryStore((state) => state.restockItem);

  const lowStockProducts = useMemo(() => {
    return (products || []).filter((p) => p.stock > 0 && p.stock <= (p.minThreshold || 5));
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return (products || []).filter((p) => p.stock <= 0);
  }, [products]);

  const totalCritical = lowStockProducts.length + outOfStockProducts.length;

  const handleRestock = (product, defaultQty = 15) => {
    restockItem(product.id, defaultQty);
    showToast(`Restocked ${product.name} to ${defaultQty} ${product.unit}`, 'success');
  };

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-black/[0.06] dark:border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${totalCritical > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'}`}>
            {totalCritical > 0 ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Real-Time Stock Alert Hub</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              {totalCritical > 0 ? `${totalCritical} products need attention or restock` : 'All items are currently well-stocked'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection('inventory')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>Open Full Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Out of Stock Section */}
      {outOfStockProducts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <span>Critical: Out of Stock (0 remaining)</span>
            <span>{outOfStockProducts.length} items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {outOfStockProducts.slice(0, 4).map((product) => (
              <div
                key={product.id || product.sku}
                className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                    <Badge variant="danger" size="sm">0 {product.unit}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">
                    SKU: {product.sku} • Price: {formatCurrency(product.sellingPrice, currency)}
                  </p>
                </div>

                <button
                  onClick={() => handleRestock(product, 20)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-sm active:scale-95 cursor-pointer"
                  aria-label={`Restock 20 units of ${product.name}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restock +20</span>
                </button>
              </div>
            ))}
          </div>
          {outOfStockProducts.length > 4 && (
            <div className="text-right">
              <button
                onClick={() => setActiveSection('inventory')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                + {outOfStockProducts.length - 4} more out-of-stock items in inventory &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Low Stock Section */}
      {lowStockProducts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <span>Warning: Low Stock (&le; threshold)</span>
            <span>{lowStockProducts.length} items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {lowStockProducts.slice(0, 4).map((product) => (
              <div
                key={product.id || product.sku}
                className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                    <Badge variant="warning" size="sm">
                      {product.stock} {product.unit} left
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 font-mono">
                    Min Threshold: {product.minThreshold} {product.unit} • Price: {formatCurrency(product.sellingPrice, currency)}
                  </p>
                </div>

                <button
                  onClick={() => handleRestock(product, 15)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-black text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer"
                  aria-label={`Restock 15 units of ${product.name}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restock +15</span>
                </button>
              </div>
            ))}
          </div>
          {lowStockProducts.length > 4 && (
            <div className="text-right">
              <button
                onClick={() => setActiveSection('inventory')}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                + {lowStockProducts.length - 4} more low-stock items in inventory &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State when zero alerts */}
      {totalCritical === 0 && (
        <div className="py-6 text-center text-slate-500 dark:text-gray-400 space-y-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">All inventory stock levels are healthy</p>
          <p className="text-xs text-slate-500 dark:text-gray-500">Threshold alerts will automatically trigger here as products are sold.</p>
        </div>
      )}
    </div>
  );
};
