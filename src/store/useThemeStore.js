import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialSettings } from '../services/mockData.js';

// Auto-detect mobile screen to default to 2D zero-lag mode
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: true,
      soundEnabled: true,
      fidelity3D: isMobileDevice() ? 'off' : 'high', // 'high' | 'lite' | 'off' (default 2D on phones!)
      settings: initialSettings,
      activeModal: null, // null | 'pos' | 'product_form' | 'customer_form' | 'record_payment' | 'receipt' | 'settings' | 'quick_search' | 'stock_adjust' | 'whatsapp_templates'
      modalData: null,
      toast: null, // { type: 'success'|'error'|'info'|'warning', message: string }

      toggleTheme: () => {
        const next = !get().isDarkMode;
        set({ isDarkMode: next });
        if (typeof document !== 'undefined') {
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      setThemeMode: (isDark) => {
        set({ isDarkMode: isDark });
        if (typeof document !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleSound: () => {
        set({ soundEnabled: !get().soundEnabled });
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
        const toastId = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        set({ toast: { message, type, id: toastId } });
        setTimeout(() => {
          if (get().toast?.id === toastId) {
            set({ toast: null });
          }
        }, 3500);
      },

      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'smartshop-theme-settings',
      onRehydrateStorage: () => (state) => {
        if (typeof document !== 'undefined' && state) {
          if (state.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    }
  )
);
