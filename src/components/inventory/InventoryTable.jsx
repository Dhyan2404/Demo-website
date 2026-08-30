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

  const products = useInventoryStore((state) => state.products);
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

  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));

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
        aVal = a.sellingPrice - a.costPrice;
        bVal = b.sellingPrice - b.costPrice;
      } else if (sortBy === 'margin') {
        aVal = a.sellingPrice > 0 ? ((a.sellingPrice - a.costPrice) / a.sellingPrice) : 0;
        bVal = b.sellingPrice > 0 ? ((b.sellingPrice - b.costPrice) / b.sellingPrice) : 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy, sortOrder]);

  const { totalCostValue, totalRetailValue, projectedProfit } = useMemo(() => {
    const totalCostValue = (products || []).reduce((acc, p) => acc + ((p.costPrice || 0) * (p.stock || 0)), 0);
    const totalRetailValue = (products || []).reduce((acc, p) => acc + ((p.sellingPrice || 0) * (p.stock || 0)), 0);
    const projectedProfit = totalRetailValue - totalCostValue;
    return { totalCostValue, totalRetailValue, projectedProfit };
  }, [products]);

  const handleDelete = (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteProduct(product.id || product._id);
      showToast(`Deleted ${product.name}`, 'info');
    }
  };

  return (
    <section id="inventory-section" className="space-y-6 pt-4">
      {/* Header & Valuation Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Inventory & Stock Control</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time stock balance, automated low-stock warnings, cost basis & per-item margins
          </p>
        </div>

        {/* Valuation metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl glass-panel border border-white/10 text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Cost Valuation</span>
            <span className="font-bold text-white text-sm">{formatCurrency(totalCostValue, currency)}</span>
          </div>

          <div className="px-4 py-2 rounded-xl glass-panel border border-white/10 text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Retail Valuation</span>
            <span className="font-bold text-cyan-400 text-sm">{formatCurrency(totalRetailValue, currency)}</span>
          </div>

          <div className="px-4 py-2 rounded-xl glass-panel border border-white/10 text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Projected Profit</span>
            <span className="font-bold text-emerald-400 text-sm">+{formatCurrency(projectedProfit, currency)}</span>
          </div>

          <button
            onClick={() => exportInventoryToCSV(products)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/[0.04] hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 transition-all"
            title="Download CSV Report"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => openModal('product_form')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold rounded-xl text-xs shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, SKU or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Stock Status Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Items', count: products.length },
              { id: 'in_stock', label: 'In Stock', count: products.filter(p => p.stock > (p.minThreshold || 5)).length },
              { id: 'low', label: 'Low Stock', count: products.filter(p => p.stock > 0 && p.stock <= (p.minThreshold || 5)).length },
              { id: 'out', label: 'Out of Stock', count: products.filter(p => p.stock <= 0).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStockFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  stockFilter === tab.id
                    ? 'bg-emerald-500 text-gray-950 shadow-sm'
                    : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 custom-scrollbar">
          <span className="text-xs font-semibold text-gray-500 pr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/[0.02] text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <th onClick={() => setSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1.5">
                    <span>Product & SKU</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Category</th>
                <th onClick={() => setSort('costPrice')} className="py-3.5 px-4 cursor-pointer hover:text-white text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Cost Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => setSort('sellingPrice')} className="py-3.5 px-4 cursor-pointer hover:text-white text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => setSort('profit')} className="py-3.5 px-4 cursor-pointer hover:text-white text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Profit / Margin</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => setSort('stock')} className="py-3.5 px-4 cursor-pointer hover:text-white text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Live Stock</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Quick Adjust</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredProducts.map((p) => {
                const profit = p.sellingPrice - p.costPrice;
                const margin = p.sellingPrice > 0 ? ((profit / p.sellingPrice) * 100).toFixed(1) : 0;
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= (p.minThreshold || 5);

                return (
                  <tr key={p.id || p.sku} className="hover:bg-white/[0.02] transition-colors group">
                    
                    {/* Product Name & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {p.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-gray-500">
                        <span>{p.sku}</span>
                        {p.notes && <span>• {p.notes}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-gray-300">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-[11px]">
                        {p.category || 'General'}
                      </span>
                    </td>

                    {/* Cost Price */}
                    <td className="py-3.5 px-4 text-right font-mono text-gray-400">
                      {formatCurrency(p.costPrice, currency)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatCurrency(p.sellingPrice, currency)}
                    </td>

                    {/* Profit per Unit & Margin % */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-emerald-400 font-mono">
                        +{formatCurrency(profit, currency)}
                      </span>
                      <span className="block text-[10px] text-gray-400 font-medium">
                        {margin}% margin
                      </span>
                    </td>

                    {/* Live Stock Level & Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-extrabold font-mono text-sm text-white">
                          {p.stock} <span className="text-[11px] font-normal text-gray-400">{p.unit}</span>
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
                      <div className="inline-flex items-center gap-1 bg-gray-900 border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => adjustStock(p.id, -1)}
                          disabled={p.stock <= 0}
                          className="px-2 py-1 hover:bg-white/10 text-gray-400 hover:text-white rounded disabled:opacity-30 transition-colors"
                          title="Decrease Stock (-1)"
                        >
                          -
                        </button>
                        <button
                          onClick={() => openModal('stock_adjust', p)}
                          className="px-2 py-1 text-[11px] font-mono text-gray-300 hover:text-white"
                          title="Custom stock adjustment"
                        >
                          ±
                        </button>
                        <button
                          onClick={() => adjustStock(p.id, 1)}
                          className="px-2 py-1 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 rounded transition-colors"
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
                          className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No products found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
