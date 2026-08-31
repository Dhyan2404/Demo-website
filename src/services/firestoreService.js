import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.js';

const PRODUCTS_COLLECTION = 'products';
const SALES_COLLECTION = 'sales';
const CUSTOMERS_COLLECTION = 'customers';
const SETTINGS_COLLECTION = 'settings';

export const firestoreService = {
  // PRODUCTS
  async saveProduct(product) {
    const id = product.id || product._id;
    if (!id) return;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await setDoc(docRef, { ...product, id }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${id}`);
    }
  },

  async deleteProduct(id) {
    if (!id) return;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${id}`);
    }
  },

  subscribeProducts(onData, onError) {
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          onData(items);
        },
        (error) => {
          if (onError) onError(error);
          handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
      return () => {};
    }
  },

  // SALES
  async saveSale(sale) {
    const id = sale.id || sale._id;
    if (!id) return;
    try {
      const docRef = doc(db, SALES_COLLECTION, id);
      await setDoc(docRef, { ...sale, id }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${SALES_COLLECTION}/${id}`);
    }
  },

  subscribeSales(onData, onError) {
    try {
      const colRef = collection(db, SALES_COLLECTION);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          // Sort sales descending by createdAt
          items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          onData(items);
        },
        (error) => {
          if (onError) onError(error);
          handleFirestoreError(error, OperationType.LIST, SALES_COLLECTION);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, SALES_COLLECTION);
      return () => {};
    }
  },

  // CUSTOMERS
  async saveCustomer(customer) {
    const id = customer.id || customer._id;
    if (!id) return;
    try {
      const docRef = doc(db, CUSTOMERS_COLLECTION, id);
      await setDoc(docRef, { ...customer, id }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${CUSTOMERS_COLLECTION}/${id}`);
    }
  },

  async deleteCustomer(id) {
    if (!id) return;
    try {
      const docRef = doc(db, CUSTOMERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${CUSTOMERS_COLLECTION}/${id}`);
    }
  },

  subscribeCustomers(onData, onError) {
    try {
      const colRef = collection(db, CUSTOMERS_COLLECTION);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          onData(items);
        },
        (error) => {
          if (onError) onError(error);
          handleFirestoreError(error, OperationType.LIST, CUSTOMERS_COLLECTION);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, CUSTOMERS_COLLECTION);
      return () => {};
    }
  },

  // SETTINGS
  async saveSettings(settings) {
    const id = 'store_config';
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, id);
      await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${id}`);
    }
  },

  subscribeSettings(onData, onError) {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, 'store_config');
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            onData(docSnap.data());
          }
        },
        (error) => {
          if (onError) onError(error);
          handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/store_config`);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/store_config`);
      return () => {};
    }
  },

  // BATCH SYNC ALL LOCAL DATA TO CLOUD
  async syncAllToCloud({ products = [], sales = [], customers = [], settings = {} }) {
    try {
      const batch = writeBatch(db);

      // Save store settings
      const settingsRef = doc(db, SETTINGS_COLLECTION, 'store_config');
      batch.set(settingsRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });

      // Save products
      products.forEach((p) => {
        const pId = p.id || p._id;
        if (pId) {
          const ref = doc(db, PRODUCTS_COLLECTION, pId);
          batch.set(ref, { ...p, id: pId }, { merge: true });
        }
      });

      // Save sales
      sales.forEach((s) => {
        const sId = s.id || s._id;
        if (sId) {
          const ref = doc(db, SALES_COLLECTION, sId);
          batch.set(ref, { ...s, id: sId }, { merge: true });
        }
      });

      // Save customers
      customers.forEach((c) => {
        const cId = c.id || c._id;
        if (cId) {
          const ref = doc(db, CUSTOMERS_COLLECTION, cId);
          batch.set(ref, { ...c, id: cId }, { merge: true });
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_sync');
      return false;
    }
  },
};
