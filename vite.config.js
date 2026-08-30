import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // Ensures assets load properly on GitHub Pages, Vercel, Netlify, and custom domains
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('canvas-confetti')) {
              return 'ui-vendor';
            }
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1200,
  }
});
