/**
 * Utility to download generated CSV or JSON file in browser
 */
const downloadFile = (content, fileName, mimeType = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Enhanced Sanitizer for CSV cell strings to prevent CSV formula injection attacks (=, +, -, @, |, \t, \r)
 */
const sanitizeCSVCell = (val) => {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
  if (/^[=+\-@|\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
};

/**
 * Export Inventory Products to CSV
 */
export const exportInventoryToCSV = (products = []) => {
  const headers = ['SKU', 'Product Name', 'Category', 'Cost Price', 'Selling Price', 'Profit Per Unit', 'Margin %', 'Stock Level', 'Min Alert Threshold', 'Unit', 'Notes'];
  
  const rows = products.map(p => [
    sanitizeCSVCell(p.sku),
    sanitizeCSVCell(p.name),
    sanitizeCSVCell(p.category || 'General'),
    Number(p.costPrice) || 0,
    Number(p.sellingPrice) || 0,
    Math.round(((Number(p.sellingPrice) || 0) - (Number(p.costPrice) || 0)) * 100) / 100,
    `${p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : 0}%`,
    Number(p.stock) || 0,
    Number(p.minThreshold) || 5,
    sanitizeCSVCell(p.unit || 'pcs'),
    sanitizeCSVCell(p.notes || '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `Inventory_Report_${dateStr}.csv`);
};

/**
 * Export Sales & Profit History to CSV
 */
export const exportSalesToCSV = (sales = []) => {
  const headers = ['Invoice No', 'Date', 'Customer Name', 'Items Summary', 'Subtotal', 'Tax Rate', 'Tax Amount', 'Total Revenue', 'Total Cost', 'Net Profit', 'Payment Method', 'Paid Amount', 'Pending (Udhaar)'];

  const rows = sales.map(s => {
    const itemsSummary = (s.items || []).map(i => `${i.name} (x${i.quantity})`).join('; ');
    return [
      sanitizeCSVCell(s.invoiceNumber || s.invoiceNo),
      sanitizeCSVCell(new Date(s.createdAt).toLocaleString()),
      sanitizeCSVCell(s.customerName || 'Walk-in'),
      sanitizeCSVCell(itemsSummary),
      Number(s.subtotal) || Number(s.totalAmount) || 0,
      `${s.taxRate || 0}%`,
      Number(s.taxAmount) || 0,
      Number(s.totalAmount) || 0,
      Number(s.totalCost) || 0,
      Number(s.netProfit) || 0,
      sanitizeCSVCell(s.paymentMethod),
      Number(s.paidAmount) || Number(s.totalAmount) || 0,
      Number(s.dueAmount) || Number(s.pendingAmount) || 0
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `Sales_Profit_Report_${dateStr}.csv`);
};

/**
 * Export Customer Udhaar Ledger to CSV
 */
export const exportCustomersToCSV = (customers = []) => {
  const headers = ['Customer Name', 'Phone Number', 'Email', 'Address', 'Total Credit Given', 'Total Paid Back', 'Current Pending Debt (Udhaar)', 'Total Transactions', 'Last Active Date'];

  const rows = customers.map(c => [
    sanitizeCSVCell(c.name),
    sanitizeCSVCell(c.phone),
    sanitizeCSVCell(c.email || ''),
    sanitizeCSVCell(c.address || ''),
    Number(c.totalCredit) || 0,
    Number(c.totalPaid) || 0,
    Number(c.currentBalance) || 0,
    c.transactions?.length || 0,
    sanitizeCSVCell(c.lastActivityDate ? new Date(c.lastActivityDate).toLocaleDateString() : 'N/A')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `Customer_Udhaar_Ledger_${dateStr}.csv`);
};

/**
 * Full JSON Snapshot Backup Export with Metadata
 */
export const exportFullBackupJSON = (data = {}) => {
  const backup = {
    app: 'Personal Smart Inventory & Profit Tracker',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    products: data.products || [],
    sales: data.sales || [],
    customers: data.customers || [],
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(jsonStr, `SmartShop_Full_Backup_${dateStr}.json`, 'application/json;charset=utf-8;');
};

/**
 * Secure Parser & Schema Validator for Imported JSON Backup files
 */
export const readBackupJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    // 10MB payload size guard
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('File is too large. Maximum backup file size is 10MB.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target.result, (key, value) => {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            return undefined; // Defense against Prototype Pollution
          }
          return value;
        });
        
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
          throw new Error('Invalid JSON structure. Root must be a valid JSON object.');
        }

        const cleanData = {
          products: Array.isArray(raw.products) ? raw.products.filter(p => p && typeof p === 'object' && p.name) : null,
          sales: Array.isArray(raw.sales) ? raw.sales.filter(s => s && typeof s === 'object' && (s.invoiceNumber || s.invoiceNo)) : null,
          customers: Array.isArray(raw.customers) ? raw.customers.filter(c => c && typeof c === 'object' && c.name) : null,
        };

        if (!cleanData.products && !cleanData.sales && !cleanData.customers) {
          throw new Error('Backup file does not contain valid SmartShop products, sales, or customer data.');
        }

        resolve(cleanData);
      } catch (err) {
        reject(new Error(err.message || 'Invalid JSON file format. Please upload a valid SmartShop backup.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file from filesystem.'));
    reader.readAsText(file);
  });
};
