import React, { useMemo } from 'react';
import {
  Boxes,
  ShoppingBag,
  Package,
  CreditCard,
  BarChart3,
  Users,
  Menu,
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

  const toggleMobileDrawer = useThemeStore((state) => state.toggleMobileDrawer);
  const isMobileDrawerOpen = useThemeStore((state) => state.isMobileDrawerOpen);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);

  const customers = useCustomerStore((state) => state.customers);
  const products = useInventoryStore((state) => state.products);

  const pendingDebtors = useMemo(() => {
    return (customers || []).filter((c) => (c.currentBalance || 0) > 0).length;
  }, [customers]);

  const inventoryAlerts = useMemo(() => {
    return (products || []).filter((p) => p.stock <= (p.minThreshold || 5)).length;
  }, [products]);

  const handleNav = (id) => {
    if (soundEnabled) {
      try { soundEffects.playClick(); } catch (e) {}
    }
    setActiveSection(id);
  };

  const handleOpenMenu = () => {
    if (soundEnabled) {
      try { soundEffects.playClick(); } catch (e) {}
    }
    toggleMobileDrawer();
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Boxes },
    { id: 'inventory', label: 'Stock', icon: Package, badge: inventoryAlerts },
    { id: 'pos', label: 'Billing', icon: Plus, isAction: true },
    { id: 'udhaar', label: 'Udhaar', icon: CreditCard, badge: pendingDebtors },
    { id: 'employees', label: 'Staff', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-2 pb-safe pt-1.5 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] shadow-[0_-10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex items-center justify-between px-1 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id || activeSection === `${item.id}-section`;

          if (item.isAction) {
            return (
              <div key={item.id} className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={() => handleNav('pos')}
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all border-2 border-white dark:border-gray-950 shadow-lg active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 scale-105 ring-2 ring-emerald-500'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 shadow-glow-gold'
                  }`}
                  aria-label="Express POS Billing"
                >
                  <Plus className="w-6 h-6 stroke-[3]" />
                </button>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-tight">
                  + POS
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer min-h-[44px] min-w-[44px] ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400 stroke-[2.4]' : 'text-slate-400 dark:text-gray-400'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 bg-amber-500 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-1 ring-white dark:ring-gray-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More / Menu Drawer Trigger */}
        <button
          onClick={handleOpenMenu}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer min-h-[44px] min-w-[44px] ${
            isMobileDrawerOpen
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
          }`}
          aria-label="Open More Menu"
        >
          <div className="relative">
            <Menu className="w-5 h-5 text-slate-400 dark:text-gray-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};

