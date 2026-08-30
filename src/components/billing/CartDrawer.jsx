import React, { useState } from 'react';
import { Trash2, Plus, Minus, CreditCard, Banknote, QrCode, BookOpen, User, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const CartDrawer = ({ onCheckoutSuccess }) => {
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');
  const showToast = useThemeStore((state) => state.showToast);

  const cart = useSalesStore((state) => state.cart);
  const updateCartQty = useSalesStore((state) => state.updateCartQty);
  const removeFromCart = useSalesStore((state) => state.removeFromCart);
  const clearCart = useSalesStore((state) => state.clearCart);
  const setCartPaymentMethod = useSalesStore((state) => state.setCartPaymentMethod);
  const setCartCustomer = useSalesStore((state) => state.setCartCustomer);
  const completeCheckout = useSalesStore((state) => state.completeCheckout);
  const { totalAmount, totalCost, estimatedProfit, totalItems } = React.useMemo(() => {
    const items = cart?.items || [];
    const totalAmount = items.reduce((acc, i) => acc + ((Number(i.sellingPrice) || 0) * (Number(i.quantity) || 1)), 0);
    const totalCost = items.reduce((acc, i) => acc + ((Number(i.costPrice) || 0) * (Number(i.quantity) || 1)), 0);
    const estimatedProfit = totalAmount - totalCost;
    const totalItems = items.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0);
    return { totalAmount, totalCost, estimatedProfit, totalItems };
  }, [cart?.items]);

  const customers = useCustomerStore((state) => state.customers);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');

  const paymentModes = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { id: 'upi', label: 'UPI / QR', icon: QrCode, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    { id: 'card', label: 'Card', icon: CreditCard, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    { id: 'udhaar', label: 'Udhaar', icon: BookOpen, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  ];

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (custId) {
      const found = customers.find(c => c.id === custId || c._id === custId);
      if (found) {
        setCartCustomer(found.id, found.name, found.phone);
        setCustomCustomerName(found.name);
        setCustomCustomerPhone(found.phone);
      }
    } else {
      setCartCustomer(null, 'Walk-in Customer', '');
    }
  };

  const handleCheckout = async () => {
    if (!cart.items || cart.items.length === 0) {
      showToast('Please add items to cart before checkout', 'warning');
      return;
    }

    if (cart.paymentMethod === 'udhaar' && !selectedCustomerId && !customCustomerPhone) {
      showToast('Customer name or phone is required for Udhaar sales', 'error');
      return;
    }

    const sale = await completeCheckout();
    if (sale) {
      // Confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      showToast(`Sale recorded successfully! Invoice #${sale.invoiceNo}`, 'success');
      if (onCheckoutSuccess) {
        onCheckoutSuccess(sale);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight">Active Sale Cart</h4>
          <p className="text-xs text-gray-400">{totalItems} item{totalItems !== 1 ? 's' : ''} in bucket</p>
        </div>
        {cart.items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-gray-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-56 pr-1 custom-scrollbar">
        {cart.items.map((item) => {
          const itemProfit = (item.sellingPrice - item.costPrice) * item.quantity;
          return (
            <div
              key={item.productId}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                  <span>{formatCurrency(item.sellingPrice, currency)} each</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">+{formatCurrency(itemProfit, currency)} profit</span>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    if (item.quantity <= 1) {
                      removeFromCart(item.productId);
                    } else {
                      updateCartQty(item.productId, item.quantity - 1);
                    }
                  }}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                <button
                  onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1 text-gray-500 hover:text-rose-400 transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {cart.items.length === 0 && (
          <div className="py-8 text-center text-gray-500 text-xs space-y-1">
            <p>Your cart is empty.</p>
            <p className="text-[11px] text-gray-600">Click products from the catalog to add them instantly.</p>
          </div>
        )}
      </div>

      {/* Customer selector (Walk-in vs Udhaar/Registered) */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>Customer Assignment</span>
          </span>
          {cart.paymentMethod === 'udhaar' && (
            <span className="text-[10px] text-amber-400 font-bold uppercase">Required for Udhaar</span>
          )}
        </label>

        <select
          value={selectedCustomerId}
          onChange={handleCustomerSelect}
          className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">Walk-in Customer</option>
          {customers.map((c) => (
            <option key={c.id || c.phone} value={c.id}>
              {c.name} ({c.phone}) {c.currentBalance > 0 ? `[Udhaar: ${formatCurrency(c.currentBalance, currency)}]` : ''}
            </option>
          ))}
        </select>

        {!selectedCustomerId && cart.paymentMethod === 'udhaar' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <input
              type="text"
              placeholder="Customer Name"
              value={customCustomerName}
              onChange={(e) => {
                setCustomCustomerName(e.target.value);
                setCartCustomer(null, e.target.value, customCustomerPhone);
              }}
              className="px-3 py-1.5 bg-gray-900 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500"
            />
            <input
              type="tel"
              placeholder="Phone (10 digits)"
              value={customCustomerPhone}
              onChange={(e) => {
                setCustomCustomerPhone(e.target.value);
                setCartCustomer(null, customCustomerName, e.target.value);
              }}
              className="px-3 py-1.5 bg-gray-900 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500"
            />
          </div>
        )}
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-300">Payment Mode</label>
        <div className="grid grid-cols-4 gap-1.5">
          {paymentModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = cart.paymentMethod === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setCartPaymentMethod(mode.id)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold border transition-all ${
                  isSelected
                    ? `${mode.color} shadow-sm ring-1 ring-white/20`
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Totals & Estimated Profit Breakup */}
      <div className="p-3.5 rounded-2xl bg-gray-950/80 border border-white/10 space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Cost Basis:</span>
          <span>{formatCurrency(totalCost, currency)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-emerald-400 font-medium">Estimated Net Profit:</span>
          <span className="font-bold text-emerald-400">+{formatCurrency(estimatedProfit, currency)}</span>
        </div>
        <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
          <span className="text-sm font-bold text-white">Grand Total:</span>
          <span className="text-xl font-extrabold text-white text-glow-green">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={cart.items.length === 0}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-extrabold text-sm shadow-glow-green hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        <span>Complete Sale & Generate Receipt</span>
      </button>
    </div>
  );
};
