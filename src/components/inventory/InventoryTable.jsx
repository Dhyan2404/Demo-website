import React, { useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Edit2,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency, formatPercentage } from '../../utils/formatters.js';
import { exportInventoryToCSV } from '../../services/exportService.js';

export const InventoryTable = () => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);

  const products = useInventoryStore((state) => state.products || []);
  const searchQuery = useInventoryStore((state) => state.searchQuery);
  const setSearchQuery = useInventoryStore((state) => state.setSearchQuery);
  const selectedCategory = useInventoryStore((state) => state.selectedCategory);
  const setSelectedCategory = useInventoryStore((state) => state.setSelectedCategory);
  const stockFilter = useInventoryStore((state) => state.stockFilter);
  const setStockFilter = useInventoryStore((state) => state.setStockFilter);
  const sortBy = useInventoryStore((state) => state.sortBy);
  const sortOrder = useInventoryStore((state) => state.sortOrder);
  const setSort = useInventoryStore((state) => state.setSort);
  const adjustStock = useInventoryStore((state) => state.adjustStock);
  const deleteProduct = useInventoryStore((state) => state.deleteProduct);

  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 20;

  // Reset to page 1 on filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, stockFilter, sortBy, sortOrder]);

  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch =
        !q ||
        product.name?.toLowerCase().includes(q) ||
        product.sku?.toLowerCase().includes(q) ||
        (product.category && product.category.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = product.stock > 0 && product.stock <= (product.minThreshold || 5);
      } else if (stockFilter === 'out') {
        matchesStock = product.stock <= 0;
      } else if (stockFilter === 'in_stock') {
        matchesStock = product.stock > 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    }).sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'profit') {
        aVal = (a.sellingPrice || 0) - (a.costPrice || 0);
        bVal = (b.sellingPrice || 0) - (b.costPrice || 0);
      } else if (sortBy === 'margin') {
        aVal = a.sellingPrice > 0 ? (((a.sellingPrice - a.costPrice) / a.sellingPrice)) : 0;
        bVal = b.sellingPrice > 0 ? (((b.sellingPrice - b.costPrice) / b.sellingPrice)) : 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, safePage, pageSize]);

  const { totalCostValue, totalRetailValue, projectedProfit } = useMemo(() => {
    const costVal = (products || []).reduce((acc, p) => acc + ((Number(p.costPrice) || 0) * (Number(p.stock) || 0)), 0);
    const retailVal = (products || []).reduce((acc, p) => acc + ((Number(p.sellingPrice) || 0) * (Number(p.stock) || 0)), 0);
    const profit = retailVal - costVal;
    return { totalCostValue: costVal, totalRetailValue: retailVal, projectedProfit: profit };
  }, [products]);

  const handleDelete = (product) => {
    deleteProduct(product.id || product._id);
    showToast(`Deleted ${product.name} from inventory`, 'info');
  };

  return (
    <section id="inventory-section" className="space-y-6 pt-4">
      {/* Header & Valuation Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 dark:bg-emerald-500/10 border border-amber-500/30 dark:border-emerald-500/30 text-amber-700 dark:text-emerald-400">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Inventory & Stock Control</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Real-time stock balance, automated low-stock warnings, cost basis & per-item margins
          </p>
        </div>

        {/* Valuation metrics with golden accents */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 text-xs">
            <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Cost Valuation</span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">{formatCurrency(totalCostValue, currency)}</span>
          </div>

          <div className="px-4 py-2 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 text-xs">
            <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase font-bold">Retail Valuation</span>
            <span className="font-extrabold text-amber-700 dark:text-cyan-400 text-sm font-mono">{formatCurrency(totalRetailValue, currency)}</span>
          </div>

          <div className="px-4 py-2 rounded-2xl glass-panel border border-amber-500/30 dark:border-white/10 text-xs">
            <span className="text-amber-800 dark:text-gray-400 block text-[10px] uppercase font-bold">Projected Profit</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm font-mono">+{formatCurrency(projectedProfit, currency)}</span>
          </div>

          <button
            onClick={() => exportInventoryToCSV(products)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-700 dark:text-gray-300 transition-all cursor-pointer"
            title="Download CSV Report"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => openModal('product_form')}
            className="btn-shimmer flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, SKU or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Stock Status Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            {[
              { id: 'all', label: 'All Items', count: (products || []).length },
              { id: 'in_stock', label: 'In Stock', count: (products || []).filter(p => p.stock > (p.minThreshold || 5)).length },
              { id: 'low', label: 'Low Stock', count: (products || []).filter(p => p.stock > 0 && p.stock <= (p.minThreshold || 5)).length },
              { id: 'out', label: 'Out of Stock', count: (products || []).filter(p => p.stock <= 0).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStockFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  stockFilter === tab.id
                    ? 'bg-amber-500 dark:bg-emerald-500 text-slate-950 shadow-sm font-black'
                    : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 custom-scrollbar">
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 pr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 dark:bg-cyan-500/20 text-amber-900 dark:text-cyan-300 border border-amber-500/40 dark:border-cyan-500/40 font-black'
                  : 'bg-slate-100 dark:bg-white/[0.02] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-400">
                <th onClick={() => setSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                  <div className="flex items-center gap-1.5">
                    <span>Product & SKU</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Category</th>
                <th onClick={() => setSort('costPrice')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Cost Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => setSort('sellingPrice')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => setSort('profit')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Profit / Margin</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => setSort('stock')} className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Live Stock</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Quick Adjust</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.04] text-xs">
              {paginatedProducts.map((p) => {
                const sellP = Number(p.sellingPrice) || 0;
                const costP = Number(p.costPrice) || 0;
                const profit = sellP - costP;
                const margin = sellP > 0 ? ((profit / sellP) * 100).toFixed(1) : 0;
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= (p.minThreshold || 5);

                return (
                  <tr key={p.id || p._id || p.sku} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    
                    {/* Product Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-emerald-300 transition-colors">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-slate-500 dark:text-gray-400">
                        <span>{p.sku}</span>
                        {p.notes && <span>• {p.notes}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-gray-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5 text-[11px] font-medium">
                        {p.category || 'General'}
                      </span>
                    </td>

                    {/* Cost Price */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-gray-400 font-medium">
                      {formatCurrency(costP, currency)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                      {formatCurrency(sellP, currency)}
                    </td>

                    {/* Profit per Unit & Margin % */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                        +{formatCurrency(profit, currency)}
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-gray-400 font-bold">
                        {margin}% margin
                      </span>
                    </td>

                    {/* Live Stock Level & Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black font-mono text-sm text-slate-900 dark:text-white">
                          {p.stock} <span className="text-[11px] font-normal text-slate-500 dark:text-gray-400">{p.unit}</span>
                        </span>
                        {isOutOfStock ? (
                          <Badge variant="danger" size="sm">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" size="sm">Low Stock</Badge>
                        ) : (
                          <Badge variant="success" size="sm">In Stock</Badge>
                        )}
                      </div>
                    </td>

                    {/* Quick Adjust (+ / -) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => adjustStock(p.id || p._id, -1)}
                          disabled={p.stock <= 0}
                          className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded disabled:opacity-30 transition-colors cursor-pointer"
                          title="Decrease Stock (-1)"
                        >
                          -
                        </button>
                        <button
                          onClick={() => openModal('stock_adjust', p)}
                          className="px-2 py-1 text-[11px] font-mono font-bold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          title="Custom stock adjustment"
                        >
                          ±
                        </button>
                        <button
                          onClick={() => adjustStock(p.id || p._id, 1)}
                          className="px-2 py-1 hover:bg-slate-200 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                          title="Increase Stock (+1)"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal('product_form', p)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-gray-400">
                    No products found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredProducts.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 dark:text-gray-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(safePage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">{Math.min(safePage * pageSize, filteredProducts.length)}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span> products
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-1 px-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{safePage}</span>
                <span className="text-slate-400 dark:text-gray-600">/</span>
                <span className="text-slate-600 dark:text-gray-400">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
