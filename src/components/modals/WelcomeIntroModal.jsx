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
  CheckCircle2,
  X,
  BarChart3,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore.js';
import { soundEffects } from '../../utils/soundEffects.js';

// Minimal confetti implementation (no external dep)
function launchConfetti() {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f59e0b', '#10b981', '#06b6d4', '#a78bfa', '#fbbf24'];
    const pieces = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * canvas.width,
      y: -10,
      r: Math.random() * 7 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      alpha: 1,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.012;
        if (p.alpha > 0) {
          alive = true;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      if (alive) {
        frame = requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    };
    draw();
    return () => { cancelAnimationFrame(frame); canvas.remove(); };
  } catch (e) {}
}

// Page entry animation variants for reuse
export const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } },
};

// List stagger animation for cards/rows
export const listVariants = {
  animate: { transition: { staggerChildren: 0.055 } },
};

export const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } },
};

const features = [
  {
    icon: Zap,
    title: '2-Second Express POS Billing',
    desc: 'Instant calculation, auto-tax, and 1-tap thermal receipt printing for every transaction.',
    tag: 'Ultra Fast',
    accent: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Live Net Profit Calculations',
    desc: 'Every sale shows real cost basis vs. net margin, updated live without any setup.',
    tag: 'Real-Time',
    accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: CreditCard,
    title: 'Smart Udhaar & WhatsApp Reminders',
    desc: 'Track customer credit balances and send 1-tap personalized payment reminders.',
    tag: 'Automated CRM',
    accent: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: ShieldCheck,
    title: '100% Offline Resilient Storage',
    desc: 'All data lives safely on your device. Zero internet dependency, zero risk.',
    tag: 'Enterprise Safe',
    accent: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
];

export const WelcomeIntroModal = ({ isOpen, onClose }) => {
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const soundEnabled = useThemeStore((state) => state.soundEnabled ?? true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      if (soundEnabled) {
        try { soundEffects.playSuccessChime(); } catch (e) {}
      }
      launchConfetti();
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
        {/* Minimalist dark backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        />

        {/* Clean floating card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 30, stiffness: 380, mass: 0.8 }}
          className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-3xl border border-slate-200/80 dark:border-white/[0.09] shadow-2xl z-10 my-auto overflow-hidden"
        >
          {/* Thin animated top accent line */}
          <div className="h-0.5 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500 w-full" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-500 dark:text-gray-400 transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3 }}
              className="space-y-2"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Smart Retail Suite</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome to{' '}
                <span className="gold-gradient-text">{shopName}</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                Everything you need to run your shop — billing, inventory, profit tracking, and customer ledger in one place.
              </p>
            </motion.div>

            {/* Feature Grid */}
            <motion.div
              variants={listVariants}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            >
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    variants={itemVariants}
                    className={`p-4 rounded-2xl border bg-slate-50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/15 transition-all ${feat.accent.split(' ').slice(2).join(' ')} border-slate-200/80 dark:border-white/[0.06]`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${feat.accent.split(' ').slice(1, 3).join(' ')}`}>
                        <Icon className={`w-3.5 h-3.5 ${feat.accent.split(' ')[0]}`} />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${feat.accent.split(' ')[0]}`}>
                        {feat.tag}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{feat.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-snug">{feat.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.28 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]"
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>All systems ready • 100% offline active</span>
              </div>
              <button
                onClick={() => {
                  if (soundEnabled) { try { soundEffects.playClick(); } catch (e) {} }
                  onClose();
                }}
                className="btn-shimmer w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>Open Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
