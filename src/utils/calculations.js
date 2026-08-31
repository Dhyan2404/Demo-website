/**
 * Round a currency number strictly to 2 decimal places to eliminate floating point drift
 */
export const roundCurrency = (val) => {
  const num = Number(val) || 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Calculate Margin % = ((Selling - Cost) / Selling) * 100
 */
export const calculateMargin = (costPrice, sellingPrice) => {
  const cost = Number(costPrice) || 0;
  const sell = Number(sellingPrice) || 0;
  if (sell <= 0) return 0;
  return Number((((sell - cost) / sell) * 100).toFixed(1));
};

/**
 * Calculate GST / Sales Tax amount
 */
export const calculateTaxAmount = (subtotal, taxRate = 0) => {
  const sub = Number(subtotal) || 0;
  const rate = Number(taxRate) || 0;
  if (sub <= 0 || rate <= 0) return 0;
  return roundCurrency((sub * rate) / 100);
};

/**
 * Calculate Grand Total with Tax and Discount
 */
export const calculateGrandTotal = (subtotal, taxRate = 0, discountAmount = 0) => {
  const sub = Number(subtotal) || 0;
  const tax = calculateTaxAmount(sub, taxRate);
  const disc = Number(discountAmount) || 0;
  return roundCurrency(Math.max(0, sub + tax - disc));
};

/**
 * Filter items by date period
 */
export const filterByPeriod = (items = [], period = '30days') => {
  if (!items || !items.length) return [];
  if (period === 'all') return items;

  const now = new Date();
  let cutoffDate;

  if (period === 'today') {
    cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (period === '7days') {
    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30days') {
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (period === '1year') {
    cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  } else {
    return items;
  }

  return items.filter(item => {
    const itemDate = new Date(item.createdAt || item.date);
    return !isNaN(itemDate.getTime()) && itemDate >= cutoffDate;
  });
};

/**
 * Aggregate sales into timeline chart points
 */
export const generateTimelineChartData = (sales = [], period = '30days') => {
  const filtered = filterByPeriod(sales, period);
  const map = {};

  filtered.forEach(sale => {
    const dateObj = new Date(sale.createdAt || sale.date || Date.now());
    let key;
    if (period === 'today') {
      key = `${String(dateObj.getHours()).padStart(2, '0')}:00`;
    } else {
      key = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    if (!map[key]) {
      map[key] = {
        name: key,
        revenue: 0,
        cost: 0,
        profit: 0,
        orders: 0,
      };
    }
    map[key].revenue = roundCurrency(map[key].revenue + (Number(sale.totalAmount) || 0));
    map[key].cost = roundCurrency(map[key].cost + (Number(sale.totalCost) || 0));
    map[key].profit = roundCurrency(map[key].profit + (Number(sale.netProfit) || 0));
    map[key].orders += 1;
  });

  return Object.values(map);
};

/**
 * Compute top performers from sales items (Key collision-safe by ID / SKU)
 */
export const computeTopProducts = (sales = [], products = []) => {
  const stats = {};

  (sales || []).forEach(sale => {
    (sale.items || []).forEach(item => {
      const idKey = item.productId || item.sku || item.name;
      if (!stats[idKey]) {
        stats[idKey] = {
          id: idKey,
          name: item.name,
          sku: item.sku || '',
          unitsSold: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
        };
      }
      const qty = Number(item.quantity) || 1;
      const sellPrice = Number(item.sellingPrice) || 0;
      const costPrice = Number(item.costPrice) || 0;
      const lineProfit = item.profit !== undefined ? Number(item.profit) : (sellPrice - costPrice) * qty;

      stats[idKey].unitsSold += qty;
      stats[idKey].totalRevenue = roundCurrency(stats[idKey].totalRevenue + sellPrice * qty);
      stats[idKey].totalCost = roundCurrency(stats[idKey].totalCost + costPrice * qty);
      stats[idKey].totalProfit = roundCurrency(stats[idKey].totalProfit + lineProfit);
    });
  });

  const list = Object.values(stats);
  const mostProfitable = [...list].sort((a, b) => b.totalProfit - a.totalProfit)[0] || null;
  const mostSold = [...list].sort((a, b) => b.unitsSold - a.unitsSold)[0] || null;

  return {
    topProfitable: mostProfitable,
    topSold: mostSold,
    allPerformers: list.sort((a, b) => b.totalProfit - a.totalProfit),
  };
};

/**
 * Generate Day-by-Day sales data for a specific Month and Year
 */
export const generateMonthDailySales = (sales = [], year = new Date().getFullYear(), month = new Date().getMonth()) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyMap = {};

  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = {
      day: d,
      dateLabel: `${d} ${new Date(year, month, d).toLocaleDateString('en-IN', { month: 'short' })}`,
      revenue: 0,
      cost: 0,
      profit: 0,
      orders: 0,
      itemsSold: 0,
    };
  }

  (sales || []).forEach(sale => {
    const saleDate = new Date(sale.createdAt || sale.date);
    if (!isNaN(saleDate.getTime())) {
      if (saleDate.getFullYear() === year && saleDate.getMonth() === month) {
        const d = saleDate.getDate();
        if (dailyMap[d]) {
          const rev = Number(sale.totalAmount) || 0;
          const cost = Number(sale.totalCost) || 0;
          const prof = Number(sale.netProfit) !== undefined ? Number(sale.netProfit) : rev - cost;
          const itemsCount = (sale.items || []).reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

          dailyMap[d].revenue = roundCurrency(dailyMap[d].revenue + rev);
          dailyMap[d].cost = roundCurrency(dailyMap[d].cost + cost);
          dailyMap[d].profit = roundCurrency(dailyMap[d].profit + prof);
          dailyMap[d].orders += 1;
          dailyMap[d].itemsSold += itemsCount;
        }
      }
    }
  });

  return Object.values(dailyMap);
};

/**
 * Generate Month-by-Month sales data for a full Year (Jan - Dec)
 */
export const generateYearMonthlySales = (sales = [], year = new Date().getFullYear()) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = months.map((name, index) => ({
    monthIndex: index,
    name,
    fullName: new Date(year, index, 1).toLocaleDateString('en-IN', { month: 'long' }),
    revenue: 0,
    cost: 0,
    profit: 0,
    orders: 0,
    itemsSold: 0,
  }));

  (sales || []).forEach(sale => {
    const saleDate = new Date(sale.createdAt || sale.date);
    if (!isNaN(saleDate.getTime()) && saleDate.getFullYear() === year) {
      const m = saleDate.getMonth();
      if (monthlyData[m]) {
        const rev = Number(sale.totalAmount) || 0;
        const cost = Number(sale.totalCost) || 0;
        const prof = Number(sale.netProfit) !== undefined ? Number(sale.netProfit) : rev - cost;
        const itemsCount = (sale.items || []).reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);

        monthlyData[m].revenue = roundCurrency(monthlyData[m].revenue + rev);
        monthlyData[m].cost = roundCurrency(monthlyData[m].cost + cost);
        monthlyData[m].profit = roundCurrency(monthlyData[m].profit + prof);
        monthlyData[m].orders += 1;
        monthlyData[m].itemsSold += itemsCount;
      }
    }
  });

  return monthlyData;
};

/**
 * Compute Peak Hours & Day-of-Week distribution
 */
export const generateTrafficHeatmap = (sales = []) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats = daysOfWeek.map((day) => ({ day, revenue: 0, orders: 0 }));

  const hourStats = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    hourNum: i,
    revenue: 0,
    orders: 0,
  }));

  (sales || []).forEach(sale => {
    const date = new Date(sale.createdAt || sale.date);
    if (!isNaN(date.getTime())) {
      const dayIdx = date.getDay();
      const hour = date.getHours();
      const rev = Number(sale.totalAmount) || 0;

      if (dayStats[dayIdx]) {
        dayStats[dayIdx].revenue = roundCurrency(dayStats[dayIdx].revenue + rev);
        dayStats[dayIdx].orders += 1;
      }
      if (hourStats[hour]) {
        hourStats[hour].revenue = roundCurrency(hourStats[hour].revenue + rev);
        hourStats[hour].orders += 1;
      }
    }
  });

  // Filter useful trading hours (e.g. 7 AM to 11 PM) for clean display
  const activeHours = hourStats.filter(h => h.hourNum >= 6 && h.hourNum <= 23);

  return { dayStats, hourStats: activeHours };
};

/**
 * Identify Dead / Slow Moving stock (Has inventory stock but zero/low recent sales)
 */
export const computeDeadStock = (products = [], sales = [], lookbackDays = 30) => {
  const cutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  const soldProductIds = new Set();

  (sales || []).forEach(s => {
    const sDate = new Date(s.createdAt || s.date);
    if (sDate >= cutoff) {
      (s.items || []).forEach(it => {
        if (it.productId) soldProductIds.add(it.productId);
        if (it.sku) soldProductIds.add(it.sku);
        if (it.name) soldProductIds.add(it.name);
      });
    }
  });

  const deadItems = [];
  let totalTiedCapital = 0;

  (products || []).forEach(p => {
    const stock = Number(p.stock) || 0;
    const cost = Number(p.costPrice) || 0;
    const isSold = soldProductIds.has(p.id) || soldProductIds.has(p.sku) || soldProductIds.has(p.name);

    if (stock > 0 && !isSold) {
      const tiedVal = stock * cost;
      totalTiedCapital += tiedVal;
      deadItems.push({
        ...p,
        tiedCapital: tiedVal,
      });
    }
  });

  deadItems.sort((a, b) => b.tiedCapital - a.tiedCapital);

  return {
    deadItems,
    totalTiedCapital: roundCurrency(totalTiedCapital),
    count: deadItems.length,
  };
};

/**
 * Calculate Basket size, Average Order Value (AOV) and Order Buckets
 */
export const computeBasketMetrics = (sales = []) => {
  if (!sales || sales.length === 0) {
    return {
      aov: 0,
      upt: 0,
      totalOrders: 0,
      buckets: [],
    };
  }

  let totalRevenue = 0;
  let totalUnits = 0;

  const buckets = [
    { label: '< ₹100', min: 0, max: 100, count: 0, revenue: 0 },
    { label: '₹100 - ₹500', min: 100, max: 500, count: 0, revenue: 0 },
    { label: '₹500 - ₹1,500', min: 500, max: 1500, count: 0, revenue: 0 },
    { label: '₹1,500+', min: 1500, max: Infinity, count: 0, revenue: 0 },
  ];

  sales.forEach(sale => {
    const amount = Number(sale.totalAmount) || 0;
    totalRevenue += amount;
    const units = (sale.items || []).reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
    totalUnits += units;

    const b = buckets.find(bk => amount >= bk.min && amount < bk.max);
    if (b) {
      b.count += 1;
      b.revenue += amount;
    }
  });

  const aov = roundCurrency(totalRevenue / sales.length);
  const upt = Number((totalUnits / sales.length).toFixed(1));

  return {
    aov,
    upt,
    totalOrders: sales.length,
    totalRevenue: roundCurrency(totalRevenue),
    buckets,
  };
};

/**
 * Customer Udhaar Aging & Credit Risk Buckets
 */
export const computeUdhaarAging = (customers = []) => {
  const aging = [
    { label: 'Current (0-15 Days)', range: '0-15d', count: 0, amount: 0, color: '#10b981' },
    { label: 'Moderate (16-30 Days)', range: '16-30d', count: 0, amount: 0, color: '#f59e0b' },
    { label: 'Overdue (31-60 Days)', range: '31-60d', count: 0, amount: 0, color: '#f97316' },
    { label: 'High Risk (60+ Days)', range: '60d+', count: 0, amount: 0, color: '#ef4444' },
  ];

  let totalDebt = 0;
  let totalCreditLimit = 0;
  const debtors = [];

  (customers || []).forEach(c => {
    const balance = Number(c.currentBalance) || 0;
    const limit = Number(c.creditLimit) || 0;
    totalCreditLimit += limit;

    if (balance > 0) {
      totalDebt += balance;
      debtors.push(c);

      // Estimate age based on lastActivityDate or createdAt
      const lastDate = new Date(c.lastActivityDate || c.updatedAt || c.createdAt || Date.now());
      const ageDays = Math.max(0, Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));

      if (ageDays <= 15) {
        aging[0].count += 1;
        aging[0].amount += balance;
      } else if (ageDays <= 30) {
        aging[1].count += 1;
        aging[1].amount += balance;
      } else if (ageDays <= 60) {
        aging[2].count += 1;
        aging[2].amount += balance;
      } else {
        aging[3].count += 1;
        aging[3].amount += balance;
      }
    }
  });

  const creditUtilization = totalCreditLimit > 0 ? ((totalDebt / totalCreditLimit) * 100).toFixed(1) : 0;

  return {
    aging,
    totalDebt: roundCurrency(totalDebt),
    totalCreditLimit: roundCurrency(totalCreditLimit),
    creditUtilization: Number(creditUtilization),
    debtorCount: debtors.length,
  };
};

/**
 * Profit Margin Tier Distribution (High >35%, Healthy 20-35%, Low 10-20%, Thin <10%)
 */
export const computeMarginTiers = (products = [], sales = []) => {
  const tiers = [
    { label: 'High Margin (>35%)', min: 35, max: Infinity, count: 0, revenue: 0, profit: 0, color: '#10b981' },
    { label: 'Healthy (20% - 35%)', min: 20, max: 35, count: 0, revenue: 0, profit: 0, color: '#06b6d4' },
    { label: 'Moderate (10% - 20%)', min: 10, max: 20, count: 0, revenue: 0, profit: 0, color: '#f59e0b' },
    { label: 'Thin / Low (<10%)', min: -Infinity, max: 10, count: 0, revenue: 0, profit: 0, color: '#f43f5e' },
  ];

  (sales || []).forEach(sale => {
    (sale.items || []).forEach(item => {
      const sell = Number(item.sellingPrice) || 0;
      const cost = Number(item.costPrice) || 0;
      const qty = Number(item.quantity) || 1;
      const lineRev = sell * qty;
      const lineProf = (sell - cost) * qty;
      const margin = sell > 0 ? ((sell - cost) / sell) * 100 : 0;

      const t = tiers.find(tr => margin >= tr.min && margin < tr.max);
      if (t) {
        t.count += qty;
        t.revenue += lineRev;
        t.profit += lineProf;
      }
    });
  });

  return tiers;
};
