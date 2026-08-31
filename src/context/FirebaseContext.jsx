import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
} from '../firebase.js';
import { firestoreService } from '../services/firestoreService.js';
import { useInventoryStore } from '../store/useInventoryStore.js';
import { useSalesStore } from '../store/useSalesStore.js';
import { useCustomerStore } from '../store/useCustomerStore.js';
import { useThemeStore } from '../store/useThemeStore.js';

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState('connecting'); // 'connecting' | 'connected' | 'offline' | 'syncing'
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const importProducts = useInventoryStore((state) => state.importProducts);
  const importSales = useSalesStore((state) => state.importSales);
  const importCustomers = useCustomerStore((state) => state.importCustomers);
  const updateSettings = useThemeStore((state) => state.updateSettings);
  const showToast = useThemeStore((state) => state.showToast);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore Subscriptions for Live Sync (mounted once)
  useEffect(() => {
    setCloudStatus('connecting');

    // Subscribe Products
    const unsubProducts = firestoreService.subscribeProducts(
      (cloudProducts) => {
        if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          useInventoryStore.getState().importProducts(cloudProducts);
          setCloudStatus('connected');
          setLastSyncedAt(new Date());
        } else {
          setCloudStatus('connected');
        }
      },
      (err) => {
        console.warn('Firestore Products sync fallback:', err?.message);
        setCloudStatus('offline');
      }
    );

    // Subscribe Sales
    const unsubSales = firestoreService.subscribeSales(
      (cloudSales) => {
        if (Array.isArray(cloudSales) && cloudSales.length > 0) {
          useSalesStore.getState().importSales(cloudSales);
          setCloudStatus('connected');
          setLastSyncedAt(new Date());
        }
      },
      (err) => {
        console.warn('Firestore Sales sync fallback:', err?.message);
      }
    );

    // Subscribe Customers
    const unsubCustomers = firestoreService.subscribeCustomers(
      (cloudCustomers) => {
        if (Array.isArray(cloudCustomers) && cloudCustomers.length > 0) {
          useCustomerStore.getState().importCustomers(cloudCustomers);
          setCloudStatus('connected');
          setLastSyncedAt(new Date());
        }
      },
      (err) => {
        console.warn('Firestore Customers sync fallback:', err?.message);
      }
    );

    // Subscribe Settings
    const unsubSettings = firestoreService.subscribeSettings(
      (cloudSettings) => {
        if (cloudSettings && typeof cloudSettings === 'object') {
          useThemeStore.getState().updateSettings(cloudSettings);
        }
      },
      (err) => {
        console.warn('Firestore Settings sync fallback:', err?.message);
      }
    );

    return () => {
      unsubProducts();
      unsubSales();
      unsubCustomers();
      unsubSettings();
    };
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showToast(`Welcome, ${result.user.displayName || 'Owner'}!`, 'success');
      return result.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      showToast(error.message || 'Google Sign-In failed', 'error');
      return null;
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      showToast('Signed out of cloud account', 'info');
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  // Full Cloud Push
  const syncLocalToCloud = async () => {
    setCloudStatus('syncing');
    try {
      const products = useInventoryStore.getState().products;
      const sales = useSalesStore.getState().sales;
      const customers = useCustomerStore.getState().customers;
      const settings = useThemeStore.getState().settings;

      await firestoreService.syncAllToCloud({
        products,
        sales,
        customers,
        settings,
      });

      setCloudStatus('connected');
      setLastSyncedAt(new Date());
      showToast('All local data synced with Firebase Cloud!', 'success');
      return true;
    } catch (error) {
      console.error('Cloud Sync error:', error);
      setCloudStatus('offline');
      showToast('Failed to sync data to Firebase Cloud', 'error');
      return false;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        isAuthLoading,
        cloudStatus,
        lastSyncedAt,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        syncLocalToCloud,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
