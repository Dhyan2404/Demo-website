/**
 * Format numbers as localized currency strings
 */
export const formatCurrency = (amount, symbol = '₹') => {
  const val = Number(amount) || 0;
  return `${symbol}${val.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
  })}`;
};

/**
 * Format timestamps into human readable date/time strings
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format percentage with sign
 */
export const formatPercentage = (percent) => {
  const val = Number(percent) || 0;
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
};

/**
 * Format compact numbers for charts (e.g. 1.2k, 45k)
 */
export const formatCompactNumber = (num) => {
  const val = Number(num) || 0;
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return val.toString();
};
