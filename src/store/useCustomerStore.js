import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialCustomers } from '../services/mockData.js';
import { apiService } from '../services/api.js';

export const useCustomerStore = create(
  persist(
    (set, get) => ({
      customers: initialCustomers,
      searchQuery: '',
      filterStatus: 'all', // 'all' | 'has_debt' | 'settled'

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterStatus: (status) => set({ filterStatus: status }),

      addCustomer: async (customerData) => {
        const id = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newCustomer = {
          id,
          name: customerData.name.trim(),
          phone: customerData.phone.trim(),
          email: (customerData.email || '').trim(),
          address: (customerData.address || '').trim(),
          totalCredit: Number(customerData.totalCredit) || 0,
          totalPaid: Number(customerData.totalPaid) || 0,
          currentBalance: Number(customerData.totalCredit || 0) - Number(customerData.totalPaid || 0),
          transactions: customerData.initialBalance ? [
            {
              id: `tx_${Date.now()}`,
              date: new Date().toISOString(),
              type: 'credit',
              amount: Number(customerData.initialBalance),
              paymentMethod: 'udhaar',
              note: 'Opening Udhaar balance',
            }
          ] : [],
          createdAt: new Date().toISOString(),
          lastActivityDate: new Date().toISOString(),
        };

        set((state) => ({
          customers: [newCustomer, ...state.customers]
        }));

        apiService.createCustomer(newCustomer).catch(() => {});
        return newCustomer;
      },

      recordPayment: async (customerId, amount, paymentMethod = 'cash', note = 'Payment received') => {
        const payNum = Number(amount);
        if (isNaN(payNum) || payNum <= 0) return false;

        const newTx = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'payment',
          amount: payNum,
          paymentMethod,
          note,
        };

        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === customerId || c._id === customerId) {
              const updatedPaid = (c.totalPaid || 0) + payNum;
              const updatedBalance = Math.max(0, (c.currentBalance || 0) - payNum);
              return {
                ...c,
                totalPaid: updatedPaid,
                currentBalance: updatedBalance,
                transactions: [newTx, ...(c.transactions || [])],
                lastActivityDate: new Date().toISOString(),
              };
            }
            return c;
          })
        }));

        apiService.recordPayment(customerId, { amount: payNum, paymentMethod, note }).catch(() => {});
        return true;
      },

      addCreditToCustomer: (customerId, amount, invoiceNo, note = '') => {
        const creditNum = Number(amount);
        if (isNaN(creditNum) || creditNum <= 0) return;

        const newTx = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'credit',
          amount: creditNum,
          paymentMethod: 'udhaar',
          invoiceNo,
          note: note || `Udhaar purchase (Invoice: ${invoiceNo})`,
        };

        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === customerId || c._id === customerId) {
              const updatedCredit = (c.totalCredit || 0) + creditNum;
              const updatedBalance = (c.currentBalance || 0) + creditNum;
              return {
                ...c,
                totalCredit: updatedCredit,
                currentBalance: updatedBalance,
                transactions: [newTx, ...(c.transactions || [])],
                lastActivityDate: new Date().toISOString(),
              };
            }
            return c;
          })
        }));
      },

      deleteCustomer: async (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id && c._id !== id)
        }));
        apiService.deleteCustomer(id).catch(() => {});
      },

      importCustomers: (customersList) => {
        if (!Array.isArray(customersList)) return;
        set({ customers: customersList });
      },

      // Selectors
      getFilteredCustomers: () => {
        const { customers, searchQuery, filterStatus } = get();
        return customers.filter((c) => {
          const matchesSearch = !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery);

          let matchesFilter = true;
          if (filterStatus === 'has_debt') {
            matchesFilter = (c.currentBalance || 0) > 0;
          } else if (filterStatus === 'settled') {
            matchesFilter = (c.currentBalance || 0) === 0;
          }

          return matchesSearch && matchesFilter;
        }).sort((a, b) => (b.currentBalance || 0) - (a.currentBalance || 0));
      },

      getTotalUdhaarPending: () => {
        return get().customers.reduce((acc, c) => acc + (c.currentBalance || 0), 0);
      },

      getCustomerById: (id) => {
        return get().customers.find(c => c.id === id || c._id === id);
      }
    }),
    {
      name: 'smartshop-customers-storage',
    }
  )
);
