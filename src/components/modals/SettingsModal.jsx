import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings,
  Sparkles,
  Save,
  RotateCcw,
  Download,
  Upload,
  Shield,
  Store,
  Phone,
  MapPin,
  QrCode,
  ShoppingBag,
  Milk,
  BookOpen,
  Activity,
  Utensils,
  Smartphone,
  Shirt,
  Cake,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  Database,
  Radio,
} from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useInventoryStore } from '../../store/useInventoryStore.js';
import { useSalesStore } from '../../store/useSalesStore.js';
import { useCustomerStore } from '../../store/useCustomerStore.js';
import { useFirebase } from '../../context/FirebaseContext.jsx';
import { initialProducts, initialSales, initialCustomers } from '../../services/mockData.js';
import { exportFullBackupJSON, readBackupJSONFile } from '../../services/exportService.js';
import { SHOP_TEMPLATES, getTemplateById, getCustomersByShopType } from '../../data/shopTemplates/index.js';

// Icon Map helper for dynamic template icons
const ICON_MAP = {
  ShoppingBag,
  Milk,
  Sparkles,
  BookOpen,
  Activity,
  Utensils,
  Store,
  Smartphone,
  Shirt,
  Cake,
};

export const SettingsModal = ({ isOpen, onClose }) => {
  const settings = useThemeStore((state) => state.settings);
  const updateSettings = useThemeStore((state) => state.updateSettings);
  const fidelity3D = useThemeStore((state) => state.fidelity3D);
  const setFidelity3D = useThemeStore((state) => state.setFidelity3D);
  const showToast = useThemeStore((state) => state.showToast);

  const products = useInventoryStore((state) => state.products);
  const importProducts = useInventoryStore((state) => state.importProducts);
  const addProduct = useInventoryStore((state) => state.addProduct);
  const sales = useSalesStore((state) => state.sales);
  const importSales = useSalesStore((state) => state.importSales);
  const customers = useCustomerStore((state) => state.customers);
  const importCustomers = useCustomerStore((state) => state.importCustomers);

  const {
    user,
    isAuthLoading,
    cloudStatus,
    lastSyncedAt,
    signInWithGoogle,
    signOut,
    syncLocalToCloud,
  } = useFirebase();

  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'profile' | 'cloud' | 'backup'
  const [isSyncing, setIsSyncing] = useState(false);

  const [formData, setFormData] = useState({
    shopName: 'SmartShop',
    shopType: 'kirana',
    currencySymbol: '₹',
    ownerName: 'Shop Owner',
    phone: '',
    address: '',
    upiId: '',
    gstNumber: '',
    lowStockDefaultThreshold: 5,
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState('kirana');
  const [loadMode, setLoadMode] = useState('replace'); // 'replace' | 'append'

  useEffect(() => {
    if (settings) {
      setFormData({
        shopName: settings.shopName || 'SmartShop',
        shopType: settings.shopType || 'kirana',
        currencySymbol: settings.currencySymbol || '₹',
        ownerName: settings.ownerName || 'Shop Owner',
        phone: settings.phone || settings.contactNumber || '',
        address: settings.address || '',
        upiId: settings.upiId || '',
        gstNumber: settings.gstNumber || '',
        lowStockDefaultThreshold: settings.lowStockDefaultThreshold || 5,
      });
      if (settings.shopType) {
        setSelectedTemplateId(settings.shopType);
      }
    }
  }, [settings, isOpen]);

  const selectedTemplate = useMemo(() => {
    return getTemplateById(selectedTemplateId);
  }, [selectedTemplateId]);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      shopType: selectedTemplateId,
      lowStockDefaultThreshold: Math.max(1, parseInt(formData.lowStockDefaultThreshold, 10) || 5),
    });
    showToast('Shop settings saved successfully!', 'success');
    onClose();
  };

  const handleLoadTemplateProducts = () => {
    const template = selectedTemplate;
    if (!template || !template.products || template.products.length === 0) {
      showToast('No starter products found for this template.', 'warning');
      return;
    }

    const preparedProducts = template.products.map((p, idx) => ({
      id: `prod_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      _id: `prod_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name: p.name,
      category: p.category,
      costPrice: Number(p.costPrice) || 0,
      sellingPrice: Number(p.sellingPrice) || 0,
      stock: Number(p.stock) || 50,
      unit: p.unit || 'pcs',
      minThreshold: Number(p.minThreshold) || 5,
      sku: p.sku || `SKU-${idx + 100}`,
      createdAt: new Date().toISOString(),
    }));

    const tailoredCustomers = getCustomersByShopType(template.id);
    const newStoreName = template.defaultStoreName || template.name;

    if (loadMode === 'replace') {
      // Clean slate for new shop type
      importProducts(preparedProducts);
      importCustomers(tailoredCustomers);
      importSales([]); // Remove previous sales transactions
      useSalesStore.getState().clearCart(); // Clear POS cart

      updateSettings({
        shopType: template.id,
        shopName: newStoreName,
        currencySymbol: template.defaultCurrency || '₹',
      });
      setFormData((prev) => ({
        ...prev,
        shopType: template.id,
        shopName: newStoreName,
        currencySymbol: template.defaultCurrency || '₹',
      }));

      showToast(`Activated ${newStoreName}! Loaded ${preparedProducts.length} items & 10 unique customers. Previous shop data cleared.`, 'success');
      onClose();
    } else {
      importProducts([...products, ...preparedProducts]);
      importCustomers([...customers, ...tailoredCustomers]);
      updateSettings({
        shopType: template.id,
        shopName: newStoreName,
      });
      setFormData((prev) => ({
        ...prev,
        shopType: template.id,
        shopName: newStoreName,
      }));
      showToast(`Appended ${preparedProducts.length} starter products & 10 customers! Total: ${products.length + preparedProducts.length}`, 'success');
      onClose();
    }
  };

  const handleResetSampleData = () => {
    importProducts(initialProducts);
    importSales(initialSales);
    importCustomers(initialCustomers);
    showToast('Restored original sample dataset!', 'info');
    onClose();
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readBackupJSONFile(file);
      if (Array.isArray(data.products)) importProducts(data.products);
      if (Array.isArray(data.sales)) importSales(data.sales);
      if (Array.isArray(data.customers)) importCustomers(data.customers);
      if (data.settings) updateSettings(data.settings);
      showToast('Database snapshot restored successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to restore backup.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Store Settings & Shop Type Presets"
      subtitle="Select shop type, pre-load 75–200 starter products, configure GST & manage backups"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Navigation Subtabs */}
        <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl overflow-x-auto">
          {[
            { id: 'templates', label: 'Shop Catalog', icon: Store },
            { id: 'profile', label: 'Business Profile', icon: Settings },
            { id: 'cloud', label: 'Firebase Cloud', icon: Cloud },
            { id: 'backup', label: 'Backup & 3D', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'cloud' && (
                  <span className={`w-2 h-2 rounded-full ${cloudStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : cloudStatus === 'syncing' ? 'bg-amber-400 animate-spin' : 'bg-slate-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Shop Type Templates & 75-200 Starter Catalog */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Select Shop Type / Business Category
                </h4>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  Click a template to view details and pre-load 75–200 categorized starter products
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 font-bold">
                Current: {products.length} Products
              </span>
            </div>

            {/* 10 Shop Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {SHOP_TEMPLATES.map((tmpl) => {
                const IconComponent = ICON_MAP[tmpl.iconName] || Store;
                const isSelected = selectedTemplateId === tmpl.id;

                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all relative group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/50'
                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-emerald-600 dark:text-emerald-400">
                          {tmpl.estimatedProducts} items
                        </span>
                      </div>
                      <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white">{tmpl.name}</p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-100 dark:border-white/5">
                      <span className="text-[9px] text-slate-500 dark:text-gray-400 block truncate">{tmpl.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Template Details Card & Load Action */}
            {selectedTemplate && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{selectedTemplate.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                        {selectedTemplate.products.length} Starter Products Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-300 mt-0.5">{selectedTemplate.tagline}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={loadMode}
                      onChange={(e) => setLoadMode(e.target.value)}
                      className="px-2.5 py-2 bg-white dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="replace">Replace Inventory</option>
                      <option value="append">Append to Current</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleLoadTemplateProducts}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-gray-950 font-black text-xs shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-gray-950 stroke-[3]" />
                      <span>Load {selectedTemplate.products.length} Products</span>
                    </button>
                  </div>
                </div>

                {/* Categories Pill Strip */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-emerald-200 dark:border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-gray-400 mr-1">Pre-configured Categories:</span>
                  {selectedTemplate.categories?.map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/80 dark:bg-white/5 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile & Form Details */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Shop / Store Name *</label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Owner Name</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Contact Phone (10 Digits)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">UPI ID (Instant QR Payments)</label>
                <input
                  type="text"
                  placeholder="yourshop@upi"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">GST / Tax Number</label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Currency Symbol</label>
                <select
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none font-bold"
                >
                  <option value="₹">₹ (INR - Rupee)</option>
                  <option value="$">$ (USD - Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - Pound)</option>
                  <option value="AED ">AED (Dirham)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300">Shop Address (Printed on receipts)</label>
              <input
                type="text"
                placeholder="e.g. Shop #14, Main Market, MG Road"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs shadow-glow-green"
              >
                Save Business Profile
              </button>
            </div>
          </form>
        )}

        {/* Tab: Firebase Cloud Sync */}
        {activeTab === 'cloud' && (
          <div className="space-y-4">
            {/* Cloud Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Firebase Cloud Firestore</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cloudStatus === 'connected'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : cloudStatus === 'syncing'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cloudStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {cloudStatus === 'connected' ? 'Live & Connected' : cloudStatus === 'syncing' ? 'Syncing...' : 'Ready'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">
                      Real-time database persistence, multi-device synchronization & cloud backup
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={async () => {
                    setIsSyncing(true);
                    await syncLocalToCloud();
                    setIsSyncing(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync All to Cloud'}</span>
                </button>
              </div>

              {/* Cloud Metadata details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-white/5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">Firebase Project</p>
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">propane-flag-507205-r5</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">Firestore Database ID</p>
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate" title="ai-studio-demowebsite-7cbb735e-e886-4d74-bfe8-0fb3b613038a">
                    ai-studio-demowebsite-7cbb735e-e886-4d74-bfe8-0fb3b613038a
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5">
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-semibold">Region & Status</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    asia-southeast1 (Live)
                  </p>
                </div>
              </div>

              {/* Live Collections Counter */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{products.length}</p>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-gray-400">Products in /products</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">{customers.length}</p>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-gray-400">Customers in /customers</p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-center">
                  <p className="text-lg font-black text-purple-600 dark:text-purple-400">{sales.length}</p>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-gray-400">Sales in /sales</p>
                </div>
              </div>
            </div>

            {/* How to view in Firebase Console Tip */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 text-xs space-y-1.5">
              <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <span>🔍 Viewing data in the Firebase Console?</span>
              </p>
              <p className="text-amber-800 dark:text-amber-400 leading-relaxed text-[11px]">
                In the Firebase Console under <strong>Firestore Database</strong>, look at the top database dropdown selector (which defaults to <code className="px-1 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/50 font-mono">(default)</code>). Click it and select <strong className="font-mono text-emerald-700 dark:text-emerald-300">ai-studio-demowebsite-7cbb735e-e886-4d74-bfe8-0fb3b613038a</strong> to view your live collections of products, sales invoices, and customer ledgers!
              </p>
            </div>

            {/* Cloud Auth / Owner Profile */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-amber-500" />
                    <span>Shop Owner Cloud Profile</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    Sign in with Google to tie store data to your verified account
                  </p>
                </div>

                {user ? (
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.displayName || 'Owner'}</p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">{user.email}</p>
                    </div>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        {(user.displayName || 'O')[0]}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={signOut}
                      className="p-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white shadow-xs transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sign in with Google</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cloud Realtime Collections Info */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>Real-Time Bi-Directional Firestore Sync Active</span>
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Every sale, inventory addition, barcode scan, and customer payment automatically syncs to your Firestore collection. If you open SmartShop on another device or tablet, changes update instantly in real-time.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Backup Snapshots & 3D Visuals */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            {/* 3D Visuals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>3D Graphics Fidelity</span>
                </label>
                <span className="text-[10px] text-slate-500 dark:text-gray-400 font-mono uppercase font-bold">{fidelity3D}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'off', label: 'Off 2D (Default)', sub: 'Zero GPU / Fast UI' },
                  { id: 'lite', label: 'Lite 3D', sub: 'Low GPU usage' },
                  { id: 'high', label: 'High 3D', sub: 'Full Scene & Sparkles' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setFidelity3D(mode.id);
                      showToast(`3D Graphics Fidelity switched to: ${mode.label}`, mode.id === 'off' ? 'info' : 'success');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      fidelity3D === mode.id
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-800 dark:text-cyan-300 shadow-sm font-black ring-1 ring-cyan-500/50'
                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <p className="text-xs font-bold">{mode.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">{mode.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Database Backup & Snapshots */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Database Backup & Snapshots</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                Export or restore a full JSON snapshot of all inventory, sales, customer ledgers, and shop settings.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    exportFullBackupJSON({ products, sales, customers, settings: formData });
                    showToast('Full backup JSON downloaded!', 'success');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Download Backup</span>
                </button>

                <label className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Restore Backup</span>
                  <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleResetSampleData}
                  className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
