const API_BASE_URL = '/api';

/**
 * Generic fetch wrapper with timeout & error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'API request failed');
    }
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    // Return null or rethrow so the client store knows to continue in local-cache mode
    console.debug(`API fallback for ${endpoint}:`, error.message);
    return null;
  }
}

export const apiService = {
  // Check health
  getHealth: () => fetchAPI('/health'),

  // Products
  getProducts: (params = '') => fetchAPI(`/products${params}`),
  createProduct: (data) => fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adjustStock: (id, adjustment) => fetchAPI(`/products/${id}/adjust-stock`, { method: 'PATCH', body: JSON.stringify({ adjustment }) }),
  deleteProduct: (id) => fetchAPI(`/products/${id}`, { method: 'DELETE' }),

  // Sales
  getSales: (params = '') => fetchAPI(`/sales${params}`),
  createSale: (data) => fetchAPI('/sales', { method: 'POST', body: JSON.stringify(data) }),
  getSaleById: (id) => fetchAPI(`/sales/${id}`),

  // Customers
  getCustomers: (params = '') => fetchAPI(`/customers${params}`),
  createCustomer: (data) => fetchAPI('/customers', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (id, data) => fetchAPI(`/customers/${id}/pay`, { method: 'POST', body: JSON.stringify(data) }),
  deleteCustomer: (id) => fetchAPI(`/customers/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalyticsSummary: (period = '30days') => fetchAPI(`/analytics/summary?period=${period}`),

  // Backup & Restore
  exportBackup: () => fetchAPI('/backup/export'),
  restoreBackup: (data) => fetchAPI('/backup/restore', { method: 'POST', body: JSON.stringify(data) }),
};
