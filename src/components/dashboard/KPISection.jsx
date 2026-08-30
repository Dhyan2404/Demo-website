import React, { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Package,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '../common/StatCard.jsx';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useScrollStore } from '../../store/useScrollStore.js';
import { formatCurrency } from '../../utils/formatters.js';

export const KPISection = () => {
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');
  const setActiveSection = useScrollStore((state) => state.setActiveSection);

  const sales = useSalesStore((state) => state.sales);
  const customers = useCustomerStore((state) => state.customers);
  const products = useInventoryStore((state) => state.products);

  // 1. Total Cumulative Sales & Net Profit
  const { totalRevenue, totalNetProfit, overallMargin } = useMemo(() => {
    const rev = (sales || []).reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const cost = (sales || []).reduce((sum, s) => sum + (Number(s.totalCost) || 0), 0);
    const profit = rev - cost;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;
    return { totalRevenue: rev, totalNetProfit: profit, overallMargin: margin };
  }, [sales]);

  // 2. Pending Udhaar / Market Debt
  const { totalMarketDebt, debtorsCount } = useMemo(() => {
    const debtors = (customers || []).filter((c) => (Number(c.currentBalance) || 0) > 0);
    const debt = debtors.reduce((sum, c) => sum + (Number(c.currentBalance) || 0), 0);
    return { totalMarketDebt: debt, debtorsCount: debtors.length };
  }, [customers]);

  // 3. Inventory Asset Value
  const { totalInventoryValue, totalUnits } = useMemo(() => {
    const value = (products || []).reduce(
      (sum, p) => sum + (Number(p.costPrice) || 0) * Math.max(0, Number(p.stock) || 0),
      0
    );
    const units = (products || []).reduce((sum, p) => sum + Math.max(0, Number(p.stock) || 0), 0);
    return { totalInventoryValue: value, totalUnits: units };
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Total Net Profit */}
      <StatCard
        title="Total Net Profit"
        formattedValue={formatCurrency(totalNetProfit, currency)}
        subtitle={`${overallMargin.toFixed(1)}% Realized Margin`}
        icon={TrendingUp}
        color="green"
        trend={12.4}
        trendLabel="growth"
        onClick={() => setActiveSection('analytics')}
      />

      {/* 2. Total Gross Sales */}
      <StatCard
        title="Gross Sales (Revenue)"
        formattedValue={formatCurrency(totalRevenue, currency)}
        subtitle={`${(sales || []).length} Invoices Billed`}
        icon={DollarSign}
        color="cyan"
        trend={8.2}
        trendLabel="volume"
        onClick={() => setActiveSection('pos')}
      />

      {/* 3. Market Udhaar / Credit */}
      <StatCard
        title="Market Udhaar (Receivable)"
        formattedValue={formatCurrency(totalMarketDebt, currency)}
        subtitle={`${debtorsCount} Customers with Pending Debt`}
        icon={CreditCard}
        color={totalMarketDebt > 10000 ? 'amber' : 'rose'}
        onClick={() => setActiveSection('udhaar')}
      />

      {/* 4. Total Stock Asset Value */}
      <StatCard
        title="Stock Asset Value (Cost)"
        formattedValue={formatCurrency(totalInventoryValue, currency)}
        subtitle={`${totalUnits} Total Units in Store`}
        icon={Package}
        color="purple"
        onClick={() => setActiveSection('inventory')}
      />
    </div>
  );
};
