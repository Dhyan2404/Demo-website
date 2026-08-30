import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  ShoppingBag,
  Package,
  CreditCard,
  BarChart3,
  Plus,
} from 'lucide-react';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { soundEffects } from '../../utils/soundEffects.js';

export const MobileBottomNav = () => {
  const activeSection = useScrollStore((state) => state.activeSection);
  const setActiveSection = useScrollStore((state) => state.setActiveSection);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);

  const customers = useCustomerStore((state) => state.customers || []);
  const products = useInventoryStore((state) => state.products || []);

  const pendingDebtors = useMemo(() => {
    return (customers || []).filter((c) => (c.currentBalance || 0) > 0).length;
  }, [customers]);

  const inventoryAlerts = useMemo(() => {
    return (products || []).filter((p) => p.stock <= (p.minThreshold || 5)).length;
  }, [products]);

  const handleNav = (sectionId) => {
    if (soundEnabled) { try { soundEffects.playClick(); } catch (e) {} }
    setActiveSection(sectionId);
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Boxes },
    { id: 'inventory', label: 'Stock', icon: Package, badge: inventoryAlerts },
    { id: 'pos', label: null, icon: Plus, isPrimary: true },
    { id: 'udhaar', label: 'Udhaar', icon: CreditCard, badge: pendingDebtors },
    { id: 'analytics', label: 'Profit', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/[0.08] shadow-[0_-1px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-1px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around px-1 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id || activeSection === `${item.id}-section`;

          if (item.isPrimary) {
            return (
              <div key={item.id} className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={() => handleNav('pos')}
                  className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-md ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white scale-105'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100'
                  } ring-4 ring-white dark:ring-gray-950`}
                  aria-label="Express POS Billing"
                >
                  <Plus className="w-6 h-6 text-white dark:text-slate-950 stroke-[2.5]" />
                </button>
                <span className="text-[9px] font-bold text-slate-600 dark:text-gray-400 mt-1 uppercase tracking-wider">Billing</span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="flex flex-col items-center justify-center py-2.5 px-3 relative min-w-[52px] transition-all active:scale-95"
            >
              {/* Active indicator dot on top */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    key="dot"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-slate-900 dark:bg-white rounded-full"
                  />
                )}
              </AnimatePresence>

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all ${
                    isActive
                      ? 'text-slate-900 dark:text-white stroke-[2.5]'
                      : 'text-slate-400 dark:text-gray-500'
                  }`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-1 ring-white dark:ring-gray-950">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-semibold transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
