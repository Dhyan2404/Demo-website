import React, { useEffect, useMemo } from 'react';
import {
  Boxes,
  PlusCircle,
  Search,
  Bell,
  Sparkles,
  Settings,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Package,
} from 'lucide-react';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';

export const Navbar = () => {
  const activeSection = useScrollStore((state) => state.activeSection);
  const setActiveSection = useScrollStore((state) => state.setActiveSection);

  const fidelity3D = useThemeStore((state) => state.fidelity3D);
  const setFidelity3D = useThemeStore((state) => state.setFidelity3D);
  const openModal = useThemeStore((state) => state.openModal);
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');

  const products = useInventoryStore((state) => state.products);

  const totalAlerts = useMemo(() => {
    return (products || []).filter((p) => p.stock <= (p.minThreshold || 5)).length;
  }, [products]);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openModal('quick_search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Boxes },
    { id: 'pos', label: 'POS Billing', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'udhaar', label: 'Udhaar CRM', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-8 py-2.5 sm:py-3 bg-gray-950/85 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Identity */}
        <div
          onClick={() => setActiveSection('dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 p-0.5 shadow-glow-green group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white tracking-tight text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">
                {shopName}
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                3D PRO
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-gray-400 font-medium">Smart Inventory & Profit Suite</p>
          </div>
        </div>

        {/* Center: Desktop Nav Screen Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1.5 rounded-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id || activeSection === `${link.id}-section`;
            return (
              <button
                key={link.id}
                onClick={() => setActiveSection(link.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 stroke-[2.5]' : 'text-gray-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Search Shortcut */}
          <button
            onClick={() => openModal('quick_search')}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-xs text-gray-300 transition-all hover:border-white/20"
            title="Global Search (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-mono">⌘K</kbd>
          </button>

          {/* Stock Alert Bell */}
          <button
            onClick={() => setActiveSection('inventory')}
            className="relative p-2 sm:p-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-gray-300 transition-all"
            title={`${totalAlerts} Low / Out-of-Stock Alerts`}
          >
            <Bell className="w-4 h-4 text-gray-400" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-gray-950 animate-pulse">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* 3D Fidelity Mode Switcher */}
          <button
            onClick={() => {
              const modes = ['high', 'lite', 'off'];
              const next = modes[(modes.indexOf(fidelity3D) + 1) % modes.length];
              setFidelity3D(next);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-xs text-gray-300 transition-all"
            title={`3D Graphics Fidelity: ${fidelity3D.toUpperCase()}`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${fidelity3D === 'high' ? 'text-cyan-400' : 'text-gray-500'}`} />
            <span className="uppercase text-[10px] font-bold text-gray-400">{fidelity3D}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => openModal('settings')}
            className="p-2 sm:p-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-gray-300 transition-all"
            title="Shop Settings & Backup"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>

          {/* Primary Quick Sale Button (Switches to POS screen) */}
          <button
            onClick={() => setActiveSection('pos')}
            className="hidden sm:flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-bold rounded-xl text-xs shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4 text-gray-950" />
            <span className="font-extrabold">+ Express POS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
