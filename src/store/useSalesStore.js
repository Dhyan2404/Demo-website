import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialSales } from '../services/mockData.js';
import { useInventoryStore } from './useInventoryStore.js';
import { useCustomerStore } from './useCustomerStore.js';
import { filterByPeriod } from '../utils/calculations.js';
import { apiService } from '../services/api.js';

export const useSalesStore = create(
  persist(
    (set, get) => ({
      sales: initialSales,
      cart: {
        items: [],
        paymentMethod: 'cash', // 'cash' | 'upi' | 'card' | 'udhaar'
        paidAmount: 0,
        customerId: null,
        customerName: 'Walk-in Customer',
        customerPhone: '',
        notes: '',
      },
      periodFilter: '30days', // 'today' | '7days' | '30days' | '1year' | 'all'
      lastCompletedSale: null,

      setPeriodFilter: (period) => set({ periodFilter: period }),

      // Cart Actions
      addToCart: (product, qty = 1) => {
        const cart = get().cart;
        const existingIndex = cart.items.findIndex(
          (i) => i.productId === product.id || i.productId === product._id
        );

        let newItems;
        if (existingIndex >= 0) {
          newItems = [...cart.items];
          const updatedQty = newItems[existingIndex].quantity + qty;
          // Check stock bounds
          if (product.stock > 0 && updatedQty > product.stock) {
            newItems[existingIndex].quantity = product.stock;
          } else {
            newItems[existingIndex].quantity = updatedQty;
          }
        } else {
          newItems = [
            ...cart.items,
            {
              productId: product.id || product._id,
              sku: product.sku,
              name: product.name,
              category: product.category,
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              stock: product.stock,
              quantity: Math.min(qty, product.stock > 0 ? product.stock : 1),
            },
          ];
        }

        set({ cart: { ...cart, items: newItems } });
      },

      updateCartQty: (productId, newQty) => {
        const cart = get().cart;
        const num = Math.max(1, Number(newQty) || 1);
        const newItems = cart.items.map((item) => {
          if (item.productId === productId) {
            return {
              ...item,
              quantity: item.stock > 0 ? Math.min(num, item.stock) : num,
            };
          }
          return item;
        });

        set({ cart: { ...cart, items: newItems } });
      },

      removeFromCart: (productId) => {
        const cart = get().cart;
        set({
          cart: {
            ...cart,
            items: cart.items.filter((i) => i.productId !== productId),
          },
        });
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            paymentMethod: 'cash',
            paidAmount: 0,
            customerId: null,
            customerName: 'Walk-in Customer',
            customerPhone: '',
            notes: '',
          },
        });
      },

      setCartPaymentMethod: (method) => {
        set((state) => ({
          cart: { ...state.cart, paymentMethod: method },
        }));
      },

      setCartCustomer: (customerId, name, phone) => {
        set((state) => ({
          cart: {
            ...state.cart,
            customerId,
            customerName: name || 'Walk-in Customer',
            customerPhone: phone || '',
          },
        }));
      },

      setCartNotes: (notes) => {
        set((state) => ({
          cart: { ...state.cart, notes },
        }));
      },

      // Complete Checkout
      completeCheckout: async () => {
        const { cart, sales } = get();
        if (!cart.items || cart.items.length === 0) return null;

        let totalAmount = 0;
        let totalCost = 0;
        let totalQuantity = 0;
        const processedItems = [];

        cart.items.forEach((item) => {
          const qty = Number(item.quantity) || 1;
          const cost = Number(item.costPrice) || 0;
          const sell = Number(item.sellingPrice) || 0;
          const lineProfit = (sell - cost) * qty;

          totalAmount += sell * qty;
          totalCost += cost * qty;
          totalQuantity += qty;

          processedItems.push({
            productId: item.productId,
            sku: item.sku,
            name: item.name,
            quantity: qty,
            costPrice: cost,
            sellingPrice: sell,
            profit: lineProfit,
          });

          // Decrement Inventory Stock in real-time
          useInventoryStore.getState().adjustStock(item.productId, -qty);
        });

        const netProfit = totalAmount - totalCost;
        const isUdhaar = cart.paymentMethod === 'udhaar';
        const paidAmount = isUdhaar ? 0 : totalAmount;
        const pendingAmount = isUdhaar ? totalAmount : 0;

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.floor(1000 + Math.random() * 9000);
        const invoiceNo = `INV-${dateStr}-${rand}`;

        const newSale = {
          id: `sale_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          invoiceNo,
          items: processedItems,
          totalQuantity,
          totalCost,
          totalAmount,
          netProfit,
          paymentMethod: cart.paymentMethod,
          paidAmount,
          pendingAmount,
          customerId: cart.customerId,
          customerName: cart.customerName,
          customerPhone: cart.customerPhone,
          notes: cart.notes,
          createdAt: new Date().toISOString(),
        };

        // If Udhaar, record in customer store
        if (isUdhaar && (cart.customerId || cart.customerPhone)) {
          let custId = cart.customerId;
          if (!custId && cart.customerPhone) {
            // Auto create customer if doesn't exist
            const existing = useCustomerStore.getState().customers.find(c => c.phone === cart.customerPhone);
            if (existing) {
              custId = existing.id;
            } else {
              const created = await useCustomerStore.getState().addCustomer({
                name: cart.customerName || 'Valued Customer',
                phone: cart.customerPhone,
                totalCredit: totalAmount,
                totalPaid: 0,
              });
              custId = created.id;
            }
          }

          if (custId) {
            useCustomerStore.getState().addCreditToCustomer(custId, totalAmount, invoiceNo);
          }
        }

        // Save Sale
        set({
          sales: [newSale, ...sales],
          lastCompletedSale: newSale,
        });

        // Reset cart
        get().clearCart();

        // Sync with API in background
        apiService.createSale(newSale).catch(() => {});

        return newSale;
      },

      importSales: (salesList) => {
        if (!Array.isArray(salesList)) return;
        set({ sales: salesList });
      },

      // Selectors
      getFilteredSales: () => {
        const { sales, periodFilter } = get();
        return filterByPeriod(sales, periodFilter);
      },

      getPeriodMetrics: () => {
        const filtered = get().getFilteredSales();
        const totalSales = filtered.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
        const totalCost = filtered.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0);
        const netProfit = totalSales - totalCost;
        const marginPercentage = totalSales > 0 ? Number(((netProfit / totalSales) * 100).toFixed(1)) : 0;
        const totalOrders = filtered.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        return {
          totalSales,
          totalCost,
          netProfit,
          marginPercentage,
          totalOrders,
          avgOrderValue,
        };
      },

      getCartTotals: () => {
        const items = get().cart.items || [];
        const totalAmount = items.reduce((acc, i) => acc + (i.sellingPrice * i.quantity), 0);
        const totalCost = items.reduce((acc, i) => acc + (i.costPrice * i.quantity), 0);
        const estimatedProfit = totalAmount - totalCost;
        const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

        return { totalAmount, totalCost, estimatedProfit, totalItems };
      }
    }),
    {
      name: 'smartshop-sales-storage',
    }
  )
);
