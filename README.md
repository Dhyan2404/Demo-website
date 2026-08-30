# 💎 SmartShop — Personal Smart Inventory & Profit Tracker (3D Scroll UI)

A **modern, high-performance web application** for **single-owner personal shop management** built with **Vite + React 18, Three.js / React Three Fiber, Tailwind CSS, Zustand, and Node.js/Express with MongoDB**.

---

## 🚀 Key Features

### 1. 🌐 3D Scroll-Based Experience
- **React Three Fiber Canvas**: Background 3D scene with floating illuminated isometric inventory nodes, rotating profit coins, and glowing orbital rings.
- **Section Camera Choreography**: Camera lerps seamlessly through 3D waypoints as you scroll through Dashboard, Quick POS, Inventory, Udhaar Ledger, and Analytics.
- **Physics Tilt 3D Cards**: Spring-based 3D perspective cards with specular glass reflections on hover.
- **Fidelity Controls**: Easily toggle between High 3D, Lite 3D, and Minimal mode for maximum hardware compatibility.

### 2. 🏪 Core Business Modules (Single-Owner Focused)
- **Inventory Management**:
  - Live stock tracking with automatic decrement upon POS sales.
  - Color-coded status badges: *In Stock*, *Low Stock* (threshold warnings), and *Out of Stock*.
  - Cost price vs Selling price per item with real-time Margin % and profit per unit.
  - 1-click quick stock adjustment (`+` / `-` / custom restock).
  - Total inventory valuation metrics (Cost Basis vs Retail Valuation vs Projected Profit).
- **Profit Tracking Intelligence**:
  - True net profit computation (`Net Profit = Total Sales - Total Cost of Goods`).
  - Time filters: **Today**, **7 Days**, **30 Days**, **This Year**, and **All Time**.
  - Interactive Recharts Area chart displaying Revenue vs Cost vs Net Profit curves.
  - Identification of **#1 Most Profitable Product** vs **#1 Best Seller by Volume**.
- **Customer Tracking (Udhaar / Credit Ledger)**:
  - Complete credit book for regular customers.
  - Partial and full debt settlement with Cash or UPI.
  - Comprehensive statement ledger tracking every credit invoice and payment.
  - **1-Click WhatsApp Payment Reminder**: Automatically formats customer name, outstanding balance, shop name, and UPI ID into a direct WhatsApp message.
- **Instant Point of Sale (POS) & Billing**:
  - High-speed product search and barcode lookup.
  - Real-time cart profit preview before checkout.
  - Flexible payment modes: **Cash**, **UPI / QR**, **Card**, and **Udhaar (Credit)**.
  - Printable retail invoice receipts with optional owner-profit peek.
- **Data Portability**:
  - Export Inventory, Sales & Profit, and Customer Ledgers to CSV with 1 click.
  - Full system JSON snapshot export and instant restore.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite), Tailwind CSS, Framer Motion
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **State Management**: Zustand (with local `persist` storage for instant offline operation)
- **Charts & Visuals**: Recharts, Lucide React, Canvas-Confetti
- **Backend API**: Node.js, Express, Mongoose (MongoDB)
- **Dual Data Engine**: Runs 100% out of the box with Zustand local persistence, with full REST API and MongoDB schema readiness.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. (Optional) Run the Express Backend & MongoDB API
```bash
npm run server
```
The server will start on [http://localhost:5000](http://localhost:5000).

---

## 📁 Project Architecture

```
websites/
├── server/
│   ├── config/db.js           # MongoDB connection & fallback handler
│   ├── models/                # Mongoose models (Product, Sale, Customer, Setting)
│   ├── routes/                # REST endpoints (products, sales, customers, analytics, backup)
│   └── server.js              # Express app setup
├── src/
│   ├── components/
│   │   ├── 3d/                # Canvas3D, FloatingInventoryScene, Interactive3DCard
│   │   ├── common/            # Navbar, StatCard, Modal, Badge, Toast, QuickSearch
│   │   ├── dashboard/         # DashboardHero, KPISection, LiveStockAlerts, ProfitChart
│   │   ├── billing/           # QuickPOSModal, CartDrawer, PrintableReceiptModal
│   │   ├── inventory/         # InventoryTable, ProductFormModal, StockAdjustmentModal
│   │   ├── customers/         # CustomerLedgerTable, CustomerDetailModal, RecordPaymentModal, WhatsAppReminderModal
│   │   ├── analytics/         # ProfitAnalyticsSection, TopPerformersGrid, MarginBreakdownChart
│   │   └── settings/          # SettingsModal
│   ├── store/                 # Zustand stores (useInventoryStore, useSalesStore, useCustomerStore, useThemeStore, useScrollStore)
│   ├── services/              # API client, Mock starter data, CSV/JSON export service
│   ├── utils/                 # Currency formatters, calculations, date helpers
│   ├── App.jsx                # Main scroll-spied single-page container
│   ├── main.jsx               # React DOM root
│   └── index.css              # Glassmorphic styles, neon glow, print styles
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 📜 Keyboard Shortcuts

- <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> : Global Quick Search (find products, customers, and invoice receipts)
- <kbd>Esc</kbd> : Close any active modal dialog
