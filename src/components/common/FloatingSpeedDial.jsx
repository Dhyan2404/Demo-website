import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  ShoppingBag,
  Package,
  UserPlus,
  Calculator,
  Scan,
  Keyboard,
  Crown,
  Sparkles,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore.js';
import { soundEffects } from '../../utils/soundEffects.js';

export const FloatingSpeedDial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useThemeStore((state) => state.openModal);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);

  const toggleDial = () => {
    if (soundEnabled) soundEffects.playClick();
    setIsOpen(!isOpen);
  };

  const handleAction = (modalName) => {
    if (soundEnabled) soundEffects.playClick();
    openModal(modalName);
    setIsOpen(false);
  };

  const actions = [
    { id: 'welcome_intro', label: 'Welcome Tour & Showcase', icon: Crown, color: 'bg-amber-500 text-slate-950 shadow-glow-gold' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts (Hotkeys)', icon: Keyboard, color: 'bg-indigo-600 text-white' },
    { id: 'profit_simulator', label: 'Profit & Margin Simulator', icon: Calculator, color: 'bg-teal-600 text-white' },
    { id: 'barcode_generator', label: 'Print Barcode Stickers', icon: Scan, color: 'bg-cyan-600 text-white' },
    { id: 'customer_form', label: '+ Add Customer Account', icon: UserPlus, color: 'bg-amber-600 text-white' },
    { id: 'product_form', label: '+ Add Inventory Product', icon: Package, color: 'bg-emerald-600 text-white' },
    { id: 'pos', label: '⚡ Express POS Billing', icon: ShoppingBag, color: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black' },
  ];

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 sm:right-8 z-40 flex flex-col items-end pointer-events-auto">
      {/* Expanded Speed Dial Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-3 flex flex-col items-end gap-2"
          >
            {actions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <motion.button
                  key={act.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => handleAction(act.id)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-300 dark:border-white/15 shadow-xl hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-gray-200 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                    {act.label}
                  </span>
                  <div className={`p-2 rounded-xl ${act.color} shadow-sm shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <button
        onClick={toggleDial}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer border-2 border-white dark:border-gray-900 ${
          isOpen
            ? 'bg-rose-500 text-white rotate-45 shadow-rose-500/40'
            : 'btn-shimmer bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 shadow-glow-gold'
        }`}
        title="Royal Speed Dial Tools"
        aria-label="Quick Actions Speed Dial"
      >
        <Plus className={`w-7 h-7 text-slate-950 transition-transform duration-300 ${isOpen ? 'text-white' : 'stroke-[3]'}`} />
      </button>
    </div>
  );
};
