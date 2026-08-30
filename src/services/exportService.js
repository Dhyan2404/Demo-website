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
 * Export Inventory Products to CSV
 */
export const exportInventoryToCSV = (products = []) => {
  const headers = ['SKU', 'Product Name', 'Category', 'Cost Price', 'Selling Price', 'Profit Per Unit', 'Margin %', 'Stock Level', 'Min Alert Threshold', 'Unit', 'Notes'];
  
  const rows = products.map(p => [
    `"${p.sku}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${p.category || 'General'}"`,
    p.costPrice,
    p.sellingPrice,
    (p.sellingPrice - p.costPrice),
    `${p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : 0}%`,
    p.stock,
    p.minThreshold || 5,
    `"${p.unit || 'pcs'}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `Inventory_Report_${dateStr}.csv`);
};

/**
 * Export Sales & Profit History to CSV
 */
export const exportSalesToCSV = (sales = []) => {
  const headers = ['Invoice No', 'Date', 'Customer Name', 'Items Summary', 'Total Quantity', 'Total Revenue', 'Total Cost', 'Net Profit', 'Payment Method', 'Paid Amount', 'Pending (Udhaar)'];

  const rows = sales.map(s => {
    const itemsSummary = (s.items || []).map(i => `${i.name} (x${i.quantity})`).join('; ');
    return [
      `"${s.invoiceNo}"`,
      `"${new Date(s.createdAt).toLocaleString()}"`,
      `"${(s.customerName || 'Walk-in').replace(/"/g, '""')}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      s.totalQuantity,
      s.totalAmount,
      s.totalCost,
      s.netProfit,
      `"${s.paymentMethod}"`,
      s.paidAmount || s.totalAmount,
      s.pendingAmount || 0
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
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${c.phone}"`,
    `"${c.email || ''}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    c.totalCredit || 0,
    c.totalPaid || 0,
    c.currentBalance || 0,
    c.transactions?.length || 0,
    `"${c.lastActivityDate ? new Date(c.lastActivityDate).toLocaleDateString() : 'N/A'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `Customer_Udhaar_Ledger_${dateStr}.csv`);
};

/**
 * Full JSON Snapshot Backup Export
 */
export const exportFullBackupJSON = (data = {}) => {
  const backup = {
    app: 'Personal Smart Inventory & Profit Tracker',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    ...data
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(jsonStr, `SmartShop_Full_Backup_${dateStr}.json`, 'application/json;charset=utf-8;');
};

/**
 * Read and parse an imported backup JSON file
 */
export const readBackupJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON file format. Please upload a valid SmartShop backup.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
};
