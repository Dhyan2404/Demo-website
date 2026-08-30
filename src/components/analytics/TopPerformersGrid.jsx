import React from 'react';
import { Crown, Flame, Trophy, Award, TrendingUp, DollarSign } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { computeTopProducts } from '../../utils/calculations.js';
import { formatCurrency, formatPercentage } from '../../utils/formatters.js';
import { Interactive3DCard } from '../3d/Interactive3DCard.jsx';

export const TopPerformersGrid = () => {
  const sales = useSalesStore((state) => state.sales);
  const products = useInventoryStore((state) => state.products);
  const currency = useThemeStore((state) => state.settings.currencySymbol || '₹');

  const { topProfitable, topSold, allPerformers } = computeTopProducts(sales, products);

  return (
    <div className="space-y-4">
      {/* Top 2 Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Most Profitable Product */}
        <Interactive3DCard glowColor="green" className="h-full">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-transparent flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">#1 Most Profitable Product</span>
                  <h4 className="text-lg font-extrabold text-white leading-snug mt-0.5">
                    {topProfitable?.name || 'No sales recorded yet'}
                  </h4>
                </div>
              </div>
              {topProfitable && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {topProfitable.sku}
                </span>
              )}
            </div>

            {topProfitable ? (
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">Total Profit</span>
                  <span className="font-extrabold text-emerald-400 text-base font-mono">
                    +{formatCurrency(topProfitable.totalProfit, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Revenue</span>
                  <span className="font-bold text-white font-mono">
                    {formatCurrency(topProfitable.totalRevenue, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Units Sold</span>
                  <span className="font-bold text-white font-mono">{topProfitable.unitsSold} units</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Record sales to calculate most profitable item.</p>
            )}
          </div>
        </Interactive3DCard>

        {/* Most Sold Product (Volume King) */}
        <Interactive3DCard glowColor="cyan" className="h-full">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-transparent flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">#1 Best Selling by Volume</span>
                  <h4 className="text-lg font-extrabold text-white leading-snug mt-0.5">
                    {topSold?.name || 'No sales recorded yet'}
                  </h4>
                </div>
              </div>
              {topSold && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {topSold.sku}
                </span>
              )}
            </div>

            {topSold ? (
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">Units Sold</span>
                  <span className="font-extrabold text-cyan-400 text-base font-mono">
                    {topSold.unitsSold} units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Total Revenue</span>
                  <span className="font-bold text-white font-mono">
                    {formatCurrency(topSold.totalRevenue, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Generated Profit</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    +{formatCurrency(topSold.totalProfit, currency)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Record sales to calculate volume leader.</p>
            )}
          </div>
        </Interactive3DCard>

      </div>

      {/* Top 5 Ranked Table */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">All Products Ranked by Net Profit Contribution</h4>
        
        <div className="space-y-2">
          {allPerformers.slice(0, 5).map((item, idx) => {
            const margin = item.totalRevenue > 0 ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(0) : 0;
            return (
              <div
                key={item.name}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-gray-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-400">{item.unitsSold} units sold • {margin}% avg margin</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-emerald-400 text-sm font-mono">
                    +{formatCurrency(item.totalProfit, currency)}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    Rev: {formatCurrency(item.totalRevenue, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
