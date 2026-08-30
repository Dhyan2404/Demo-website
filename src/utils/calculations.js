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
 * Filter items by date period
 */
export const filterByPeriod = (items, period = '30days') => {
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
    return itemDate >= cutoffDate;
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
      key = `${dateObj.getHours()}:00`;
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
    map[key].revenue += Number(sale.totalAmount) || 0;
    map[key].cost += Number(sale.totalCost) || 0;
    map[key].profit += Number(sale.netProfit) || 0;
    map[key].orders += 1;
  });

  return Object.values(map);
};

/**
 * Compute top performers from sales items
 */
export const computeTopProducts = (sales = [], products = []) => {
  const stats = {};

  sales.forEach(sale => {
    (sale.items || []).forEach(item => {
      const name = item.name;
      if (!stats[name]) {
        stats[name] = {
          name,
          sku: item.sku || '',
          unitsSold: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
        };
      }
      const qty = Number(item.quantity) || 1;
      stats[name].unitsSold += qty;
      stats[name].totalRevenue += (Number(item.sellingPrice) || 0) * qty;
      stats[name].totalCost += (Number(item.costPrice) || 0) * qty;
      stats[name].totalProfit += (Number(item.profit) || 0);
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
