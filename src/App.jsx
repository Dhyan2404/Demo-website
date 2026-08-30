import React, { useEffect } from 'react';
import { Canvas3D } from './components/3d/Canvas3D.jsx';
import { Navbar } from './components/common/Navbar.jsx';
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
import { NotificationToast } from './components/common/NotificationToast.jsx';

// Stores
import { useScrollStore } from './store/useScrollStore.js';
import { useThemeStore } from './store/useThemeStore.js';
import { Boxes, Sparkles, Heart } from 'lucide-react';

export function App() {
  const setActiveSection = useScrollStore((state) => state.setActiveSection);
  const setScrollState = useScrollStore((state) => state.setScrollState);

  const activeModal = useThemeStore((state) => state.activeModal);
  const modalData = useThemeStore((state) => state.modalData);
  const closeModal = useThemeStore((state) => state.closeModal);
  const openModal = useThemeStore((state) => state.openModal);
  const showToast = useThemeStore((state) => state.showToast);
  const shopName = useThemeStore((state) => state.settings?.shopName || 'SmartShop');
  const currency = useThemeStore((state) => state.settings?.currencySymbol || '₹');

  // Scroll spy & 3D camera tracker
  useEffect(() => {
    const handleScroll = () => {
      try {
        const scrollY = window.scrollY || 0;
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        setScrollState(scrollY, maxScroll);

        const sections = ['dashboard', 'pos-section', 'inventory-section', 'udhaar-section', 'analytics-section'];
        const scrollPosition = scrollY + 250;

        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      } catch (err) {
        // Safe scroll error catch
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection, setScrollState]);

  const handleWhatsAppReminder = (customer) => {
    if (!customer?.phone) {
      showToast('No phone number saved for this customer', 'warning');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${customer.name}, this is a gentle reminder from ${shopName} regarding your pending balance of ${currency}${customer.currentBalance}. Thank you!`
    );
    window.open(`https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="relative min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden cyber-grid selection:bg-emerald-500 selection:text-black font-sans">
      {/* 3D WebGL Background Canvas with Ambient Fallback */}
      <Canvas3D />

      {/* Main UI Container on Top of 3D Canvas */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky Glass Navbar */}
        <Navbar />

        {/* Main Content Sections */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-12">
          {/* Section 1: Main Dashboard */}
          <section id="dashboard" className="scroll-mt-24 space-y-6">
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
          </section>

          {/* Section 2: Quick Billing / POS */}
          <POSSection />

          {/* Section 3: Inventory Management */}
          <InventorySection />

          {/* Section 4: Customer Udhaar Ledger */}
          <UdhaarSection />

          {/* Section 5: Profit Analytics & Backup */}
          <AnalyticsSection />
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/[0.08] bg-gray-950/80 backdrop-blur-md py-6 px-4 sm:px-8 mt-12 text-xs text-gray-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Boxes className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-bold text-white">{shopName}</span>
              <span>• Single Owner Smart Inventory & Profit Suite</span>
            </div>

            <div className="flex items-center gap-4 text-gray-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Offline Storage Active
              </span>
              <span className="text-emerald-400 font-medium">3D WebGL Active</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Interactive Modals */}
      <QuickPOSModal isOpen={activeModal === 'pos'} onClose={closeModal} />
      <ProductFormModal isOpen={activeModal === 'product_form'} onClose={closeModal} product={modalData} />
      <CustomerFormModal isOpen={activeModal === 'customer_form'} onClose={closeModal} />
      <CustomerDetailModal
        isOpen={activeModal === 'customer_detail'}
        onClose={closeModal}
        customer={modalData}
        onRecordPayment={(cust) => openModal('record_payment', cust)}
        onSendReminder={handleWhatsAppReminder}
      />
      <RecordPaymentModal isOpen={activeModal === 'record_payment'} onClose={closeModal} customer={modalData} />
      <ReceiptModal isOpen={activeModal === 'receipt'} onClose={closeModal} sale={modalData} />
      <SettingsModal isOpen={activeModal === 'settings'} onClose={closeModal} />
      <StockAdjustModal isOpen={activeModal === 'stock_adjust'} onClose={closeModal} product={modalData} />
      <QuickSearchModal isOpen={activeModal === 'quick_search'} onClose={closeModal} />

      {/* Toast Notifications */}
      <NotificationToast />
    </div>
  );
}

export default App;
