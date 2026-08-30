import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  formattedValue,
  subtitle,
  icon: Icon,
  trend,
  trendLabel = 'vs last period',
  color = 'green',
  onClick,
}) => {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? value : 0);

  // Smooth animated counter
  useEffect(() => {
    if (typeof value !== 'number') return;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    let frameId;
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(end * ease));
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else setDisplayValue(end);
    };
    frameId = requestAnimationFrame(animate);
    return () => { if (frameId) cancelAnimationFrame(frameId); };
  }, [value]);

  const colorMap = {
    green: {
      icon: 'text-emerald-600 dark:text-emerald-400',
      value: 'text-slate-900 dark:text-white',
      dot: 'bg-emerald-500',
      trend: 'text-emerald-600 dark:text-emerald-400',
    },
    cyan: {
      icon: 'text-cyan-600 dark:text-cyan-400',
      value: 'text-slate-900 dark:text-white',
      dot: 'bg-cyan-500',
      trend: 'text-cyan-600 dark:text-cyan-400',
    },
    amber: {
      icon: 'text-amber-600 dark:text-amber-400',
      value: 'text-slate-900 dark:text-white',
      dot: 'bg-amber-500',
      trend: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      icon: 'text-rose-600 dark:text-rose-400',
      value: 'text-slate-900 dark:text-white',
      dot: 'bg-rose-500',
      trend: 'text-rose-600 dark:text-rose-400',
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      value: 'text-slate-900 dark:text-white',
      dot: 'bg-purple-500',
      trend: 'text-purple-600 dark:text-purple-400',
    },
  };

  const styles = colorMap[color] || colorMap.green;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      className="glass-panel p-4 sm:p-5 rounded-2xl h-full flex flex-col justify-between cursor-pointer border border-slate-200/80 dark:border-white/[0.06] transition-all shadow-sm hover:border-slate-300 dark:hover:border-white/15 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{title}</p>
          <h4 className={`text-xl sm:text-2xl font-black tracking-tight mt-1.5 font-mono ${styles.value}`}>
            {formattedValue !== undefined ? formattedValue : displayValue.toLocaleString()}
          </h4>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center shrink-0 ${styles.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-500 dark:text-gray-400 font-medium text-[11px]">{subtitle}</span>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 font-semibold ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Math.abs(trend)}% {trendLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
