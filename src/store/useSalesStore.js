import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialSales } from '../services/mockData.js';
import { useInventoryStore } from './useInventoryStore.js';
import { useCustomerStore } from './useCustomerStore.js';
import { apiService } from '../services/api.js';

export const useSalesStore = create(
  persist(
    (set, get) => ({
      sales: initialSales,
      cart: [], // Array of { product, quantity, customPrice }
      selectedCustomer: null, // null or customer object
      paymentMethod: 'cash', // 'cash' | 'upi' | 'card' | 'udhaar'
      paidAmount: 0,
      discountAmount: 0,
      activeTaxRate: 0, // 0 | 5 | 12 | 18
      periodFilter: 'today', // 'today' | '7days' | '30days' | '1year' | 'all'
      lastCompletedSale: null,

      // Filter Actions
      setPeriodFilter: (period) => set({ periodFilter: period }),
      importSales: (newSales) => set({ sales: Array.isArray(newSales) ? newSales : [] }),

      // Cart Actions
      addToCart: (product, qty = 1) => {
        const { cart } = get();
        const existing = cart.find((item) => item.product.id === product.id || item.product._id === product.id);

        if (existing) {
          const newQty = existing.quantity + qty;
          if (newQty > product.stock) {
            return false; // Not enough stock
          }
          set({
            cart: cart.map((item) =>
              item.product.id === product.id || item.product._id === product.id
                ? { ...item, quantity: newQty }
                : item
            ),
          });
        } else {
          if (qty > product.stock) {
            return false; // Not enough stock
          }
          set({
            cart: [
              ...cart,
              {
                product,
                quantity: qty,
                customPrice: product.sellingPrice,
              },
            ],
          });
        }
        return true;
      },

      updateCartQuantity: (productId, quantity) => {
        const { cart } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const item = cart.find((i) => i.product.id === productId || i.product._id === productId);
        if (item && quantity > item.product.stock) {
          quantity = item.product.stock;
        }

        set({
          cart: cart.map((i) =>
            i.product.id === productId || i.product._id === productId ? { ...i, quantity } : i
          ),
        });
      },

      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter((i) => i.product.id !== productId && i.product._id !== productId),
        });
      },

      clearCart: () => {
        set({
          cart: [],
          selectedCustomer: null,
          paymentMethod: 'cash',
          paidAmount: 0,
          discountAmount: 0,
          activeTaxRate: 0,
        });
      },

      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setCartCustomer: (customerId, customerName = 'Walk-in Customer', customerPhone = '') => {
        set({
          selectedCustomer: customerId ? { id: customerId, _id: customerId, name: customerName, phone: customerPhone } : null,
        });
      },
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setCartPaymentMethod: (method) => set({ paymentMethod: method }),
      setPaidAmount: (amount) => set({ paidAmount: Math.max(0, Number(amount) || 0) }),
      setDiscountAmount: (discount) => set({ discountAmount: Math.max(0, Number(discount) || 0) }),
      setActiveTaxRate: (rate) => set({ activeTaxRate: Number(rate) || 0 }),
      updateCartQty: (productId, quantity) => get().updateCartQuantity(productId, quantity),

      // Financial Calculation Helper
      getCartTotals: () => {
        const { cart, discountAmount, activeTaxRate } = get();
        let subtotal = 0;
        let totalCost = 0;

        cart.forEach((item) => {
          const sell = Number(item.customPrice ?? item.product.sellingPrice) || 0;
          const cost = Number(item.product.costPrice) || 0;
          const qty = Number(item.quantity) || 0;

          subtotal += sell * qty;
          totalCost += cost * qty;
        });

        // Round intermediate currency to 2 decimal places
        subtotal = Math.round(Math.max(0, subtotal - discountAmount) * 100) / 100;
        totalCost = Math.round(totalCost * 100) / 100;

        const taxAmount = Math.round(((subtotal * activeTaxRate) / 100) * 100) / 100;
        const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;
        const netProfit = Math.round((subtotal - totalCost) * 100) / 100;
        const marginPercentage = subtotal > 0 ? Math.round((netProfit / subtotal) * 1000) / 10 : 0;

        return {
          subtotal,
          totalCost,
          taxRate: activeTaxRate,
          taxAmount,
          grandTotal,
          netProfit,
          marginPercentage,
          totalItems: cart.reduce((acc, item) => acc + item.quantity, 0),
        };
      },

      // Complete Checkout with full GST & Stock Integrity
      completeCheckout: async (metadata = {}) => {
        const { cart, selectedCustomer, paymentMethod, paidAmount, discountAmount } = get();
        if (cart.length === 0) return null;

        const totals = get().getCartTotals();
        const taxRate = metadata.taxRate !== undefined ? Number(metadata.taxRate) : totals.taxRate;
        const taxAmount = metadata.taxAmount !== undefined ? Number(metadata.taxAmount) : totals.taxAmount;
        const grandTotal = totals.subtotal + taxAmount;

        // Verify stock sufficiency for all items
        const inventoryState = useInventoryStore.getState();
        for (const item of cart) {
          const p = inventoryState.getProduct(item.product.id || item.product._id);
          if (p && p.stock < item.quantity) {
            throw new Error(`Insufficient stock for "${p.name}". Only ${p.stock} available.`);
          }
        }

        const saleItems = cart.map((item) => {
          const sellPrice = Number(item.customPrice ?? item.product.sellingPrice) || 0;
          const costPrice = Number(item.product.costPrice) || 0;
          const itemProfit = Math.round((sellPrice - costPrice) * item.quantity * 100) / 100;

          return {
            productId: item.product.id || item.product._id,
            name: item.product.name,
            sku: item.product.sku,
            quantity: item.quantity,
            costPrice,
            sellingPrice: sellPrice,
            itemProfit,
          };
        });

        const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
        const saleRecordId = `sale_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        // Determine paid and balance breakdown
        let finalPaid = Number(paidAmount);
        let dueAmount = 0;

        if (paymentMethod === 'udhaar') {
          dueAmount = Math.max(0, grandTotal - finalPaid);
        } else {
          finalPaid = grandTotal;
          dueAmount = 0;
        }

        const newSale = {
          id: saleRecordId,
          _id: saleRecordId,
          invoiceNo: invoiceId,
          invoiceNumber: invoiceId,
          items: saleItems,
          subtotal: totals.subtotal,
          taxRate,
          taxAmount,
          totalAmount: grandTotal,
          totalCost: totals.totalCost,
          netProfit: totals.netProfit,
          profitMargin: totals.marginPercentage,
          discount: discountAmount,
          paymentMethod,
          paidAmount: finalPaid,
          dueAmount,
          customerId: selectedCustomer?.id || selectedCustomer?._id || (paymentMethod === 'udhaar' ? 'guest_debtor' : 'walkin_customer'),
          customerName: selectedCustomer?.name || (paymentMethod === 'udhaar' ? 'Udhaar Customer' : 'Walk-in Guest'),
          customerPhone: selectedCustomer?.phone || '',
          createdAt: new Date().toISOString(),
        };

        // 1. Decrement inventory stock safely
        cart.forEach((item) => {
          useInventoryStore.getState().adjustStock(item.product.id || item.product._id, -item.quantity);
        });

        // 2. If Udhaar, record customer credit transaction
        if (paymentMethod === 'udhaar' && selectedCustomer) {
          const custId = selectedCustomer.id || selectedCustomer._id;
          useCustomerStore.getState().addTransaction(custId, {
            type: 'sale',
            amount: grandTotal,
            paid: finalPaid,
            description: `POS Invoice #${invoiceId}`,
            invoiceId,
          });
        }

        // 3. Save sale locally
        set((state) => ({
          sales: [newSale, ...state.sales],
          lastCompletedSale: newSale,
        }));

        // 4. Fire remote API call asynchronously
        apiService.createSale(newSale).catch(() => {});

        // 5. Clear cart
        get().clearCart();

        return newSale;
      },
    }),
    {
      name: 'smartshop-sales-store',
      partialize: (state) => ({
        sales: Array.isArray(state.sales) ? state.sales : [],
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (!Array.isArray(state.sales) || state.sales.length === 0)) {
          state.sales = initialSales || [];
        }
        if (state && !Array.isArray(state.cart)) {
          state.cart = [];
        }
      },
    }
  )
);
