import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Users,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Receipt,
  LayoutGrid,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal.jsx';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { Badge } from '../common/Badge.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const QuickPOSModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [isNewCustMode, setIsNewCustMode] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [mobileTab, setMobileTab] = useState('catalog'); // 'catalog' | 'cart'

  const products = useInventoryStore((state) => state.products);
  const categories = useInventoryStore((state) => state.getCategories());

  const cart = useSalesStore((state) => state.cart);
  const addToCart = useSalesStore((state) => state.addToCart);
  const updateCartQty = useSalesStore((state) => state.updateCartQty);
  const removeFromCart = useSalesStore((state) => state.removeFromCart);
  const clearCart = useSalesStore((state) => state.clearCart);
  const setCartPaymentMethod = useSalesStore((state) => state.setCartPaymentMethod);
  const setCartCustomer = useSalesStore((state) => state.setCartCustomer);
  const setCartNotes = useSalesStore((state) => state.setCartNotes);
  const completeCheckout = useSalesStore((state) => state.completeCheckout);
  const cartTotals = useSalesStore((state) => state.getCartTotals());

  const customers = useCustomerStore((state) => state.customers);
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);
  const openModal = useThemeStore((state) => state.openModal);

  // Filter products for quick selection
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleCheckout = async () => {
    if (!cart.items || cart.items.length === 0) {
      showToast('Cart is empty. Add products to create a sale.', 'warning');
      return;
    }

    if (cart.paymentMethod === 'udhaar') {
      if (isNewCustMode) {
        if (!newCustName.trim() || !newCustPhone.trim()) {
          showToast('Please enter customer name and phone for Udhaar sales.', 'warning');
          return;
        }
        setCartCustomer(null, newCustName.trim(), newCustPhone.trim());
      } else if (!cart.customerId) {
        showToast('Please select a customer for Udhaar (Credit) record.', 'warning');
        return;
      }
    }

    const completedSale = await completeCheckout();
    if (completedSale) {
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#06b6d4', '#fbbf24'],
        });
      } catch (e) {}

      showToast(`Sale #${completedSale.invoiceNo} recorded successfully!`, 'success');
      onClose();
      // Automatically open receipt view
      openModal('receipt', completedSale);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Express POS Billing Terminal"
      subtitle="Rapid multi-channel checkout with real-time profit tracking"
      maxWidth="max-w-5xl"
    >
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-white/[0.04] border border-white/10 rounded-2xl mb-4">
        <button
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'catalog'
              ? 'bg-emerald-500 text-gray-950 shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Product Catalog</span>
        </button>

        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative ${
            mobileTab === 'cart'
              ? 'bg-emerald-500 text-gray-950 shadow-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Cart & Pay ({cartTotals.totalItems})</span>
          {cartTotals.totalItems > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 -mx-1 sm:mx-0">
        
        {/* LEFT: Product Catalog Picker (7 Cols) */}
        <div className={`lg:col-span-7 space-y-3 ${mobileTab === 'cart' ? 'hidden lg:block' : 'block'}`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-900/90 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-emerald-500 text-gray-950 shadow-sm font-bold'
                    : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredProducts.map((product) => {
              const inStock = product.stock > 0;
              const unitProfit = product.sellingPrice - product.costPrice;
              const isLow = inStock && product.stock <= (product.minThreshold || 5);

              return (
                <div
                  key={product.id || product.sku}
                  onClick={() => {
                    if (inStock) {
                      addToCart(product, 1);
                      showToast(`Added ${product.name}`, 'success');
                    }
                  }}
                  className={`p-3 rounded-2xl border flex flex-col justify-between transition-all select-none ${
                    inStock
                      ? 'bg-white/[0.03] hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/30 cursor-pointer active:scale-[0.97]'
                      : 'bg-gray-900/40 border-rose-500/20 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {product.name}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.sku}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-white font-mono">
                        {formatCurrency(product.sellingPrice, currency)}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium font-mono">
                        +{formatCurrency(unitProfit, currency)} profit
                      </p>
                    </div>

                    <div>
                      {inStock ? (
                        <span
                          className={`text-[10px] px-2 py-1 rounded-lg font-extrabold flex items-center gap-1 ${
                            isLow
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          <Plus className="w-3 h-3" /> Add
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold">
                          Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 text-xs">
                No products match "{search}".
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart & Checkout Ledger (5 Cols) */}
        <div className={`lg:col-span-5 bg-gray-950/70 border border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-4 ${mobileTab === 'catalog' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Current Cart</h4>
                <Badge variant="success" size="sm">
                  {cartTotals.totalItems} item{cartTotals.totalItems !== 1 ? 's' : ''}
                </Badge>
              </div>

              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[190px] sm:max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {cart.items.map((item) => {
                const lineTotal = item.sellingPrice * item.quantity;
                const lineProfit = (item.sellingPrice - item.costPrice) * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {formatCurrency(item.sellingPrice, currency)} × {item.quantity} ={' '}
                        <strong className="text-white font-bold">{formatCurrency(lineTotal, currency)}</strong>
                      </p>
                      <p className="text-[10px] text-emerald-400 font-mono">
                        Line Profit: +{formatCurrency(lineProfit, currency)}
                      </p>
                    </div>

                    {/* Stepper buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-extrabold text-white text-xs font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors ml-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {cart.items.length === 0 && (
                <div className="py-8 text-center text-gray-500 text-xs">
                  Cart is empty. Click any item on the left to add.
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Payment Channel
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'upi', label: 'UPI / QR', icon: QrCode },
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'udhaar', label: 'Udhaar', icon: Users },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = cart.paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setCartPaymentMethod(m.id)}
                      className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[11px] font-bold border transition-all ${
                        active
                          ? m.id === 'udhaar'
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Udhaar chosen: Customer selection or quick input */}
            {cart.paymentMethod === 'udhaar' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Record Udhaar Debt
                  </span>
                  <button
                    onClick={() => setIsNewCustMode(!isNewCustMode)}
                    className="text-[11px] text-amber-400 underline font-semibold"
                  >
                    {isNewCustMode ? 'Select Existing' : '+ New Customer'}
                  </button>
                </div>

                {isNewCustMode ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="px-2.5 py-1.5 bg-gray-900 border border-amber-500/40 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="px-2.5 py-1.5 bg-gray-900 border border-amber-500/40 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <select
                    value={cart.customerId || ''}
                    onChange={(e) => {
                      const c = customers.find((cust) => cust.id === e.target.value);
                      setCartCustomer(e.target.value, c?.name, c?.phone);
                    }}
                    className="w-full px-2.5 py-1.5 bg-gray-900 border border-amber-500/40 rounded-lg text-white text-xs focus:outline-none"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - Udhaar: {formatCurrency(c.currentBalance, currency)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Cart Summary & Checkout Action */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Total Inventory Cost:</span>
                <span className="font-mono">{formatCurrency(cartTotals.totalCost, currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Net Profit on this Sale:
                </span>
                <span className="text-glow-green text-sm font-mono">+{formatCurrency(cartTotals.estimatedProfit, currency)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-1 border-t border-white/10 font-mono">
                <span>Grand Total:</span>
                <span className="text-emerald-400">{formatCurrency(cartTotals.totalAmount, currency)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.items.length === 0}
              className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                cart.items.length > 0
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 shadow-glow-green hover:scale-[1.01] active:scale-[0.98]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-gray-950 stroke-[3]" />
              <span>Complete Sale & Print Receipt ({formatCurrency(cartTotals.totalAmount, currency)})</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
