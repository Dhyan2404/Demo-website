import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore.js';

export const NotificationToast = () => {
  const toast = useThemeStore((state) => state.toast);
  const clearToast = useThemeStore((state) => state.clearToast);

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const bgMap = {
    success: 'border-emerald-500/30 bg-gray-900/90 text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.2)]',
    warning: 'border-amber-500/30 bg-gray-900/90 text-amber-100 shadow-[0_10px_30px_rgba(245,158,11,0.2)]',
    error: 'border-rose-500/30 bg-gray-900/90 text-rose-100 shadow-[0_10px_30px_rgba(244,63,94,0.2)]',
    info: 'border-cyan-500/30 bg-gray-900/90 text-cyan-100 shadow-[0_10px_30px_rgba(6,182,212,0.2)]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-sm">
      <AnimatePresence>
        <motion.div
          key={toast.id || 'toast'}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-xl ${bgMap[toast.type] || bgMap.success}`}
        >
          {iconMap[toast.type] || iconMap.success}
          <div className="text-sm font-medium pr-2 text-gray-200">{toast.message}</div>
          <button
            onClick={clearToast}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
