import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Interactive3DCard } from '../3d/Interactive3DCard.jsx';

export const StatCard = ({
  title,
  value,
  formattedValue,
  subtitle,
  icon: Icon,
  trend,
  trendLabel = 'vs last period',
  color = 'green', // 'green' | 'cyan' | 'amber' | 'purple' | 'rose'
  onClick,
}) => {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? value : 0);

  // Animated counter for numbers
  useEffect(() => {
    if (typeof value !== 'number') return;
    let start = 0;
    const end = value;
    const duration = 500;
    const startTime = performance.now();
    let frameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value]);

  const colorStyles = {
    green: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'green',
      iconColor: 'text-emerald-400',
      valueColor: 'text-emerald-300',
    },
    cyan: {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'cyan',
      iconColor: 'text-cyan-400',
      valueColor: 'text-cyan-300',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'amber',
      iconColor: 'text-amber-400',
      valueColor: 'text-amber-300',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'rose',
      iconColor: 'text-rose-400',
      valueColor: 'text-rose-300',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'purple',
      iconColor: 'text-purple-400',
      valueColor: 'text-purple-300',
    },
  }[color] || colorStyles.green;

  return (
    <Interactive3DCard glowColor={colorStyles.glow} className="h-full">
      <div
        onClick={onClick}
        className="glass-panel p-4 sm:p-5 rounded-3xl h-full flex flex-col justify-between cursor-pointer border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent hover:bg-white/[0.06] transition-all shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
            <h4 className={`text-2xl sm:text-3xl font-black tracking-tight mt-1.5 font-mono ${colorStyles.valueColor}`}>
              {formattedValue !== undefined ? formattedValue : displayValue.toLocaleString()}
            </h4>
          </div>
          {Icon && (
            <div className={`p-3 rounded-2xl border ${colorStyles.bg} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
          {subtitle && <span className="text-gray-400 font-medium text-[11px] sm:text-xs">{subtitle}</span>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend)}% {trendLabel}</span>
            </div>
          )}
        </div>
      </div>
    </Interactive3DCard>
  );
};
