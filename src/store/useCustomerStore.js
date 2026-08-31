import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialCustomers } from '../services/mockData.js';
import { apiService } from '../services/api.js';
import { firestoreService } from '../services/firestoreService.js';

export const useCustomerStore = create(
  persist(
    (set, get) => ({
      customers: initialCustomers,
      searchQuery: '',
      filterStatus: 'all', // 'all' | 'has_debt' | 'settled'

      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterStatus: (status) => set({ filterStatus: status }),

      addCustomer: async (customerData) => {
        const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const initDebt = Math.max(0, Number(customerData.initialBalance) || Number(customerData.totalCredit) || 0);

        const newCustomer = {
          id,
          _id: id,
          name: (customerData.name || '').trim(),
          phone: String(customerData.phone || '').trim(),
          email: (customerData.email || '').trim(),
          address: (customerData.address || '').trim(),
          totalCredit: initDebt,
          totalPaid: 0,
          currentBalance: initDebt,
          transactions: initDebt > 0 ? [
            {
              id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              date: new Date().toISOString(),
              type: 'credit',
              amount: initDebt,
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

        firestoreService.saveCustomer(newCustomer).catch(() => {});
        apiService.createCustomer(newCustomer).catch(() => {});
        return newCustomer;
      },

      updateCustomer: (id, updatedFields) => {
        let updatedCust = null;
        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === id || c._id === id) {
              updatedCust = { ...c, ...updatedFields, lastActivityDate: new Date().toISOString() };
              return updatedCust;
            }
            return c;
          })
        }));
        if (updatedCust) {
          firestoreService.saveCustomer(updatedCust).catch(() => {});
        }
      },

      recordPayment: async (customerId, amount, paymentMethod = 'cash', note = 'Payment received') => {
        const payNum = Number(amount);
        if (isNaN(payNum) || payNum <= 0) return false;

        const newTx = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          date: new Date().toISOString(),
          type: 'payment',
          amount: payNum,
          paymentMethod,
          note,
        };

        let updatedCust = null;
        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === customerId || c._id === customerId) {
              const updatedPaid = (Number(c.totalPaid) || 0) + payNum;
              const updatedBalance = Math.max(0, (Number(c.currentBalance) || 0) - payNum);
              updatedCust = {
                ...c,
                totalPaid: updatedPaid,
                currentBalance: updatedBalance,
                transactions: [newTx, ...(c.transactions || [])],
                lastActivityDate: new Date().toISOString(),
              };
              return updatedCust;
            }
            return c;
          })
        }));

        if (updatedCust) {
          firestoreService.saveCustomer(updatedCust).catch(() => {});
        }
        apiService.recordPayment(customerId, { amount: payNum, paymentMethod, note }).catch(() => {});
        return true;
      },

      addTransaction: (customerId, txData) => {
        const amount = Number(txData.amount) || 0;
        const paid = Number(txData.paid) || 0;
        const netDebtIncrease = Math.max(0, amount - paid);

        const newTx = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          date: new Date().toISOString(),
          type: txData.type || 'sale',
          amount,
          paid,
          invoiceId: txData.invoiceId || '',
          note: txData.description || `POS Sale Invoice #${txData.invoiceId || ''}`,
        };

        let updatedCust = null;
        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === customerId || c._id === customerId) {
              const updatedCredit = (Number(c.totalCredit) || 0) + amount;
              const updatedPaid = (Number(c.totalPaid) || 0) + paid;
              const updatedBalance = (Number(c.currentBalance) || 0) + netDebtIncrease;
              updatedCust = {
                ...c,
                totalCredit: updatedCredit,
                totalPaid: updatedPaid,
                currentBalance: updatedBalance,
                transactions: [newTx, ...(c.transactions || [])],
                lastActivityDate: new Date().toISOString(),
              };
              return updatedCust;
            }
            return c;
          })
        }));

        if (updatedCust) {
          firestoreService.saveCustomer(updatedCust).catch(() => {});
        }
      },

      addCreditToCustomer: (customerId, amount, invoiceNo, note = '') => {
        const creditNum = Number(amount);
        if (isNaN(creditNum) || creditNum <= 0) return;

        get().addTransaction(customerId, {
          type: 'credit',
          amount: creditNum,
          paid: 0,
          invoiceId: invoiceNo,
          description: note || `Udhaar purchase (Invoice: ${invoiceNo})`,
        });
      },

      deleteCustomer: async (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id && c._id !== id)
        }));
        firestoreService.deleteCustomer(id).catch(() => {});
        apiService.deleteCustomer(id).catch(() => {});
      },

      importCustomers: (customersList) => {
        if (!Array.isArray(customersList)) return;
        set({ customers: customersList });
      },

      // Selectors
      getFilteredCustomers: () => {
        const { customers, searchQuery, filterStatus } = get();
        return (customers || []).filter((c) => {
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
        return (get().customers || []).reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0);
      },

      getCustomerById: (id) => {
        return (get().customers || []).find(c => c.id === id || c._id === id);
      }
    }),
    {
      name: 'smartshop-customers-storage',
      onRehydrateStorage: () => (state) => {
        if (state && (!Array.isArray(state.customers) || state.customers.length === 0)) {
          state.customers = initialCustomers || [];
        }
      },
    }
  )
);
