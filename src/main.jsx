import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { FirebaseProvider } from './context/FirebaseContext.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register PWA Service Worker in production environment with base-safe path
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = `${import.meta.env.BASE_URL || './'}sw.js`;
    navigator.serviceWorker
      .register(swPath)
      .then((reg) => {
        console.log('SmartShop PWA ServiceWorker registered with scope: ', reg.scope);
      })
      .catch((err) => {
        console.warn('SmartShop PWA ServiceWorker registration notice: ', err?.message || err);
      });
  });
}
