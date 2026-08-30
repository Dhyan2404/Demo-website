import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { computeTopProducts } from '../../utils/calculations.js';
import { formatCurrency, formatCompactNumber } from '../../utils/formatters.js';

const PAYMENT_COLORS = {
  cash: '#22c55e',
  upi: '#06b6d4',
  card: '#a855f7',
  udhaar: '#f59e0b',
};

export const MarginBreakdownChart = () => {
  const sales = useSalesStore((state) => state.sales);
  const products = useInventoryStore((state) => state.products);
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');

  const { barData, pieData } = useMemo(() => {
    const { allPerformers } = computeTopProducts(sales, products);
    const bars = (allPerformers || []).slice(0, 5).map((p) => ({
      name: p.name.length > 14 ? `${p.name.slice(0, 14)}...` : p.name,
      fullName: p.name,
      Revenue: p.totalRevenue,
      Profit: p.totalProfit,
    }));

    // Payment method breakdown
    const paymentMap = { cash: 0, upi: 0, card: 0, udhaar: 0 };
    (sales || []).forEach((s) => {
      const method = s.paymentMethod || 'cash';
      if (paymentMap[method] !== undefined) {
        paymentMap[method] += Number(s.totalAmount) || 0;
      } else {
        paymentMap.cash += Number(s.totalAmount) || 0;
      }
    });

    const pies = [
      { name: 'Cash', value: paymentMap.cash, color: PAYMENT_COLORS.cash },
      { name: 'UPI Online', value: paymentMap.upi, color: PAYMENT_COLORS.upi },
      { name: 'Card', value: paymentMap.card, color: PAYMENT_COLORS.card },
      { name: 'Udhaar', value: paymentMap.udhaar, color: PAYMENT_COLORS.udhaar },
    ].filter((d) => d.value > 0);

    return { barData: bars, pieData: pies };
  }, [sales, products]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left 7 Cols: Top Products Revenue vs Profit Bar Chart */}
      <div className="lg:col-span-7 glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Revenue vs Profit Contribution</h4>
            <p className="text-xs text-gray-400">Comparing top volume earners against actual pocketed profit</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${currency}${formatCompactNumber(v)}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value, currency), '']}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Profit" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs">
              No sales data to plot chart yet.
            </div>
          )}
        </div>
      </div>

      {/* Right 5 Cols: Payment Methods Donut Chart */}
      <div className="lg:col-span-5 glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white tracking-tight">Payment Channel Split</h4>
            <p className="text-xs text-gray-400">Cash vs UPI vs Card vs Udhaar</p>
          </div>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value, currency), 'Volume']}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500 text-xs">No sales recorded yet.</div>
          )}
        </div>
      </div>

    </div>
  );
};
