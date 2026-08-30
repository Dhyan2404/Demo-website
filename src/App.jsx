import React, { useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/common/Navbar.jsx';
import { MobileBottomNav } from './components/common/MobileBottomNav.jsx';
import { DashboardHero } from './components/dashboard/DashboardHero.jsx';
import { KPISection } from './components/dashboard/KPISection.jsx';
import { ProfitOverviewChart } from './components/dashboard/ProfitOverviewChart.jsx';
import { LiveStockAlerts } from './components/dashboard/LiveStockAlerts.jsx';
import { RecentActivityFeed } from './components/dashboard/RecentActivityFeed.jsx';
import { POSSection } from './components/pos/POSSection.jsx';
import { InventorySection } from './components/inventory/InventorySection.jsx';
import { UdhaarSection } from './components/customers/UdhaarSection.jsx';
import { AnalyticsSection } from './components/analytics/AnalyticsSection.jsx';

// Modals & Common
import { QuickPOSModal } from './components/pos/QuickPOSModal.jsx';
import { ProductFormModal } from './components/modals/ProductFormModal.jsx';
import { CustomerFormModal } from './components/modals/CustomerFormModal.jsx';
import { CustomerDetailModal } from './components/customers/CustomerDetailModal.jsx';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal.jsx';
import { ReceiptModal } from './components/modals/ReceiptModal.jsx';
import { SettingsModal } from './components/modals/SettingsModal.jsx';
import { StockAdjustModal } from './components/modals/StockAdjustModal.jsx';
import { QuickSearchModal } from './components/common/QuickSearchModal.jsx';
import { WhatsAppReminderModal } from './components/customers/WhatsAppReminderModal.jsx';
import { NotificationToast } from './components/common/NotificationToast.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';

// Stores
import { useScrollStore } from './store/useScrollStore.js';
import { useThemeStore } from './store/useThemeStore.js';
import { Boxes } from 'lucide-react';

// Lazy-load 3D WebGL bundle for optimal performance on mobile devices
const Canvas3D = lazy(() =>
  import('./components/3d/Canvas3D.jsx').then((module) => ({ default: module.Canvas3D }))
);

export function App() {
  const activeSection = useScrollStore((state) => state.activeSection || 'dashboard');
  const setScrollState = useScrollStore((state) => state.setScrollState);

  const activeModal = useThemeStore((state) => state.activeModal);
  const modalData = useThemeStore((state) => state.modalData);
  const closeModal = useThemeStore((state) => state.closeModal);
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');

  // Track scroll position for 3D parallax
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          try {
            const scrollY = window.scrollY || 0;
            const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            setScrollState(scrollY, maxScroll);
          } catch (err) {}
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollState]);

  const handleOpenWhatsAppModal = (customer) => {
    if (!customer?.phone) {
      showToast('No phone number saved for this customer', 'warning');
      return;
    }
    openModal('whatsapp_templates', customer);
  };

  const currentView = (activeSection || 'dashboard').replace('-section', '');

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100 overflow-x-hidden cyber-grid selection:bg-emerald-500 selection:text-white dark:selection:text-black font-sans pb-24 lg:pb-0 transition-colors duration-300">
      {/* 3D WebGL Background Canvas (Lazy Loaded with ErrorBoundary fallback) */}
      <ErrorBoundary fallback={<div className="canvas-bg-container pointer-events-none" />}>
        <Suspense fallback={<div className="canvas-bg-container pointer-events-none" />}>
          <Canvas3D />
        </Suspense>
      </ErrorBoundary>

      {/* Main UI Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky Glass Navbar */}
        <Navbar />

        {/* Modular Dedicated View Screen */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 py-5 sm:py-8">
          <AnimatePresence mode="wait">
            {/* View 1: Main Dashboard */}
            {currentView === 'dashboard' && (
              <motion.div
                key="view-dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <DashboardHero />
                <KPISection />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <ProfitOverviewChart />
                  </div>
                  <div className="lg:col-span-5">
                    <RecentActivityFeed />
                  </div>
                </div>

                <LiveStockAlerts />
              </motion.div>
            )}

            {/* View 2: Dedicated Express POS Terminal */}
            {currentView === 'pos' && (
              <motion.div
                key="view-pos"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <POSSection />
              </motion.div>
            )}

            {/* View 3: Dedicated Inventory & Stock Hub */}
            {currentView === 'inventory' && (
              <motion.div
                key="view-inventory"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <InventorySection />
              </motion.div>
            )}

            {/* View 4: Dedicated Customer Udhaar CRM */}
            {currentView === 'udhaar' && (
              <motion.div
                key="view-udhaar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <UdhaarSection />
              </motion.div>
            )}

            {/* View 5: Dedicated Profit Intelligence & Reports */}
            {currentView === 'analytics' && (
              <motion.div
                key="view-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <AnalyticsSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-gray-950/80 backdrop-blur-md py-6 px-4 sm:px-8 mt-12 text-xs text-slate-500 dark:text-gray-400 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Boxes className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-bold text-slate-800 dark:text-white">{shopName}</span>
              <span>• Single Owner Smart Inventory & Profit Suite</span>
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-gray-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Offline Storage Active
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Auto-Optimized Graphics</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Bottom Navigation Dock for Mobile Phones */}
      <MobileBottomNav />

      {/* Global Interactive Modals */}
      <QuickPOSModal isOpen={activeModal === 'pos'} onClose={closeModal} />
      <ProductFormModal isOpen={activeModal === 'product_form'} onClose={closeModal} product={modalData} />
      <CustomerFormModal isOpen={activeModal === 'customer_form'} onClose={closeModal} />
      <CustomerDetailModal
        isOpen={activeModal === 'customer_detail'}
        onClose={closeModal}
        customer={modalData}
        onRecordPayment={(cust) => openModal('record_payment', cust)}
        onSendReminder={handleOpenWhatsAppModal}
      />
      <RecordPaymentModal isOpen={activeModal === 'record_payment'} onClose={closeModal} customer={modalData} />
      <ReceiptModal isOpen={activeModal === 'receipt'} onClose={closeModal} sale={modalData} />
      <SettingsModal isOpen={activeModal === 'settings'} onClose={closeModal} />
      <StockAdjustModal isOpen={activeModal === 'stock_adjust'} onClose={closeModal} product={modalData} />
      <QuickSearchModal isOpen={activeModal === 'quick_search'} onClose={closeModal} />
      <WhatsAppReminderModal isOpen={activeModal === 'whatsapp_templates'} onClose={closeModal} customer={modalData} />

      {/* Toast Notifications */}
      <NotificationToast />
    </div>
  );
}

export default App;
