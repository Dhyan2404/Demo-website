import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Read config
const configPath = path.resolve('firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Import mock data
import { initialProducts, initialCustomers, initialSales, initialSettings } from '../src/services/mockData.js';
import { SHOP_CUSTOMERS } from '../src/data/shopTemplates/shopCustomers.js';
import { SHOP_TEMPLATES } from '../src/data/shopTemplates/index.js';

async function seedData() {
  console.log('Starting Firestore Seeding into Database:', firebaseConfig.firestoreDatabaseId);

  // 1. Settings
  console.log('Seeding Store Settings...');
  const settingsBatch = writeBatch(db);
  const settingsRef = doc(db, 'settings', 'store_config');
  settingsBatch.set(settingsRef, {
    ...initialSettings,
    shopType: 'kirana',
    taxRate: 0,
    enableSound: true,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  await settingsBatch.commit();
  console.log('✓ Store settings seeded successfully.');

  // 2. Products - Gather initial products + Kirana template products for a rich catalog
  console.log('Seeding Products collection...');
  const allProductsMap = new Map();
  
  initialProducts.forEach(p => allProductsMap.set(p.id, p));

  // Add all template products
  SHOP_TEMPLATES.forEach(template => {
    (template.products || []).forEach((prod, index) => {
      const id = prod.id || `prod_${template.id}_${index + 1}`;
      if (!allProductsMap.has(id)) {
        allProductsMap.set(id, {
          ...prod,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  });

  const productsList = Array.from(allProductsMap.values());
  console.log(`Total products to write: ${productsList.length}`);

  // Write products in batches of 400 (Firestore batch limit is 500)
  for (let i = 0; i < productsList.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = productsList.slice(i, i + 400);
    chunk.forEach(p => {
      const ref = doc(db, 'products', p.id);
      batch.set(ref, p, { merge: true });
    });
    await batch.commit();
    console.log(`✓ Seeded products chunk ${i + 1} to ${Math.min(i + 400, productsList.length)}`);
  }

  // 3. Customers
  console.log('Seeding Customers collection...');
  const allCustomersMap = new Map();
  initialCustomers.forEach(c => allCustomersMap.set(c.id, c));
  
  // Also add shop template customers
  Object.values(SHOP_CUSTOMERS).forEach(customerGroup => {
    customerGroup.forEach((cust, idx) => {
      const id = cust.id || `cust_seeded_${idx + 1}`;
      if (!allCustomersMap.has(id)) {
        allCustomersMap.set(id, {
          ...cust,
          id,
          createdAt: new Date().toISOString(),
          lastActivityDate: new Date().toISOString(),
        });
      }
    });
  });

  const customersList = Array.from(allCustomersMap.values());
  console.log(`Total customers to write: ${customersList.length}`);

  for (let i = 0; i < customersList.length; i += 400) {
    const batch = writeBatch(db);
    const chunk = customersList.slice(i, i + 400);
    chunk.forEach(c => {
      const ref = doc(db, 'customers', c.id);
      batch.set(ref, c, { merge: true });
    });
    await batch.commit();
    console.log(`✓ Seeded customers chunk ${i + 1} to ${Math.min(i + 400, customersList.length)}`);
  }

  // 4. Sales
  console.log('Seeding Sales collection...');
  const salesBatch = writeBatch(db);
  initialSales.forEach(s => {
    const ref = doc(db, 'sales', s.id);
    salesBatch.set(ref, s, { merge: true });
  });
  await salesBatch.commit();
  console.log(`✓ Seeded ${initialSales.length} initial sales invoices.`);

  console.log('\n🎉 ALL DATA SUCCESSFULLY FED INTO FIREBASE FIRESTORE DATABASE!');
  process.exit(0);
}

seedData().catch(err => {
  console.error('Seeding Error:', err);
  process.exit(1);
});
