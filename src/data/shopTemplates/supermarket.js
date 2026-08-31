// Supermarket & Hypermarket - ~180 items
export const supermarketProducts = [
  // Breakfast & Cereals
  { name: 'Kelloggs Chocos 385g Box', category: 'Breakfast Cereals', costPrice: 175, sellingPrice: 210, stock: 30, unit: 'box', minThreshold: 6, sku: 'SUP-BF-001' },
  { name: 'Kelloggs Special K 450g', category: 'Breakfast Cereals', costPrice: 240, sellingPrice: 285, stock: 20, unit: 'box', minThreshold: 4, sku: 'SUP-BF-002' },
  { name: 'Muesli Fruit & Nut 400g Pouch', category: 'Breakfast Cereals', costPrice: 220, sellingPrice: 275, stock: 25, unit: 'pouch', minThreshold: 5, sku: 'SUP-BF-003' },
  { name: 'Pintola All Natural Peanut Butter Crunchy 1kg', category: 'Breakfast Cereals', costPrice: 340, sellingPrice: 425, stock: 25, unit: 'jar', minThreshold: 5, sku: 'SUP-BF-004' },
  { name: 'Nutella Hazelnut Spread with Cocoa 350g', category: 'Breakfast Cereals', costPrice: 290, sellingPrice: 350, stock: 20, unit: 'jar', minThreshold: 4, sku: 'SUP-BF-005' },
  { name: 'Hersheys Chocolate Syrup 623g Squeeze Bottle', category: 'Breakfast Cereals', costPrice: 185, sellingPrice: 225, stock: 25, unit: 'bot', minThreshold: 5, sku: 'SUP-BF-006' },
  { name: 'Dabur 100% Pure Honey 500g Glass Bottle', category: 'Breakfast Cereals', costPrice: 195, sellingPrice: 240, stock: 35, unit: 'bot', minThreshold: 8, sku: 'SUP-BF-007' },

  // Gourmet, Pasta & Sauces
  { name: 'Barilla Spaghetti Pasta No. 5 500g', category: 'Gourmet & Pasta', costPrice: 190, sellingPrice: 250, stock: 25, unit: 'box', minThreshold: 5, sku: 'SUP-GRM-001' },
  { name: 'Barilla Penne Rigate Pasta 500g', category: 'Gourmet & Pasta', costPrice: 190, sellingPrice: 250, stock: 25, unit: 'box', minThreshold: 5, sku: 'SUP-GRM-002' },
  { name: 'Borges Extra Virgin Olive Oil 1L Glass Bottle', category: 'Gourmet & Pasta', costPrice: 950, sellingPrice: 1250, stock: 15, unit: 'bot', minThreshold: 3, sku: 'SUP-GRM-003' },
  { name: 'Del Monte Whole Sweet Corn Can 410g', category: 'Gourmet & Pasta', costPrice: 85, sellingPrice: 110, stock: 30, unit: 'can', minThreshold: 6, sku: 'SUP-GRM-004' },
  { name: 'Del Monte Pitted Black Olives 450g Glass Jar', category: 'Gourmet & Pasta', costPrice: 195, sellingPrice: 255, stock: 20, unit: 'jar', minThreshold: 4, sku: 'SUP-GRM-005' },
  { name: 'Tabasco Pepper Sauce 60ml Original', category: 'Gourmet & Pasta', costPrice: 180, sellingPrice: 230, stock: 20, unit: 'bot', minThreshold: 4, sku: 'SUP-GRM-006' },
  { name: 'Kikkoman Naturally Brewed Soy Sauce 250ml', category: 'Gourmet & Pasta', costPrice: 220, sellingPrice: 285, stock: 18, unit: 'bot', minThreshold: 4, sku: 'SUP-GRM-007' },

  // Juices & Beverages
  { name: 'Real Fruit Power Mixed Fruit Juice 1L Tetra', category: 'Juices & Cold Drinks', costPrice: 95, sellingPrice: 120, stock: 40, unit: 'tetra', minThreshold: 10, sku: 'SUP-JUC-001' },
  { name: 'Real Fruit Power Alphonso Mango 1L', category: 'Juices & Cold Drinks', costPrice: 95, sellingPrice: 120, stock: 35, unit: 'tetra', minThreshold: 8, sku: 'SUP-JUC-002' },
  { name: 'Tropicana 100% Orange Juice No Added Sugar 1L', category: 'Juices & Cold Drinks', costPrice: 115, sellingPrice: 145, stock: 30, unit: 'tetra', minThreshold: 6, sku: 'SUP-JUC-003' },
  { name: 'Red Bull Energy Drink Can 250ml', category: 'Juices & Cold Drinks', costPrice: 100, sellingPrice: 125, stock: 48, unit: 'can', minThreshold: 12, sku: 'SUP-JUC-004' },
  { name: 'Monster Energy Drink Original 350ml Can', category: 'Juices & Cold Drinks', costPrice: 95, sellingPrice: 120, stock: 36, unit: 'can', minThreshold: 8, sku: 'SUP-JUC-005' },
  { name: 'Bisleri Mineral Water 1L Bottle (Case of 12)', category: 'Juices & Cold Drinks', costPrice: 180, sellingPrice: 240, stock: 20, unit: 'case', minThreshold: 5, sku: 'SUP-JUC-006' },
  { name: 'Kinley Club Soda 750ml Bottle', category: 'Juices & Cold Drinks', costPrice: 16, sellingPrice: 20, stock: 40, unit: 'bot', minThreshold: 10, sku: 'SUP-JUC-007' },

  // Chips, Crisps & Munchies
  { name: 'Lays India Magic Masala Chips 50g', category: 'Snacks & Munchies', costPrice: 16, sellingPrice: 20, stock: 60, unit: 'pkt', minThreshold: 15, sku: 'SUP-SNP-001' },
  { name: 'Lays Classic Salted Potato Chips 50g', category: 'Snacks & Munchies', costPrice: 16, sellingPrice: 20, stock: 50, unit: 'pkt', minThreshold: 15, sku: 'SUP-SNP-002' },
  { name: 'Doritos Cheese Supreme Nachos 60g', category: 'Snacks & Munchies', costPrice: 24, sellingPrice: 30, stock: 45, unit: 'pkt', minThreshold: 10, sku: 'SUP-SNP-003' },
  { name: 'Kurkure Masala Munch 80g', category: 'Snacks & Munchies', costPrice: 16, sellingPrice: 20, stock: 55, unit: 'pkt', minThreshold: 15, sku: 'SUP-SNP-004' },
  { name: 'Pringles Original Potato Crisps 107g Can', category: 'Snacks & Munchies', costPrice: 95, sellingPrice: 120, stock: 30, unit: 'can', minThreshold: 6, sku: 'SUP-SNP-005' },
  { name: 'Pringles Sour Cream & Onion 107g Can', category: 'Snacks & Munchies', costPrice: 95, sellingPrice: 120, stock: 30, unit: 'can', minThreshold: 6, sku: 'SUP-SNP-006' },
  { name: 'Haldiram Bhujia Sev 400g Pouch', category: 'Snacks & Munchies', costPrice: 90, sellingPrice: 110, stock: 40, unit: 'pouch', minThreshold: 10, sku: 'SUP-SNP-007' },
  { name: 'Haldiram All in One Mixture 400g', category: 'Snacks & Munchies', costPrice: 90, sellingPrice: 110, stock: 35, unit: 'pouch', minThreshold: 8, sku: 'SUP-SNP-008' },
  { name: 'Haldiram Soan Papdi 500g Gift Box', category: 'Snacks & Munchies', costPrice: 125, sellingPrice: 160, stock: 25, unit: 'box', minThreshold: 5, sku: 'SUP-SNP-009' },

  // Chocolates & Confectionery
  { name: 'Cadbury Dairy Milk Silk 150g Bar', category: 'Chocolates', costPrice: 145, sellingPrice: 175, stock: 40, unit: 'bar', minThreshold: 10, sku: 'SUP-CHO-001' },
  { name: 'Cadbury Dairy Milk Fruit & Nut 80g', category: 'Chocolates', costPrice: 75, sellingPrice: 90, stock: 45, unit: 'bar', minThreshold: 10, sku: 'SUP-CHO-002' },
  { name: 'KitKat 4-Finger Chocolate Bar 38g', category: 'Chocolates', costPrice: 24, sellingPrice: 30, stock: 60, unit: 'bar', minThreshold: 15, sku: 'SUP-CHO-003' },
  { name: 'Ferrero Rocher Premium Chocolates Box of 16', category: 'Chocolates', costPrice: 460, sellingPrice: 595, stock: 15, unit: 'box', minThreshold: 3, sku: 'SUP-CHO-004' },
  { name: 'Snickers Peanut Chocolate Bar 45g', category: 'Chocolates', costPrice: 38, sellingPrice: 50, stock: 50, unit: 'bar', minThreshold: 12, sku: 'SUP-CHO-005' },

  // Baby Care & Hygiene
  { name: 'Pampers All Round Protection Diaper Pants L (64s)', category: 'Baby Care', costPrice: 820, sellingPrice: 999, stock: 15, unit: 'pack', minThreshold: 3, sku: 'SUP-BBY-001' },
  { name: 'Huggies Wonder Pants Diapers M (56s)', category: 'Baby Care', costPrice: 650, sellingPrice: 799, stock: 18, unit: 'pack', minThreshold: 4, sku: 'SUP-BBY-002' },
  { name: 'Johnsons Baby No More Tears Shampoo 500ml', category: 'Baby Care', costPrice: 340, sellingPrice: 410, stock: 20, unit: 'bot', minThreshold: 4, sku: 'SUP-BBY-003' },
  { name: 'Himalaya Baby Gentle Wipes (Pack of 72)', category: 'Baby Care', costPrice: 125, sellingPrice: 175, stock: 35, unit: 'pack', minThreshold: 8, sku: 'SUP-BBY-004' },
  { name: 'Cerelac Wheat Apple Baby Cereal 300g Box', category: 'Baby Care', costPrice: 225, sellingPrice: 265, stock: 25, unit: 'box', minThreshold: 5, sku: 'SUP-BBY-005' },
];
