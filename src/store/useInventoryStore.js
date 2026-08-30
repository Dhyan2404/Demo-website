import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialProducts } from '../services/mockData.js';
import { apiService } from '../services/api.js';

export const useInventoryStore = create(
  persist(
    (set, get) => ({
      products: initialProducts,
      searchQuery: '',
      selectedCategory: 'All',
      stockFilter: 'all', // 'all' | 'low' | 'out' | 'in_stock'
      sortBy: 'updatedAt',
      sortOrder: 'desc',

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setStockFilter: (filter) => set({ stockFilter: filter }),
      setSort: (by) => {
        const currentBy = get().sortBy;
        const currentOrder = get().sortOrder;
        if (currentBy === by) {
          set({ sortOrder: currentOrder === 'asc' ? 'desc' : 'asc' });
        } else {
          set({ sortBy: by, sortOrder: 'desc' });
        }
      },

      addProduct: async (productData) => {
        const id = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newProduct = {
          id,
          sku: (productData.sku || `SKU-${Date.now().toString().slice(-4)}`).toUpperCase(),
          name: productData.name.trim(),
          category: productData.category?.trim() || 'General',
          costPrice: Number(productData.costPrice) || 0,
          sellingPrice: Number(productData.sellingPrice) || 0,
          stock: Number(productData.stock) || 0,
          minThreshold: Number(productData.minThreshold) || 5,
          unit: productData.unit?.trim() || 'pcs',
          notes: productData.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          products: [newProduct, ...state.products]
        }));

        // Try syncing with API in background
        apiService.createProduct(newProduct).catch(() => {});
        return newProduct;
      },

      updateProduct: async (id, updatedData) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === id || p._id === id) {
              return {
                ...p,
                ...updatedData,
                sku: (updatedData.sku || p.sku).toUpperCase(),
                costPrice: Number(updatedData.costPrice ?? p.costPrice),
                sellingPrice: Number(updatedData.sellingPrice ?? p.sellingPrice),
                stock: Number(updatedData.stock ?? p.stock),
                minThreshold: Number(updatedData.minThreshold ?? p.minThreshold),
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          })
        }));

        apiService.updateProduct(id, updatedData).catch(() => {});
      },

      adjustStock: async (id, amount) => {
        const num = Number(amount) || 0;
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === id || p._id === id) {
              const newStock = Math.max(0, p.stock + num);
              return {
                ...p,
                stock: newStock,
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          })
        }));

        apiService.adjustStock(id, num).catch(() => {});
      },

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id && p._id !== id)
        }));
        apiService.deleteProduct(id).catch(() => {});
      },

      restockItem: (id, targetStock = 20) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === id || p._id === id) {
              return {
                ...p,
                stock: Math.max(p.stock, targetStock),
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          })
        }));
      },

      importProducts: (productsList) => {
        if (!Array.isArray(productsList)) return;
        set({ products: productsList });
      },

      // Selectors & Computed helpers
      getCategories: () => {
        const categories = new Set(get().products.map(p => p.category || 'General'));
        return ['All', ...Array.from(categories)];
      },

      getLowStockProducts: () => {
        return get().products.filter(p => p.stock > 0 && p.stock <= (p.minThreshold || 5));
      },

      getOutOfStockProducts: () => {
        return get().products.filter(p => p.stock <= 0);
      },

      getFilteredProducts: () => {
        const { products, searchQuery, selectedCategory, stockFilter, sortBy, sortOrder } = get();

        return products.filter((product) => {
          const matchesSearch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

          let matchesStock = true;
          if (stockFilter === 'low') {
            matchesStock = product.stock > 0 && product.stock <= (product.minThreshold || 5);
          } else if (stockFilter === 'out') {
            matchesStock = product.stock <= 0;
          } else if (stockFilter === 'in_stock') {
            matchesStock = product.stock > 0;
          }

          return matchesSearch && matchesCategory && matchesStock;
        }).sort((a, b) => {
          let aVal = a[sortBy];
          let bVal = b[sortBy];

          if (sortBy === 'profit') {
            aVal = a.sellingPrice - a.costPrice;
            bVal = b.sellingPrice - b.costPrice;
          } else if (sortBy === 'margin') {
            aVal = a.sellingPrice > 0 ? ((a.sellingPrice - a.costPrice) / a.sellingPrice) : 0;
            bVal = b.sellingPrice > 0 ? ((b.sellingPrice - b.costPrice) / b.sellingPrice) : 0;
          }

          if (typeof aVal === 'string') {
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
          }
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
      },

      getInventoryValuation: () => {
        const products = get().products;
        const totalCostValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
        const totalRetailValue = products.reduce((acc, p) => acc + (p.sellingPrice * p.stock), 0);
        const projectedProfit = totalRetailValue - totalCostValue;
        return { totalCostValue, totalRetailValue, projectedProfit };
      }
    }),
    {
      name: 'smartshop-inventory-storage',
    }
  )
);
