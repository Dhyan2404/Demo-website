import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Sparkles,
  Zap,
  ShoppingBag,
  Package,
  CreditCard,
  BarChart3,
  Search,
  Settings,
  Plus,
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { soundEffects } from '../../utils/soundEffects.js';

export const ShortcutsModal = ({ isOpen, onClose }) => {
  const setActiveSection = useScrollStore((state) => state.setActiveSection);
  const openModal = useThemeStore((state) => state.openModal);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);
  const [pressedKey, setPressedKey] = useState(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toUpperCase();
      setPressedKey(k);
      setTimeout(() => setPressedKey(null), 300);
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: 'Quick Navigation',
      items: [
        { key: '1', action: 'Dashboard Home', run: () => { setActiveSection('dashboard'); onClose(); } },
        { key: '2', action: 'Express POS Terminal', run: () => { setActiveSection('pos'); onClose(); } },
        { key: '3', action: 'Inventory & Stock Control', run: () => { setActiveSection('inventory'); onClose(); } },
        { key: '4', action: 'Customer Udhaar Ledger', run: () => { setActiveSection('udhaar'); onClose(); } },
        { key: '5', action: 'Profit Analytics & ROI', run: () => { setActiveSection('analytics'); onClose(); } },
      ],
    },
    {
      group: 'Instant Creation & Tools',
      items: [
        { key: 'P', action: '+ Add New Product', run: () => { onClose(); openModal('product_form'); } },
        { key: 'C', action: '+ Add Customer Account', run: () => { onClose(); openModal('customer_form'); } },
        { key: 'B', action: 'Barcode Sticker Generator', run: () => { onClose(); openModal('barcode_generator'); } },
        { key: 'M', action: 'Margin & Profit Simulator', run: () => { onClose(); openModal('profit_simulator'); } },
        { key: 'S', action: 'Shop & System Settings', run: () => { onClose(); openModal('settings'); } },
        { key: 'T', action: 'Toggle Dark / Light Theme', run: () => { toggleTheme(); if (soundEnabled) soundEffects.playClick(); } },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts Command Center"
      subtitle="Supercharge your store billing speed with zero-mouse keyboard hotkeys"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Live Key Press Feedback Ribbon */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Interactive Live Key Listener Active:</span>
          </span>
          <span className="font-mono font-black text-slate-900 dark:text-white px-2.5 py-1 rounded-lg bg-white dark:bg-gray-900 border border-slate-300 dark:border-white/10 shadow-sm">
            {pressedKey ? `Key [${pressedKey}] Pressed` : 'Press any key...'}
          </span>
        </div>

        {/* Shortcuts Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shortcutGroups.map((group) => (
            <div key={group.group} className="space-y-2.5 p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                {group.group}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isMatch = pressedKey === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={item.run}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isMatch
                          ? 'bg-amber-500 text-slate-950 scale-105 font-black shadow-md'
                          : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="font-semibold">{item.action}</span>
                      <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-900 border border-slate-300 dark:border-white/20 font-mono font-black text-slate-900 dark:text-white shadow-sm text-[11px]">
                        {item.key}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-gray-400">
          <span>Tip: Press <kbd className="bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono font-bold">Ctrl + K</kbd> anywhere for Global Search</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 text-slate-700 dark:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
};
