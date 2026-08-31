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
  Users,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Crown,
  Cloud,
} from 'lucide-react';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useFirebase } from '../../context/FirebaseContext.jsx';
import { soundEffects } from '../../utils/soundEffects.js';

export const Navbar = () => {
  const activeSection = useScrollStore((state) => state.activeSection);
  const setActiveSection = useScrollStore((state) => state.setActiveSection);

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);
  const toggleSound = useThemeStore((state) => state.toggleSound);
  const fidelity3D = useThemeStore((state) => state.fidelity3D);
  const setFidelity3D = useThemeStore((state) => state.setFidelity3D);
  const showToast = useThemeStore((state) => state.showToast);

  const openModal = useThemeStore((state) => state.openModal);
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');

  const { cloudStatus, user } = useFirebase();

  const products = useInventoryStore((state) => state.products || []);

  const totalAlerts = useMemo(() => {
    return (products || []).filter((p) => p.stock <= (p.minThreshold || 5)).length;
  }, [products]);

  const cycle3DMode = () => {
    const nextMode = fidelity3D === 'off' ? 'high' : fidelity3D === 'high' ? 'lite' : 'off';
    setFidelity3D(nextMode);
    if (soundEnabled) soundEffects.playClick();
    const label =
      nextMode === 'high'
        ? '3D High Mode (Full Scene & Sparkles)'
        : nextMode === 'lite'
        ? '3D Lite Mode (Low GPU)'
        : '3D Mode OFF (Fast 2D)';
    showToast(`3D Mode: ${label}`, nextMode === 'off' ? 'info' : 'success');
  };

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
    { id: 'employees', label: 'Staff & Payroll', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-8 py-2.5 sm:py-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left: Minimalist Brand Identity - Click to Open Settings / Shop Switcher */}
        <button
          type="button"
          onClick={() => {
            if (soundEnabled) soundEffects.playClick();
            openModal('settings');
          }}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 text-left bg-transparent border-0 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all focus:outline-none min-h-[44px]"
          title="Click to change Shop Type, Store Name or Settings"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-gray-950 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400 group-hover:text-white transition-all shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div className="min-w-0 max-w-[130px] sm:max-w-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {shopName}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-gray-200 transition-colors hidden sm:block truncate">
              Click to Switch Shop / Settings
            </p>
          </div>
        </button>

        {/* Center: Clean Segmented Navigation Tabs for Desktop */}
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-gray-300 transition-all cursor-pointer min-h-[40px] min-w-[40px] justify-center"
            title="Global Search (Ctrl+K)"
            aria-label="Quick Search"
          >
            <Search className="w-4 h-4 text-slate-600 dark:text-gray-300" />
            <span className="hidden md:inline font-medium text-slate-600 dark:text-gray-400">Search...</span>
            <kbd className="hidden md:inline text-[10px] bg-slate-200/80 dark:bg-white/10 px-1 py-0.5 rounded font-mono">⌘K</kbd>
          </button>

          {/* 3D Visuals Switcher Button (Desktop & Tablet) */}
          <button
            onClick={cycle3DMode}
            className={`hidden md:flex px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer items-center gap-1.5 ${
              fidelity3D !== 'off'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm ring-1 ring-cyan-500/50'
                : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={`3D Visuals: ${fidelity3D.toUpperCase()} (Click to toggle Off / Lite / High)`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${fidelity3D !== 'off' ? 'text-cyan-400 animate-spin-slow' : 'text-slate-400'}`} />
            <span className="font-mono text-[10px] font-bold uppercase">{fidelity3D === 'off' ? '3D: OFF' : `3D: ${fidelity3D}`}</span>
          </button>

          {/* Theme Mode Toggle (Sun/Moon) - Prominent & 1-tap accessible everywhere */}
          <button
            onClick={() => {
              toggleTheme();
              if (soundEnabled) soundEffects.playClick();
              showToast(isDarkMode ? 'Switched to Light Theme' : 'Switched to Dark Theme', 'info');
            }}
            className="p-2 sm:p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/15 rounded-xl text-slate-800 dark:text-gray-200 transition-all cursor-pointer flex items-center justify-center min-h-[40px] min-w-[40px] active:scale-95 shadow-xs"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 fill-amber-400/20 stroke-[2.2]" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-indigo-700 fill-indigo-700/20 stroke-[2.2]" />
            )}
          </button>

          {/* Sound FX Toggle (Desktop) */}
          <button
            onClick={() => {
              toggleSound();
              if (!soundEnabled) soundEffects.playClick();
            }}
            className="hidden sm:flex p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all cursor-pointer"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {/* Stock Alert Bell */}
          <button
            onClick={() => handleNavClick('inventory')}
            className="relative p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title={`${totalAlerts} Low / Out-of-Stock Alerts`}
            aria-label="Stock Alerts"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-gray-400" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-gray-950">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Firebase Cloud Sync Status */}
          <button
            onClick={() => openModal('settings')}
            className="relative p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title={`Firebase Firestore: ${cloudStatus === 'connected' ? 'Cloud Synced & Live' : cloudStatus === 'syncing' ? 'Syncing...' : 'Ready'} (Click to view Cloud settings)`}
            aria-label="Cloud Sync Status"
          >
            <Cloud className={`w-4 h-4 ${cloudStatus === 'connected' ? 'text-emerald-500' : cloudStatus === 'syncing' ? 'text-amber-500 animate-pulse' : 'text-slate-400 dark:text-gray-500'}`} />
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-950 ${cloudStatus === 'connected' ? 'bg-emerald-500' : cloudStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => openModal('settings')}
            className="p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-gray-300 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Shop Settings & Backup"
            aria-label="Shop Settings"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-gray-400" />
          </button>

          {/* Express POS Button (Desktop) */}
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
