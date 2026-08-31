import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Search,
  Settings,
  Boxes,
  Package,
  CreditCard,
  Users,
  BarChart3,
  PlusCircle,
  Sparkles,
  Cloud,
  FileSpreadsheet,
  Scan,
  Calculator,
  UserPlus,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useFirebase } from '../../context/FirebaseContext.jsx';
import { soundEffects } from '../../utils/soundEffects.js';

export const MobileActionDrawer = () => {
  const isMobileDrawerOpen = useThemeStore((state) => state.isMobileDrawerOpen);
  const setMobileDrawerOpen = useThemeStore((state) => state.setMobileDrawerOpen);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);
  const toggleSound = useThemeStore((state) => state.toggleSound);
  const openModal = useThemeStore((state) => state.openModal);
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const showToast = useThemeStore((state) => state.showToast);

  const setActiveSection = useScrollStore((state) => state.setActiveSection);
  const { cloudStatus } = useFirebase();

  const handleNav = (sectionId) => {
    if (soundEnabled) soundEffects.playClick();
    setActiveSection(sectionId);
    setMobileDrawerOpen(false);
  };

  const handleModal = (modalName, data = null) => {
    if (soundEnabled) soundEffects.playClick();
    openModal(modalName, data);
    setMobileDrawerOpen(false);
  };

  return (
    <AnimatePresence>
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-white/10 rounded-t-3xl p-5 shadow-2xl z-10"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-gray-950 flex items-center justify-center font-bold">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{shopName}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">Mobile Hub & Controls</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
                aria-label="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Toggles: Theme & Sound (High Prominence) */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              <button
                onClick={() => {
                  toggleTheme();
                  if (soundEnabled) soundEffects.playClick();
                  showToast(isDarkMode ? 'Switched to Light Theme' : 'Switched to Dark Theme', 'info');
                }}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                  isDarkMode
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4.5 h-4.5 text-amber-400 fill-amber-400/20" />
                    <span>Theme: Dark</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4.5 h-4.5 text-indigo-600 fill-indigo-600/20" />
                    <span>Theme: Light</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  toggleSound();
                  if (!soundEnabled) soundEffects.playClick();
                }}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                }`}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-4.5 h-4.5" />
                    <span>Audio: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4.5 h-4.5" />
                    <span>Audio: Mute</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">
                Quick Shop Actions
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <button
                  onClick={() => handleModal('quick_search')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5"
                >
                  <Search className="w-5 h-5 text-slate-700 dark:text-gray-300 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-gray-300">Search</span>
                </button>

                <button
                  onClick={() => handleModal('product_form')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                >
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">+ Item</span>
                </button>

                <button
                  onClick={() => handleModal('customer_form')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20"
                >
                  <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" />
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300">+ Debtor</span>
                </button>

                <button
                  onClick={() => handleModal('settings')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5"
                >
                  <Settings className="w-5 h-5 text-slate-700 dark:text-gray-300 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-gray-300">Settings</span>
                </button>
              </div>
            </div>

            {/* Navigation Destinations */}
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-2">
                All Modules
              </p>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleNav('employees')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Staff & Employee Payroll</span>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">Attendance, salary calculation & UPI pay</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">Open</span>
                </button>

                <button
                  onClick={() => handleNav('analytics')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">10+ Financial Analytics</span>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">Margin health, dead stock & sales targets</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">Open</span>
                </button>

                <button
                  onClick={() => handleNav('udhaar')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Udhaar Credit Ledger</span>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">Customer balances & WhatsApp reminders</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">Open</span>
                </button>
              </div>
            </div>

            {/* Smart Tools */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleModal('profit_simulator')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-xs font-semibold"
              >
                <Calculator className="w-4 h-4 text-emerald-500" />
                <span>Profit Calculator</span>
              </button>

              <button
                onClick={() => handleModal('barcode_generator')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-xs font-semibold"
              >
                <Scan className="w-4 h-4 text-cyan-500" />
                <span>Barcode Stickers</span>
              </button>
            </div>

            {/* Cloud Status Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Cloud className={`w-3.5 h-3.5 ${cloudStatus === 'connected' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>Firestore Cloud: {cloudStatus === 'connected' ? 'Connected' : 'Offline Cache Ready'}</span>
              </div>
              <span className="font-mono text-[10px]">v2.5 PRO</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
