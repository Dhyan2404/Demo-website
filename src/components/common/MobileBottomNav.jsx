import React, { useMemo } from 'react';
import {
  Boxes,
  ShoppingBag,
  Package,
  CreditCard,
  BarChart3,
  Plus,
} from 'lucide-react';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';

export const MobileBottomNav = () => {
  const activeSection = useScrollStore((state) => state.activeSection);
  const scrollToSection = useScrollStore((state) => state.scrollToSection);
  const openModal = useThemeStore((state) => state.openModal);

  const customers = useCustomerStore((state) => state.customers);
  const products = useInventoryStore((state) => state.products);

  const pendingDebtors = useMemo(() => {
    return (customers || []).filter((c) => (c.currentBalance || 0) > 0).length;
  }, [customers]);

  const inventoryAlerts = useMemo(() => {
    return (products || []).filter((p) => p.stock <= (p.minThreshold || 5)).length;
  }, [products]);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Boxes },
    { id: 'inventory-section', label: 'Stock', icon: Package, badge: inventoryAlerts },
    { id: 'pos-fab', label: 'New Sale', icon: Plus, isAction: true },
    { id: 'udhaar-section', label: 'Udhaar', icon: CreditCard, badge: pendingDebtors },
    { id: 'analytics-section', label: 'Profit', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-3 pb-safe pt-2 bg-gray-950/90 backdrop-blur-2xl border-t border-white/[0.1] shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          if (item.isAction) {
            return (
              <div key={item.id} className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => openModal('pos')}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300 text-gray-950 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all border-2 border-gray-950"
                  aria-label="New Sale Counter"
                >
                  <Plus className="w-7 h-7 text-gray-950 stroke-[3]" />
                </button>
                <span className="text-[10px] font-bold text-emerald-400 mt-1 uppercase tracking-tight">
                  + Sale
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400 stroke-[2.5]' : 'text-gray-400'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 bg-amber-500 text-gray-950 rounded-full text-[9px] font-black flex items-center justify-center ring-1 ring-gray-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 shadow-[0_0_8px_rgba(34,197,94,1)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
