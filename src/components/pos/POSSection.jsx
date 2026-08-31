import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Users,
  TrendingUp,
  Zap,
  Scan,
  Percent,
  Sparkles,
  Dices,
  ArrowRight,
  RotateCcw,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerTypeaheadPicker } from './CustomerTypeaheadPicker.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { soundEffects } from '../../utils/soundEffects.js';

export const POSSection = () => {
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);

  const products = useInventoryStore((state) => state.products || []);

  const rawCart = useSalesStore((state) => state.cart || []);
  const items = Array.isArray(rawCart) ? rawCart : (rawCart?.items || []);
  const selectedCustomer = useSalesStore((state) => state.selectedCustomer);
  const paymentMethod = useSalesStore((state) => state.paymentMethod || 'cash');

  const addToCart = useSalesStore((state) => state.addToCart);
  const updateCartQty = useSalesStore((state) => state.updateCartQty);
  const removeFromCart = useSalesStore((state) => state.removeFromCart);
  const clearCart = useSalesStore((state) => state.clearCart);
  const setCartPaymentMethod = useSalesStore((state) => state.setCartPaymentMethod);
  const completeCheckout = useSalesStore((state) => state.completeCheckout);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [taxRate, setTaxRate] = useState(0); // 0% | 5% | 12% | 18%
  const [mobileTab, setMobileTab] = useState('products'); // 'products' | 'cart'
  const [visibleLimit, setVisibleLimit] = useState(30);

  // Reset visible limit on search/category change
  React.useEffect(() => {
    setVisibleLimit(30);
  }, [search, selectedCat]);

  // Compute categories safely with useMemo
  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Compute cartTotals with tax calculation
  const cartTotals = useMemo(() => {
    const subtotal = items.reduce((acc, i) => {
      const price = Number(i.customPrice ?? i.product?.sellingPrice ?? i.sellingPrice) || 0;
      const qty = Number(i.quantity) || 1;
      return acc + (price * qty);
    }, 0);

    const totalCost = items.reduce((acc, i) => {
      const cost = Number(i.product?.costPrice ?? i.costPrice) || 0;
      const qty = Number(i.quantity) || 1;
      return acc + (cost * qty);
    }, 0);

    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const totalAmount = subtotal + taxAmount;
    const estimatedProfit = subtotal - totalCost;
    const totalItems = items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);

    return { subtotal, taxAmount, totalAmount, totalCost, estimatedProfit, totalItems };
  }, [items, taxRate]);

  // Filter products for quick selection
  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) => {
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCat === 'All' || p.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCat]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleLimit);
  }, [filteredProducts, visibleLimit]);

  // Fast Barcode Scanner Form Submit
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.sku?.toLowerCase() === barcodeInput.trim().toLowerCase() ||
             p.name?.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      if (matched.stock > 0) {
        addToCart(matched, 1);
        if (soundEnabled) soundEffects.playAddToCart();
        showToast(`Scanned: ${matched.name}`, 'success');
        setBarcodeInput('');
      } else {
        showToast(`"${matched.name}" is out of stock!`, 'warning');
      }
    } else {
      showToast(`No product matches SKU "${barcodeInput}"`, 'error');
    }
  };

  const handleAddItem = (product) => {
    if (product.stock > 0) {
      addToCart(product, 1);
      if (soundEnabled) soundEffects.playAddToCart();
      showToast(`Added "${product.name}" to bill`, 'success');
    }
  };

  /**
   * 🎲 One-Click Demo Billing:
   * Selects random products from inventory, adds them to cart, finishes checkout,
   * triggers celebratory effects, and opens the printed/interactive Receipt Bill page immediately!
   */
  const handleDemoBilling = async () => {
    const available = products.filter((p) => (Number(p.stock) || 0) > 0);
    if (available.length === 0) {
      showToast('Please add products or select a store template in Settings first!', 'warning');
      openModal('settings');
      return;
    }

    // Pick 2 to 4 random products
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const countToPick = Math.min(shuffled.length, Math.floor(Math.random() * 3) + 2);
    const chosen = shuffled.slice(0, countToPick);

    clearCart();
    chosen.forEach((p) => {
      const qty = Math.min(Number(p.stock) || 1, Math.floor(Math.random() * 2) + 1);
      addToCart(p, qty);
    });

    const chosenPayment = Math.random() > 0.5 ? 'upi' : 'cash';
    setCartPaymentMethod(chosenPayment);

    // Calculate totals directly
    const subtotal = chosen.reduce((acc, p) => acc + (Number(p.sellingPrice) || 0), 0);
    const taxAmt = Number(((subtotal * taxRate) / 100).toFixed(2));

    const completedSale = await completeCheckout({
      taxRate,
      taxAmount: taxAmt,
    });

    if (completedSale) {
      if (soundEnabled) soundEffects.playSuccessChime();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#06b6d4', '#fbbf24'],
        });
      } catch (e) {}

      showToast(`Generated Demo Bill #${completedSale.invoiceNo || completedSale.invoiceNumber}!`, 'success');
      openModal('receipt', completedSale);
    }
  };

  const handleFillRandomCart = () => {
    const available = products.filter((p) => (Number(p.stock) || 0) > 0);
    if (available.length === 0) {
      showToast('No in-stock products to add.', 'warning');
      return;
    }
    clearCart();
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const countToPick = Math.min(shuffled.length, Math.floor(Math.random() * 3) + 2);
    shuffled.slice(0, countToPick).forEach((p) => {
      const qty = Math.min(Number(p.stock) || 1, Math.floor(Math.random() * 2) + 1);
      addToCart(p, qty);
    });
    if (soundEnabled) soundEffects.playAddToCart();
    showToast(`Added ${countToPick} random items to cart!`, 'info');
  };

  const handleCheckout = async () => {
    if (!items || items.length === 0) {
      showToast('Cart is empty. Click any item on the left to add.', 'warning');
      return;
    }

    if (paymentMethod === 'udhaar') {
      if (!selectedCustomer) {
        showToast('Please search & select or add a customer for Udhaar credit.', 'warning');
        return;
      }
    }

    const completedSale = await completeCheckout({
      taxRate,
      taxAmount: cartTotals.taxAmount,
    });
    if (completedSale) {
      if (soundEnabled) soundEffects.playSuccessChime();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#06b6d4', '#fbbf24'],
        });
      } catch (e) {}

      showToast(`Sale completed! Invoice #${completedSale.invoiceNo || completedSale.invoiceNumber}`, 'success');
      openModal('receipt', completedSale);
    }
  };

  return (
    <section id="pos-section" className="scroll-mt-24 space-y-5 pb-20 lg:pb-0">
      {/* Header with Title and Quick Demo Billing Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Express POS Billing Counter</h2>
            <p className="text-xs text-slate-600 dark:text-gray-400">High-speed retail billing with barcode scanner & instant Udhaar ledger</p>
          </div>
        </div>

        {/* Action Controls: Barcode Scanner + Demo Billing + Add Item */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* 🎲 Instant Demo Billing Button */}
          <button
            onClick={handleDemoBilling}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            title="Pick random products and generate an instant Bill / Receipt"
          >
            <Dices className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>🎲 Demo Billing</span>
          </button>

          {/* Quick Random Cart filler */}
          <button
            onClick={handleFillRandomCart}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer"
            title="Fill cart with random items for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Random Cart</span>
          </button>

          <form onSubmit={handleBarcodeSubmit} className="relative flex-1 sm:w-56">
            <Scan className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan Barcode / SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-emerald-950/20 border border-slate-300 dark:border-emerald-500/30 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-500/50 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </form>

          <button
            onClick={() => openModal('product_form')}
            className="px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
          >
            + New Item
          </button>
        </div>
      </div>

      {/* Mobile Segemented Tabs: [Select Products] / [Cart & Bill (N)] */}
      <div className="flex lg:hidden items-center p-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl">
        <button
          type="button"
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'products'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Select Products ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mobileTab === 'cart'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>
            Bill & Cart ({cartTotals.totalItems})
          </span>
          {cartTotals.totalAmount > 0 && (
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-white">
              {formatCurrency(cartTotals.totalAmount, currency)}
            </span>
          )}
        </button>
      </div>

      {/* Main Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Product Selection Grid (7 Cols on Desktop, Tab on Mobile) */}
        <div className={`lg:col-span-7 space-y-4 ${mobileTab === 'products' ? 'block' : 'hidden lg:block'}`}>
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-900/90 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCat === cat
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
              {visibleProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= (product.minThreshold || 5);
                const prodId = product.id || product._id || product.sku;
                const inCartItem = items.find((i) => (i.product?.id || i.product?._id || i.productId) === prodId);

                return (
                  <button
                    key={prodId}
                    onClick={() => handleAddItem(product)}
                    disabled={isOutOfStock}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between h-28 relative overflow-hidden group cursor-pointer ${
                      isOutOfStock
                        ? 'bg-rose-50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-500/20 opacity-60 cursor-not-allowed'
                        : inCartItem
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-500/50 shadow-xs'
                        : 'bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.06] border-slate-200 dark:border-white/5 hover:border-emerald-500/50 shadow-xs hover:scale-[1.01] active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {product.name}
                        </p>
                        {inCartItem && (
                          <span className="shrink-0 text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-mono">
                            {inCartItem.quantity}×
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">
                        {product.sku}
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-2 pt-1 border-t border-slate-100 dark:border-white/5">
                      <div>
                        <span className="text-[9px] text-slate-400 dark:text-gray-500 block uppercase font-bold">Price</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(product.sellingPrice, currency)}
                        </span>
                      </div>

                      <Badge
                        variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'default'}
                        size="sm"
                        className="text-[9px] px-1.5"
                      >
                        {product.stock} {product.unit}
                      </Badge>
                    </div>
                  </button>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 dark:text-gray-400 text-xs">
                  No products found matching your search.
                </div>
              )}

              {filteredProducts.length > visibleLimit && (
                <div className="col-span-full py-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleLimit((v) => v + 30)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-bold text-slate-700 dark:text-gray-200 transition-all cursor-pointer"
                  >
                    Load More ({filteredProducts.length - visibleLimit} remaining)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Cart & Checkout (5 Cols on Desktop, Tab on Mobile) */}
        <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'cart' ? 'block' : 'hidden lg:block'}`}>
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 shadow-xs">
            
            {/* Mobile: Back to products shortcut button */}
            <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setMobileTab('products')}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Add More Products</span>
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                {cartTotals.totalItems} items in cart
              </span>
            </div>

            {/* Customer Attachment Widget */}
            <CustomerTypeaheadPicker isUdhaar={paymentMethod === 'udhaar'} />

            {/* Cart Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Current Cart</h4>
                  <Badge variant="success" size="sm">
                    {cartTotals.totalItems} item{cartTotals.totalItems !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {items.length > 0 && (
                  <button
                    onClick={() => {
                      clearCart();
                      if (soundEnabled) soundEffects.playClick();
                    }}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => {
                  const prodId = item.product?.id || item.product?._id || item.productId;
                  const prodName = item.product?.name || item.name;
                  const prodPrice = Number(item.customPrice ?? item.product?.sellingPrice ?? item.sellingPrice) || 0;
                  const prodCost = Number(item.product?.costPrice ?? item.costPrice) || 0;
                  const lineTotal = prodPrice * item.quantity;
                  const lineProfit = (prodPrice - prodCost) * item.quantity;

                  return (
                    <div
                      key={prodId || prodName}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{prodName}</p>
                        <p className="text-[11px] text-slate-600 dark:text-gray-400 font-mono">
                          {formatCurrency(prodPrice, currency)} × {item.quantity} ={' '}
                          <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(lineTotal, currency)}</strong>
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                          Line Profit: +{formatCurrency(lineProfit, currency)}
                        </p>
                      </div>

                      {/* Stepper buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            updateCartQty(prodId, item.quantity - 1);
                            if (soundEnabled) soundEffects.playClick();
                          }}
                          className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center justify-center text-slate-800 dark:text-white active:scale-95 cursor-pointer font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-extrabold text-slate-900 dark:text-white text-xs font-mono">{item.quantity}</span>
                        <button
                          onClick={() => {
                            updateCartQty(prodId, item.quantity + 1);
                            if (soundEnabled) soundEffects.playAddToCart();
                          }}
                          className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center justify-center text-slate-800 dark:text-white active:scale-95 cursor-pointer font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            removeFromCart(prodId);
                            if (soundEnabled) soundEffects.playClick();
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {items.length === 0 && (
                  <div className="py-8 text-center text-slate-500 dark:text-gray-400 text-xs">
                    Cart is empty. Click any product from the catalog or scan barcode.
                  </div>
                )}
              </div>
            </div>

            {/* GST / Tax Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
              <span className="text-slate-600 dark:text-gray-400 flex items-center gap-1 text-[11px] font-bold">
                <Percent className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> GST Tax Rate:
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 12, 18].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setTaxRate(rate)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      taxRate === rate
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400 dark:border-cyan-500/40 font-black'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10">
              <label className="text-[11px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider block">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'upi', label: 'UPI / QR', icon: QrCode },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'udhaar', label: 'Udhaar', icon: Users },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setCartPaymentMethod(m.id);
                        if (soundEnabled) soundEffects.playClick();
                      }}
                      className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-bold border transition-all cursor-pointer ${
                        active
                          ? m.id === 'udhaar'
                            ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-800 dark:text-amber-300 shadow-sm'
                            : 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                          : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cart Summary & Checkout Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-gray-400">
                  <span>Subtotal ({cartTotals.totalItems} items):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(cartTotals.subtotal, currency)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-cyan-700 dark:text-cyan-400 font-semibold">
                    <span>GST ({taxRate}%):</span>
                    <span className="font-mono">+{formatCurrency(cartTotals.taxAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Net Profit on Sale:
                  </span>
                  <span className="text-sm font-mono">+{formatCurrency(cartTotals.estimatedProfit, currency)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-white/10 font-mono">
                  <span>Grand Total:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(cartTotals.totalAmount, currency)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                  items.length > 0
                    ? 'btn-shimmer bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-glow-green hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-200 dark:bg-gray-800 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Complete Sale & Print Receipt ({formatCurrency(cartTotals.totalAmount, currency)})</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 📱 Mobile Sticky Bottom Action Bar when on Products Tab */}
      {mobileTab === 'products' && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 p-3 bg-white/95 dark:bg-gray-950/95 border-t border-slate-200 dark:border-white/10 backdrop-blur-xl z-30 shadow-2xl">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">
                {cartTotals.totalItems} items selected
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(cartTotals.totalAmount, currency)}
              </span>
            </div>

            <button
              onClick={() => {
                if (items.length === 0) {
                  showToast('Please tap on any product above to add to bill', 'info');
                  return;
                }
                setMobileTab('cart');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all ${
                items.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-green cursor-pointer'
                  : 'bg-slate-200 dark:bg-gray-800 text-slate-500 dark:text-gray-400 cursor-pointer'
              }`}
            >
              <span>{items.length > 0 ? `Make Bill of ${formatCurrency(cartTotals.totalAmount, currency)}` : 'Make Bill (0 Items)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
