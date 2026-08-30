import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Package,
  ShoppingBag,
  ArrowRight,
  Crown,
  CheckCircle2,
  Volume2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useThemeStore } from '../../store/useThemeStore.js';
import { soundEffects } from '../../utils/soundEffects.js';

export const WelcomeIntroModal = ({ isOpen, onClose }) => {
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (soundEnabled) {
        setTimeout(() => soundEffects.playSuccessChime(), 150);
      }
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#fbbf24'],
        });
      } catch (e) {}
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  const features = [
    {
      icon: Zap,
      title: '2-Second Express POS Billing',
      desc: 'Instant barcode scanner integration, auto tax calculation, and 1-tap thermal receipt printing.',
      color: 'from-amber-500 to-yellow-500',
      tag: 'Ultra-Fast',
    },
    {
      icon: TrendingUp,
      title: 'Live Net Profit & Margin Engine',
      desc: 'Every sale automatically calculates cost price vs retail price to show true net earnings in real-time.',
      color: 'from-emerald-500 to-teal-500',
      tag: 'Real-Time ROI',
    },
    {
      icon: CreditCard,
      title: 'Smart Udhaar & WhatsApp Reminders',
      desc: 'Track customer market credit balances and send 1-click personalized WhatsApp payment statements.',
      color: 'from-cyan-500 to-blue-500',
      tag: 'Automated CRM',
    },
    {
      icon: ShieldCheck,
      title: '100% Offline & Resilient Storage',
      desc: 'Zero server dependency required. All shop data stays completely safe on your local device.',
      color: 'from-purple-500 to-indigo-500',
      tag: 'Enterprise Safe',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop with ambient glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl"
        />

        {/* Modal Card with Golden Royal Border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 rounded-3xl border-2 border-amber-500/50 shadow-[0_0_60px_rgba(217,119,6,0.25)] dark:shadow-[0_0_60px_rgba(217,119,6,0.35)] overflow-hidden z-10 my-auto"
        >
          {/* Animated Top Golden Light Ray */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-emerald-400 animate-pulse" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-all cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header with Crown Emblem */}
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-glow-gold flex items-center justify-center"
              >
                <div className="w-full h-full bg-white dark:bg-gray-950 rounded-[22px] flex items-center justify-center">
                  <Crown className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-bounce-subtle" />
                </div>
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full gold-badge text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Retail Operating System</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome to <span className="gold-gradient-text">{shopName} Royal Pro</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 max-w-md mx-auto">
                The ultimate all-in-one platform for inventory valuation, express billing, and automated customer Udhaar ledger.
              </p>
            </div>

            {/* Feature Showcase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.08 }}
                    className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-amber-500/20 dark:border-white/10 hover:border-amber-500/50 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${feat.color} text-slate-950 shadow-sm`}>
                        <Icon className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                        {feat.tag}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                      {feat.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-snug">
                      {feat.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Launch Call-To-Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>All systems ready • 100% Offline Active</span>
              </div>

              <button
                onClick={() => {
                  if (soundEnabled) soundEffects.playAddToCart();
                  onClose();
                }}
                className="btn-shimmer w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Launch Royal Command Center</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3]" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
