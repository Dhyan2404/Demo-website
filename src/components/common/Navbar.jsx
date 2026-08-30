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
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from 'lucide-react';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { soundEffects } from '../../utils/soundEffects.js';

export const Navbar = () => {
  const activeSection = useScrollStore((state) => state.activeSection);
  const setActiveSection = useScrollStore((state) => state.setActiveSection);

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const fidelity3D = useThemeStore((state) => state.fidelity3D);
  const setFidelity3D = useThemeStore((state) => state.setFidelity3D);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);
  const toggleSound = useThemeStore((state) => state.toggleSound);

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

  const handleNavClick = (sectionId) => {
    if (soundEnabled) soundEffects.playClick();
    setActiveSection(sectionId);
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Boxes },
    { id: 'pos', label: 'POS Billing', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'udhaar', label: 'Udhaar CRM', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-8 py-2.5 sm:py-3 bg-white/80 dark:bg-gray-950/85 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Identity */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-glow-green group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[10px] flex items-center justify-center">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">
                {shopName}
              </span>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                PRO
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-gray-400 font-medium">Smart Inventory & Profit Suite</p>
          </div>
        </div>

        {/* Center: Desktop Nav Screen Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] p-1.5 rounded-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id || activeSection === `${link.id}-section`;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400 stroke-[2.5]' : 'text-slate-500 dark:text-gray-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search Shortcut */}
          <button
            onClick={() => openModal('quick_search')}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-gray-300 transition-all"
            title="Global Search (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400 dark:text-gray-400" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline text-[10px] bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-gray-400 font-mono">⌘K</kbd>
          </button>

          {/* Theme Mode Toggle (Sun/Moon) */}
          <button
            onClick={() => {
              toggleTheme();
              if (soundEnabled) soundEffects.playClick();
            }}
            className="p-2 sm:p-2.5 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all hover:scale-105 active:scale-95"
            title={isDarkMode ? 'Switch to Light (White) Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              toggleSound();
              if (!soundEnabled) soundEffects.playClick();
            }}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/10 text-slate-400 dark:text-gray-500'
            }`}
            title={soundEnabled ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted (Click to Unmute)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Stock Alert Bell */}
          <button
            onClick={() => handleNavClick('inventory')}
            className="relative p-2 sm:p-2.5 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all"
            title={`${totalAlerts} Low / Out-of-Stock Alerts`}
          >
            <Bell className="w-4 h-4 text-slate-400 dark:text-gray-400" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-gray-950 animate-pulse">
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-gray-300 transition-all"
            title={`3D Mode: ${fidelity3D.toUpperCase()}`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${fidelity3D === 'high' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400 dark:text-gray-500'}`} />
            <span className="uppercase text-[10px] font-bold text-slate-500 dark:text-gray-400">{fidelity3D}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => openModal('settings')}
            className="p-2 sm:p-2.5 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all"
            title="Shop Settings & Backup"
          >
            <Settings className="w-4 h-4 text-slate-400 dark:text-gray-400" />
          </button>

          {/* Primary Quick Sale Button */}
          <button
            onClick={() => handleNavClick('pos')}
            className="btn-shimmer hidden sm:flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white dark:text-gray-950 font-bold rounded-xl text-xs shadow-glow-green hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-white dark:text-gray-950" />
            <span className="font-extrabold">+ Express POS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
