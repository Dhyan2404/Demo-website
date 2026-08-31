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
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore.js';
import { soundEffects } from '../../utils/soundEffects.js';

const actions = [
  { id: 'welcome_intro',     label: 'Welcome Tour',        icon: Crown,       accent: 'bg-amber-500 text-slate-950' },
  { id: 'shortcuts',         label: 'Keyboard Shortcuts',  icon: Keyboard,    accent: 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' },
  { id: 'profit_simulator',  label: 'Profit Simulator',    icon: Calculator,  accent: 'bg-emerald-500 text-white' },
  { id: 'barcode_generator', label: 'Barcode Stickers',    icon: Scan,        accent: 'bg-cyan-500 text-white' },
  { id: 'customer_form',     label: 'Add Customer',        icon: UserPlus,    accent: 'bg-purple-500 text-white' },
  { id: 'product_form',      label: 'Add Product',         icon: Package,     accent: 'bg-slate-700 text-white' },
  { id: 'pos',               label: 'Express POS',         icon: ShoppingBag, accent: 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' },
];

export const FloatingSpeedDial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useThemeStore((state) => state.openModal);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);

  const toggle = () => {
    if (soundEnabled) { try { soundEffects.playClick(); } catch (e) {} }
    setIsOpen(!isOpen);
  };

  const handleAction = (id) => {
    if (soundEnabled) { try { soundEffects.playClick(); } catch (e) {} }
    openModal(id);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 sm:right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ type: 'spring', damping: 24, stiffness: 380 }}
            className="mb-3 flex flex-col items-end gap-1.5"
          >
            {actions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <motion.button
                  key={act.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: idx * 0.035, type: 'spring', damping: 22, stiffness: 350 }}
                  onClick={() => handleAction(act.id)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-xl text-xs font-semibold text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer group"
                >
                  <span>{act.label}</span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${act.accent}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={toggle}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors cursor-pointer border ${
          isOpen
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white'
            : 'btn-shimmer bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-glow-gold'
        }`}
        aria-label="Quick Actions"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </motion.button>
    </div>
  );
};
