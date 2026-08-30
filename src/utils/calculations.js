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
