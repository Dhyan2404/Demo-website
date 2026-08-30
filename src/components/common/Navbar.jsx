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
  Crown,
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
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);
  const toggleSound = useThemeStore((state) => state.toggleSound);

  const openModal = useThemeStore((state) => state.openModal);
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');

  const products = useInventoryStore((state) => state.products || []);

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
    { id: 'pos', label: 'Billing POS', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'udhaar', label: 'Udhaar CRM', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Minimalist Brand Identity */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-gray-950 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight truncate">
                {shopName}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Segmented Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] p-1 rounded-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id || activeSection === `${link.id}-section`;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-white/10 text-slate-950 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/10'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-gray-500'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Clean Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search Button */}
          <button
            onClick={() => openModal('quick_search')}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-600 dark:text-gray-400 transition-all cursor-pointer"
            title="Global Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-medium">Search...</span>
            <kbd className="hidden md:inline text-[10px] bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded font-mono">⌘K</kbd>
          </button>

          {/* Theme Mode Toggle (Sun/Moon) */}
          <button
            onClick={() => {
              toggleTheme();
              if (soundEnabled) soundEffects.playClick();
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              toggleSound();
              if (!soundEnabled) soundEffects.playClick();
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all cursor-pointer"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {/* Stock Alert Bell */}
          <button
            onClick={() => handleNavClick('inventory')}
            className="relative p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all cursor-pointer"
            title={`${totalAlerts} Low / Out-of-Stock Alerts`}
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-gray-400" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-gray-950">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => openModal('settings')}
            className="p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all cursor-pointer"
            title="Shop Settings & Backup"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-gray-400" />
          </button>

          {/* Express POS Button */}
          <button
            onClick={() => handleNavClick('pos')}
            className="btn-shimmer hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ POS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
