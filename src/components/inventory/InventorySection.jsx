import React, { useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ShieldAlert,
  ArrowUpDown,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  Download,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { exportInventoryToCSV } from '../../services/exportService.js';
import { formatCurrency } from '../../utils/formatters.js';

export const InventorySection = () => {
  const products = useInventoryStore((state) => state.products);
  const selectedCategory = useInventoryStore((state) => state.selectedCategory);
  const setSelectedCategory = useInventoryStore((state) => state.setSelectedCategory);
  const searchQuery = useInventoryStore((state) => state.searchQuery);
  const setSearchQuery = useInventoryStore((state) => state.setSearchQuery);
  const stockFilter = useInventoryStore((state) => state.stockFilter);
  const setStockFilter = useInventoryStore((state) => state.setStockFilter);
  const sortBy = useInventoryStore((state) => state.sortBy);
  const sortOrder = useInventoryStore((state) => state.sortOrder);
  const setSort = useInventoryStore((state) => state.setSort);
  const adjustStock = useInventoryStore((state) => state.adjustStock);
  const deleteProduct = useInventoryStore((state) => state.deleteProduct);

  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);

  // Compute categories safely with useMemo
  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Compute filtered & sorted products with useMemo
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

  // Compute valuation safely with useMemo
  const valuation = useMemo(() => {
    const totalCostValue = (products || []).reduce((acc, p) => acc + ((p.costPrice || 0) * (p.stock || 0)), 0);
    const totalRetailValue = (products || []).reduce((acc, p) => acc + ((p.sellingPrice || 0) * (p.stock || 0)), 0);
    const projectedProfit = totalRetailValue - totalCostValue;
    return { totalCostValue, totalRetailValue, projectedProfit };
  }, [products]);

  const lowStockCount = useMemo(() => {
    return (products || []).filter((p) => p.stock > 0 && p.stock <= (p.minThreshold || 5)).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return (products || []).filter((p) => p.stock <= 0).length;
  }, [products]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      deleteProduct(id);
      showToast(`Deleted ${name}`, 'info');
    }
  };

  return (
    <section id="inventory-section" className="scroll-mt-24 space-y-5">
      {/* Header & Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Stock & Inventory Hub
              </h2>
              <p className="text-xs text-gray-400">
                Track stock quantities, cost basis, and pocketed profit margins in real time
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => exportInventoryToCSV(products)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all"
            title="Download Inventory CSV"
          >
            <Download className="w-4 h-4 text-gray-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openModal('product_form')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-black text-xs shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 text-gray-950 stroke-[3]" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Valuation & Stock Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Catalog Size</span>
          <p className="text-lg sm:text-xl font-black text-white">{products.length} Products</p>
          <p className="text-[10px] text-gray-500">{categories.length - 1} Categories Active</p>
        </div>

        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cost Invested</span>
          <p className="text-lg sm:text-xl font-black text-rose-300 font-mono">{formatCurrency(valuation.totalCostValue, currency)}</p>
          <p className="text-[10px] text-gray-500">Inventory cost basis</p>
        </div>

        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Retail Value</span>
          <p className="text-lg sm:text-xl font-black text-cyan-300 font-mono">{formatCurrency(valuation.totalRetailValue, currency)}</p>
          <p className="text-[10px] text-gray-500">Expected sales realization</p>
        </div>

        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-1 bg-gradient-to-br from-emerald-950/30 to-transparent">
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Projected Profit</span>
          <p className="text-lg sm:text-xl font-black text-emerald-400 text-glow-green font-mono">+{formatCurrency(valuation.projectedProfit, currency)}</p>
          <p className="text-[10px] text-emerald-400/80">Unrealized profit margin</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by product name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-900/90 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Stock Level Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            {[
              { id: 'all', label: `All (${products.length})` },
              { id: 'in_stock', label: 'In Stock' },
              { id: 'low', label: `Low (${lowStockCount})`, alert: lowStockCount > 0 },
              { id: 'out', label: `Out (${outOfStockCount})`, danger: outOfStockCount > 0 },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStockFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  stockFilter === f.id
                    ? f.danger
                      ? 'bg-rose-500 text-white shadow-sm'
                      : f.alert
                      ? 'bg-amber-500 text-gray-950 shadow-sm'
                      : 'bg-emerald-500 text-gray-950 shadow-sm'
                    : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSort(e.target.value)}
              className="w-full md:w-auto px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none font-medium"
            >
              <option value="updatedAt">Sort: Recently Updated</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="stock">Sort: Stock Level</option>
              <option value="profit">Sort: Unit Profit (₹)</option>
              <option value="margin">Sort: Profit Margin (%)</option>
              <option value="sellingPrice">Sort: Selling Price</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredProducts.map((product) => {
          const inStock = product.stock > 0;
          const isLow = inStock && product.stock <= (product.minThreshold || 5);
          const unitProfit = product.sellingPrice - product.costPrice;
          const margin = product.sellingPrice > 0 ? ((unitProfit / product.sellingPrice) * 100).toFixed(0) : 0;

          return (
            <div
              key={product.id || product.sku}
              className={`glass-panel p-4 rounded-2xl border flex flex-col justify-between transition-all group ${
                !inStock
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : isLow
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-white/10 hover:border-emerald-500/40 shadow-sm'
              }`}
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5">
                    {product.sku}
                  </span>
                  <Badge
                    variant={!inStock ? 'danger' : isLow ? 'warning' : 'success'}
                    size="sm"
                  >
                    {!inStock ? 'Out of Stock' : isLow ? `Low (${product.stock} ${product.unit})` : `${product.stock} ${product.unit}`}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-white mt-2 group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-[11px] text-gray-400">{product.category || 'General'}</p>
              </div>

              {/* Price & Profit Breakdown */}
              <div className="my-3 py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Cost:</span>
                  <span className="font-semibold text-rose-300 font-mono">{formatCurrency(product.costPrice, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Retail Price:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(product.sellingPrice, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-white/5">
                  <span>Pocket Margin:</span>
                  <span className="text-glow-green font-mono">+{formatCurrency(unitProfit, currency)} ({margin}%)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                {/* Quick Stock Controls */}
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => adjustStock(product.id, -1)}
                    disabled={product.stock <= 0}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                    title="Quick -1 Stock"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black text-white px-2 font-mono">{product.stock}</span>
                  <button
                    onClick={() => adjustStock(product.id, 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-emerald-500/20 flex items-center justify-center text-gray-300 hover:text-emerald-400 active:scale-95 transition-all"
                    title="Quick +1 Stock"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openModal('stock_adjust', product)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-[11px] font-bold text-gray-300 hover:text-white transition-all"
                  >
                    Restock
                  </button>
                  <button
                    onClick={() => openModal('product_form', product)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    title="Edit Product"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition-all"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 space-y-3 glass-panel rounded-2xl border border-white/5">
            <Package className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-white">No products found</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No inventory products match your current search query or active stock filter.
            </p>
            <button
              onClick={() => openModal('product_form')}
              className="px-4 py-2 bg-emerald-500 text-gray-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-all"
            >
              + Add New Product
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
