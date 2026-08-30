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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CustomerTypeaheadPicker } from './CustomerTypeaheadPicker.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { soundEffects } from '../../utils/soundEffects.js';

// canvas-confetti is optional
let confetti = null;
try { confetti = require('canvas-confetti'); } catch (e) {}

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
  const [taxRate, setTaxRate] = useState(0);
  // Mobile: toggle between product grid and cart
  const [mobileView, setMobileView] = useState('products'); // 'products' | 'cart'

  const categories = useMemo(() => {
    const set = new Set((products || []).map((p) => p.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [products]);

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
      showToast(`Added "${product.name}"`, 'success');
      // Switch to cart view on mobile after adding
      setMobileView('cart');
    }
  };

  const handleCheckout = async () => {
    if (!items || items.length === 0) {
      showToast('Cart is empty. Add products first.', 'warning');
      return;
    }

    if (paymentMethod === 'udhaar' && !selectedCustomer) {
      showToast('Select a customer for Udhaar credit.', 'warning');
      return;
    }

    const completedSale = await completeCheckout({ taxRate, taxAmount: cartTotals.taxAmount });
    if (completedSale) {
      if (soundEnabled) soundEffects.playSuccessChime();

      try {
        if (confetti && typeof confetti === 'function') {
          confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 }, colors: ['#22c55e', '#fbbf24'] });
        }
      } catch (e) {}

      showToast(`Sale Complete! Invoice #${completedSale.invoiceNo || completedSale.invoiceNumber}`, 'success');
      openModal('receipt', completedSale);
      setMobileView('products');
    }
  };

  return (
    <section id="pos-section" className="scroll-mt-20 space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Express POS Billing</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">Quick billing with barcode scanner & Udhaar tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-1 sm:w-60">
            <Scan className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan Barcode / SKU…"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 font-medium"
            />
          </form>
          <button
            onClick={() => openModal('product_form')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* ── Mobile Tab Switch ── */}
      <div className="lg:hidden flex items-center bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-1 rounded-xl">
        <button
          onClick={() => setMobileView('products')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileView === 'products'
              ? 'bg-white dark:bg-white/10 text-slate-950 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-gray-400'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Products</span>
        </button>
        <button
          onClick={() => setMobileView('cart')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileView === 'cart'
              ? 'bg-white dark:bg-white/10 text-slate-950 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-gray-400'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Cart</span>
          {items.length > 0 && (
            <span className="w-4 h-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center">
              {items.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Main Grid: 2-pane desktop / tabbed mobile ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Left: Product Grid */}
        <div className={`lg:col-span-7 lg:block ${mobileView === 'products' ? 'block' : 'hidden'}`}>
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCat === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[52vh] sm:max-h-[460px] overflow-y-auto pr-0.5 custom-scrollbar">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= (product.minThreshold || 5);

                return (
                  <button
                    key={product.id || product._id || product.sku}
                    onClick={() => handleAddItem(product)}
                    disabled={isOutOfStock}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between min-h-[96px] sm:min-h-[108px] relative group active:scale-[0.97] cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 dark:bg-rose-950/10 border-slate-200 dark:border-rose-500/15 opacity-50 cursor-not-allowed'
                        : 'bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] border-slate-200/80 dark:border-white/[0.06] hover:border-slate-400 dark:hover:border-white/20 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-snug">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mt-0.5 truncate">
                        {product.sku}
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-white/[0.05]">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                        {formatCurrency(product.sellingPrice, currency)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                      }`}>
                        {product.stock} {product.unit}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-10 text-center text-slate-400 dark:text-gray-500 text-xs">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cart & Checkout */}
        <div className={`lg:col-span-5 space-y-3 lg:block ${mobileView === 'cart' ? 'block' : 'hidden'}`}>
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-4">

            {/* Customer */}
            <CustomerTypeaheadPicker isUdhaar={paymentMethod === 'udhaar'} />

            {/* Cart Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Cart</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                    {cartTotals.totalItems} items
                  </span>
                </div>
                {items.length > 0 && (
                  <button
                    onClick={() => { clearCart(); if (soundEnabled) soundEffects.playClick(); }}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[32vh] sm:max-h-[200px] overflow-y-auto pr-0.5 custom-scrollbar">
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
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white truncate leading-snug">{prodName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">
                          {formatCurrency(prodPrice, currency)} × {item.quantity} = <strong className="text-slate-900 dark:text-white">{formatCurrency(lineTotal, currency)}</strong>
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          +{formatCurrency(lineProfit, currency)} profit
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { updateCartQty(prodId, item.quantity - 1); if (soundEnabled) soundEffects.playClick(); }}
                          className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-700 dark:text-white active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-slate-900 dark:text-white text-xs font-mono">{item.quantity}</span>
                        <button
                          onClick={() => { updateCartQty(prodId, item.quantity + 1); if (soundEnabled) soundEffects.playAddToCart(); }}
                          className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-700 dark:text-white active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => { removeFromCart(prodId); if (soundEnabled) soundEffects.playClick(); }}
                          className="ml-1 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {items.length === 0 && (
                  <div className="py-6 text-center text-slate-400 dark:text-gray-500 text-xs">
                    Tap any product to add to cart
                  </div>
                )}
              </div>
            </div>

            {/* GST Selector */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs">
              <span className="text-slate-600 dark:text-gray-400 font-semibold flex items-center gap-1">
                <Percent className="w-3 h-3" /> GST:
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 12, 18].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setTaxRate(rate)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      taxRate === rate
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">Payment Method</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'upi', label: 'UPI', icon: QrCode },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'udhaar', label: 'Credit', icon: Users },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setCartPaymentMethod(m.id); if (soundEnabled) soundEffects.playClick(); }}
                      className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-bold border transition-all cursor-pointer active:scale-95 ${
                        active
                          ? m.id === 'udhaar'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-2.5">
              <div className="space-y-1 text-xs text-slate-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal ({cartTotals.totalItems} items)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(cartTotals.subtotal, currency)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-amber-700 dark:text-amber-400">
                    <span>GST ({taxRate}%)</span>
                    <span className="font-mono">+{formatCurrency(cartTotals.taxAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Net Profit
                  </span>
                  <span className="font-mono font-bold">+{formatCurrency(cartTotals.estimatedProfit, currency)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200/80 dark:border-white/10 font-mono">
                  <span>Grand Total</span>
                  <span>{formatCurrency(cartTotals.totalAmount, currency)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                  items.length > 0
                    ? 'btn-shimmer bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Complete Sale · {formatCurrency(cartTotals.totalAmount, currency)}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
