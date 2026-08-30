import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialSettings } from '../services/mockData.js';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: true,
      fidelity3D: 'high', // 'high' | 'lite' | 'off'
      settings: initialSettings,
      activeModal: null, // null | 'pos' | 'product_form' | 'customer_form' | 'record_payment' | 'receipt' | 'settings' | 'quick_search' | 'stock_adjust'
      modalData: null,
      toast: null, // { type: 'success'|'error'|'info'|'warning', message: string }

      toggleTheme: () => {
        const next = !get().isDarkMode;
        set({ isDarkMode: next });
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setFidelity3D: (mode) => set({ fidelity3D: mode }),

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      openModal: (modalName, data = null) => {
        set({ activeModal: modalName, modalData: data });
      },

      closeModal: () => {
        set({ activeModal: null, modalData: null });
      },

      showToast: (message, type = 'success') => {
        set({ toast: { message, type, id: Date.now() } });
        setTimeout(() => {
          if (get().toast?.message === message) {
            set({ toast: null });
          }
        }, 3500);
      },

      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'smartshop-theme-settings',
    }
  )
);
