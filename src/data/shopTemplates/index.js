import { kiranaProducts } from './kirana.js';
import { dairyProducts } from './dairy.js';
import { parlourProducts } from './parlour.js';
import { stationeryProducts } from './stationery.js';
import { pharmacyProducts } from './pharmacy.js';
import { restaurantProducts } from './restaurant.js';
import { supermarketProducts } from './supermarket.js';
import { electronicsProducts } from './electronics.js';
import { clothingProducts } from './clothing.js';
import { bakeryProducts } from './bakery.js';
import { SHOP_CUSTOMERS, getCustomersByShopType } from './shopCustomers.js';

export const SHOP_TEMPLATES = [
  {
    id: 'kirana',
    name: 'Kirana / Grocery Store',
    defaultStoreName: 'Sunrise Super Kirana & Provision',
    tagline: 'Daily groceries, pulses, spices, oils, toiletries & household essentials',
    iconName: 'ShoppingBag',
    color: 'emerald',
    badge: 'Popular',
    estimatedProducts: kiranaProducts.length,
    products: kiranaProducts,
    defaultCurrency: '₹',
    categories: ['Dals & Pulses', 'Atta & Flours', 'Rice & Sugar', 'Edible Oils', 'Spices & Salt', 'Snacks & Noodles', 'Biscuits & Bakery', 'Tea & Coffee', 'Cleaning & Laundry', 'Personal Care', 'Pooja Items', 'Dry Fruits'],
  },
  {
    id: 'dairy',
    name: 'Dairy & Milk Shop',
    defaultStoreName: 'Shree Krishna Fresh Dairy & Milk Depot',
    tagline: 'Fresh milk, paneer, dahi, lassi, butter, cheese, ghee & eggs',
    iconName: 'Milk',
    color: 'blue',
    badge: 'Essential',
    estimatedProducts: dairyProducts.length,
    products: dairyProducts,
    defaultCurrency: '₹',
    categories: ['Fresh Milk', 'Paneer & Tofu', 'Curd & Lassi', 'Butter & Cheese', 'Ghee & Creams', 'Flavored Drinks', 'Ice Creams', 'Eggs & Breads'],
  },
  {
    id: 'parlour',
    name: 'Beauty Parlour / Salon',
    defaultStoreName: 'Glow & Glamour Beauty Studio & Salon',
    tagline: 'Salon treatments, facial kits, cosmetics, hair care, waxing & bridal services',
    iconName: 'Sparkles',
    color: 'pink',
    badge: 'Service & Retail',
    estimatedProducts: parlourProducts.length,
    products: parlourProducts,
    defaultCurrency: '₹',
    categories: ['Hair Care', 'Facial Kits', 'Waxing & Bleach', 'Makeup & Nails', 'Salon Services'],
  },
  {
    id: 'stationery',
    name: 'Stationery & Book Depot',
    defaultStoreName: 'Vidya Book Depot & Stationery Hub',
    tagline: 'Notebooks, pens, registers, art supplies, office tools & school kits',
    iconName: 'BookOpen',
    color: 'indigo',
    badge: 'Education',
    estimatedProducts: stationeryProducts.length,
    products: stationeryProducts,
    defaultCurrency: '₹',
    categories: ['Notebooks & Paper', 'Pens & Pencils', 'Art & Geometry', 'Office Supplies'],
  },
  {
    id: 'pharmacy',
    name: 'Medical & Pharmacy Store',
    defaultStoreName: 'Sanjivani Pharmacy & Health Medicos',
    tagline: 'OTC medicines, fever/pain relievers, syrups, vitamins, first-aid & health devices',
    iconName: 'Activity',
    color: 'red',
    badge: 'Healthcare',
    estimatedProducts: pharmacyProducts.length,
    products: pharmacyProducts,
    defaultCurrency: '₹',
    categories: ['OTC & Fever', 'Cough Syrups', 'Digestion & Gut', 'Vitamins & Nutrition', 'First Aid & Surgical', 'Diagnostics'],
  },
  {
    id: 'restaurant',
    name: 'Food, Cafe & Restaurant',
    defaultStoreName: 'The Royal Spice Kitchen & Cafe',
    tagline: 'Burgers, pizzas, momos, noodles, curries, mocktails, tea & cafe beverages',
    iconName: 'Utensils',
    color: 'amber',
    badge: 'Hospitality',
    estimatedProducts: restaurantProducts.length,
    products: restaurantProducts,
    defaultCurrency: '₹',
    categories: ['Burgers & Wraps', 'Pizza & Pasta', 'Chinese & Starters', 'Main Course', 'Beverages'],
  },
  {
    id: 'supermarket',
    name: 'Supermarket / Mini-Mart',
    defaultStoreName: 'CityMax Gourmet Supermarket',
    tagline: 'Breakfast cereals, imported pasta, gourmet sauces, beverages, baby care & hygiene',
    iconName: 'Store',
    color: 'cyan',
    badge: 'Retail',
    estimatedProducts: supermarketProducts.length,
    products: supermarketProducts,
    defaultCurrency: '₹',
    categories: ['Breakfast Cereals', 'Gourmet & Pasta', 'Juices & Cold Drinks', 'Snacks & Munchies', 'Chocolates', 'Baby Care'],
  },
  {
    id: 'electronics',
    name: 'Electronics & Mobile Shop',
    defaultStoreName: 'VoltZone Mobile & Electronics Hub',
    tagline: 'Cables, chargers, power banks, earbuds, smartwatches, LED bulbs & accessories',
    iconName: 'Smartphone',
    color: 'purple',
    badge: 'Tech & Gadgets',
    estimatedProducts: electronicsProducts.length,
    products: electronicsProducts,
    defaultCurrency: '₹',
    categories: ['Mobile Accessories', 'Audio & Gadgets', 'Smart Devices', 'Home Electricals'],
  },
  {
    id: 'clothing',
    name: 'Clothing & Garment Store',
    defaultStoreName: 'Urban Elegance Garments & Apparel',
    tagline: 'Menswear, kurtis, sarees, ethnic wear, denim, kids wear & apparel accessories',
    iconName: 'Shirt',
    color: 'teal',
    badge: 'Fashion',
    estimatedProducts: clothingProducts.length,
    products: clothingProducts,
    defaultCurrency: '₹',
    categories: ['Mens Wear', 'Womens Wear', 'Kids Wear', 'Accessories'],
  },
  {
    id: 'bakery',
    name: 'Bakery & Sweets Emporium',
    defaultStoreName: 'The Golden Crust Bakery & Confectionery',
    tagline: 'Fresh cakes, pastries, handmade cookies, puffs, kaju katli & traditional mithai',
    iconName: 'Cake',
    color: 'orange',
    badge: 'Confectionery',
    estimatedProducts: bakeryProducts.length,
    products: bakeryProducts,
    defaultCurrency: '₹',
    categories: ['Cakes & Pastries', 'Cookies & Breads', 'Indian Sweets'],
  },
];

export const getTemplateById = (templateId) => {
  return SHOP_TEMPLATES.find((t) => t.id === templateId) || SHOP_TEMPLATES[0];
};

export { SHOP_CUSTOMERS, getCustomersByShopType };
