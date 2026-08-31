// Dairy / Milk Shop - ~80 items
export const dairyProducts = [
  // Fresh Milk Varieties
  { name: 'Amul Taaza Toned Milk 500ml', category: 'Fresh Milk', costPrice: 26, sellingPrice: 28, stock: 60, unit: 'pouch', minThreshold: 15, sku: 'DRY-MLK-001' },
  { name: 'Amul Taaza Toned Milk 1L', category: 'Fresh Milk', costPrice: 52, sellingPrice: 56, stock: 45, unit: 'pouch', minThreshold: 10, sku: 'DRY-MLK-002' },
  { name: 'Amul Gold Full Cream Milk 500ml', category: 'Fresh Milk', costPrice: 32, sellingPrice: 34, stock: 70, unit: 'pouch', minThreshold: 15, sku: 'DRY-MLK-003' },
  { name: 'Amul Gold Full Cream Milk 1L', category: 'Fresh Milk', costPrice: 63, sellingPrice: 68, stock: 50, unit: 'pouch', minThreshold: 12, sku: 'DRY-MLK-004' },
  { name: 'Mother Dairy Full Cream Milk 500ml', category: 'Fresh Milk', costPrice: 32, sellingPrice: 34, stock: 40, unit: 'pouch', minThreshold: 10, sku: 'DRY-MLK-005' },
  { name: 'Mother Dairy Toned Milk 1L', category: 'Fresh Milk', costPrice: 52, sellingPrice: 56, stock: 35, unit: 'pouch', minThreshold: 10, sku: 'DRY-MLK-006' },
  { name: 'Amul Cow Milk 500ml', category: 'Fresh Milk', costPrice: 27, sellingPrice: 29, stock: 40, unit: 'pouch', minThreshold: 10, sku: 'DRY-MLK-007' },
  { name: 'Amul Slim & Trim Skimmed Milk 500ml', category: 'Fresh Milk', costPrice: 24, sellingPrice: 26, stock: 25, unit: 'pouch', minThreshold: 6, sku: 'DRY-MLK-008' },
  { name: 'Amul Buffalo Milk 1L', category: 'Fresh Milk', costPrice: 68, sellingPrice: 74, stock: 30, unit: 'pouch', minThreshold: 8, sku: 'DRY-MLK-009' },
  { name: 'Fresh Raw Cow Milk (Per Liter)', category: 'Fresh Milk', costPrice: 48, sellingPrice: 58, stock: 80, unit: 'ltr', minThreshold: 20, sku: 'DRY-MLK-010' },
  { name: 'Fresh Raw Buffalo Milk (Per Liter)', category: 'Fresh Milk', costPrice: 58, sellingPrice: 70, stock: 90, unit: 'ltr', minThreshold: 20, sku: 'DRY-MLK-011' },

  // Paneer & Tofu
  { name: 'Fresh Malai Paneer (Loose Kg)', category: 'Paneer & Tofu', costPrice: 320, sellingPrice: 380, stock: 35, unit: 'kg', minThreshold: 8, sku: 'DRY-PAN-001' },
  { name: 'Amul Fresh Paneer 200g Pkt', category: 'Paneer & Tofu', costPrice: 82, sellingPrice: 95, stock: 40, unit: 'pkt', minThreshold: 10, sku: 'DRY-PAN-002' },
  { name: 'Amul Fresh Paneer 1kg Block', category: 'Paneer & Tofu', costPrice: 385, sellingPrice: 435, stock: 15, unit: 'block', minThreshold: 4, sku: 'DRY-PAN-003' },
  { name: 'Mother Dairy Classic Paneer 200g', category: 'Paneer & Tofu', costPrice: 80, sellingPrice: 92, stock: 30, unit: 'pkt', minThreshold: 8, sku: 'DRY-PAN-004' },
  { name: 'Organic Soya Tofu 200g', category: 'Paneer & Tofu', costPrice: 45, sellingPrice: 65, stock: 20, unit: 'pkt', minThreshold: 5, sku: 'DRY-PAN-005' },
  { name: 'Low Fat Protein Paneer 200g', category: 'Paneer & Tofu', costPrice: 90, sellingPrice: 110, stock: 20, unit: 'pkt', minThreshold: 4, sku: 'DRY-PAN-006' },

  // Curd, Buttermilk & Lassi
  { name: 'Amul Masti Dahi 400g Tub', category: 'Curd & Lassi', costPrice: 36, sellingPrice: 42, stock: 45, unit: 'tub', minThreshold: 10, sku: 'DRY-CRD-001' },
  { name: 'Amul Masti Dahi 1kg Tub', category: 'Curd & Lassi', costPrice: 78, sellingPrice: 90, stock: 30, unit: 'tub', minThreshold: 8, sku: 'DRY-CRD-002' },
  { name: 'Mother Dairy Classic Dahi 400g Pouch', category: 'Curd & Lassi', costPrice: 32, sellingPrice: 38, stock: 35, unit: 'pouch', minThreshold: 8, sku: 'DRY-CRD-003' },
  { name: 'Fresh Loose Khoya / Mawa (Per Kg)', category: 'Curd & Lassi', costPrice: 340, sellingPrice: 420, stock: 20, unit: 'kg', minThreshold: 5, sku: 'DRY-CRD-004' },
  { name: 'Amul Masala Buttermilk (Chaas) 200ml', category: 'Curd & Lassi', costPrice: 12, sellingPrice: 15, stock: 60, unit: 'pkt', minThreshold: 15, sku: 'DRY-CRD-005' },
  { name: 'Amul Spiced Chaas 500ml Pouch', category: 'Curd & Lassi', costPrice: 26, sellingPrice: 30, stock: 40, unit: 'pouch', minThreshold: 10, sku: 'DRY-CRD-006' },
  { name: 'Mother Dairy Tadka Chhach 200ml', category: 'Curd & Lassi', costPrice: 12, sellingPrice: 15, stock: 40, unit: 'pkt', minThreshold: 10, sku: 'DRY-CRD-007' },
  { name: 'Amul Sweet Lassi Rose 200ml Tetra', category: 'Curd & Lassi', costPrice: 20, sellingPrice: 25, stock: 35, unit: 'tetra', minThreshold: 8, sku: 'DRY-CRD-008' },
  { name: 'Amul Sweet Lassi Mango 200ml', category: 'Curd & Lassi', costPrice: 20, sellingPrice: 25, stock: 35, unit: 'tetra', minThreshold: 8, sku: 'DRY-CRD-009' },
  { name: 'Fresh Sweet Kulhad Lassi (Per Cup)', category: 'Curd & Lassi', costPrice: 25, sellingPrice: 45, stock: 50, unit: 'cup', minThreshold: 10, sku: 'DRY-CRD-010' },

  // Butter & Cheese
  { name: 'Amul Pasteurized Butter 100g', category: 'Butter & Cheese', costPrice: 50, sellingPrice: 58, stock: 50, unit: 'box', minThreshold: 12, sku: 'DRY-BTR-001' },
  { name: 'Amul Pasteurized Butter 500g', category: 'Butter & Cheese', costPrice: 245, sellingPrice: 275, stock: 30, unit: 'box', minThreshold: 8, sku: 'DRY-BTR-002' },
  { name: 'Amul Garlic & Herbs Butter 100g', category: 'Butter & Cheese', costPrice: 55, sellingPrice: 65, stock: 25, unit: 'box', minThreshold: 5, sku: 'DRY-BTR-003' },
  { name: 'Fresh White Butter (Makkhan) 500g', category: 'Butter & Cheese', costPrice: 220, sellingPrice: 280, stock: 20, unit: 'tub', minThreshold: 5, sku: 'DRY-BTR-004' },
  { name: 'Amul Processed Cheese Block 200g', category: 'Butter & Cheese', costPrice: 118, sellingPrice: 135, stock: 30, unit: 'box', minThreshold: 6, sku: 'DRY-BTR-005' },
  { name: 'Amul Cheese Slices 200g (10 Slices)', category: 'Butter & Cheese', costPrice: 125, sellingPrice: 145, stock: 35, unit: 'pack', minThreshold: 8, sku: 'DRY-BTR-006' },
  { name: 'Amul Cheese Cubes 200g', category: 'Butter & Cheese', costPrice: 120, sellingPrice: 140, stock: 25, unit: 'box', minThreshold: 6, sku: 'DRY-BTR-007' },
  { name: 'Amul Mozzarella Pizza Cheese Shredded 200g', category: 'Butter & Cheese', costPrice: 105, sellingPrice: 125, stock: 25, unit: 'pkt', minThreshold: 5, sku: 'DRY-BTR-008' },
  { name: 'Amul Cheese Spread Plain 200g Tub', category: 'Butter & Cheese', costPrice: 90, sellingPrice: 105, stock: 20, unit: 'tub', minThreshold: 4, sku: 'DRY-BTR-009' },
  { name: 'Go Cheese Angle Triangles 100g', category: 'Butter & Cheese', costPrice: 65, sellingPrice: 80, stock: 20, unit: 'box', minThreshold: 4, sku: 'DRY-BTR-010' },

  // Ghee & Creams
  { name: 'Amul Pure Desi Ghee 1L Tin', category: 'Ghee & Creams', costPrice: 580, sellingPrice: 640, stock: 25, unit: 'tin', minThreshold: 5, sku: 'DRY-GHE-001' },
  { name: 'Amul Pure Ghee 500ml Pouch', category: 'Ghee & Creams', costPrice: 290, sellingPrice: 320, stock: 30, unit: 'pouch', minThreshold: 6, sku: 'DRY-GHE-002' },
  { name: 'Amul Fresh Cream 250ml Tetra', category: 'Ghee & Creams', costPrice: 60, sellingPrice: 70, stock: 35, unit: 'tetra', minThreshold: 8, sku: 'DRY-GHE-003' },
  { name: 'Amul Fresh Cream 1L Tetra', category: 'Ghee & Creams', costPrice: 215, sellingPrice: 245, stock: 15, unit: 'tetra', minThreshold: 4, sku: 'DRY-GHE-004' },
  { name: 'Fresh Malai / Clotted Cream 500g', category: 'Ghee & Creams', costPrice: 180, sellingPrice: 230, stock: 15, unit: 'tub', minThreshold: 4, sku: 'DRY-GHE-005' },
  { name: 'Amul Mithai Mate (Condensed Milk) 400g', category: 'Ghee & Creams', costPrice: 120, sellingPrice: 140, stock: 25, unit: 'tin', minThreshold: 5, sku: 'DRY-GHE-006' },

  // Ice Creams & Flavored Drinks
  { name: 'Amul Kool Kesar Badam Drink 200ml Can', category: 'Flavored Drinks', costPrice: 28, sellingPrice: 35, stock: 40, unit: 'can', minThreshold: 10, sku: 'DRY-KL-001' },
  { name: 'Amul Kool Cafe 200ml Can', category: 'Flavored Drinks', costPrice: 28, sellingPrice: 35, stock: 35, unit: 'can', minThreshold: 8, sku: 'DRY-KL-002' },
  { name: 'Amul Kool Strawberry 200ml Bottle', category: 'Flavored Drinks', costPrice: 22, sellingPrice: 28, stock: 30, unit: 'bot', minThreshold: 6, sku: 'DRY-KL-003' },
  { name: 'Amul Vanilla Gold Ice Cream 1L Tub', category: 'Ice Creams', costPrice: 160, sellingPrice: 190, stock: 15, unit: 'tub', minThreshold: 4, sku: 'DRY-ICE-001' },
  { name: 'Amul Belgian Chocolate Ice Cream 1L', category: 'Ice Creams', costPrice: 210, sellingPrice: 250, stock: 12, unit: 'tub', minThreshold: 3, sku: 'DRY-ICE-002' },
  { name: 'Amul Kulfi Roll Cut Matka Kulfi', category: 'Ice Creams', costPrice: 35, sellingPrice: 45, stock: 25, unit: 'cup', minThreshold: 6, sku: 'DRY-ICE-003' },
  { name: 'Amul Choco Feast Ice Cream Cone', category: 'Ice Creams', costPrice: 32, sellingPrice: 40, stock: 30, unit: 'cone', minThreshold: 8, sku: 'DRY-ICE-004' },
  { name: 'Amul Butterscotch Cone', category: 'Ice Creams', costPrice: 32, sellingPrice: 40, stock: 30, unit: 'cone', minThreshold: 8, sku: 'DRY-ICE-005' },

  // Bakery Breads & Eggs
  { name: 'Farm Fresh Brown Eggs (Tray of 30)', category: 'Eggs & Breads', costPrice: 190, sellingPrice: 230, stock: 15, unit: 'tray', minThreshold: 4, sku: 'DRY-EGG-001' },
  { name: 'White Farm Eggs (Tray of 30)', category: 'Eggs & Breads', costPrice: 165, sellingPrice: 195, stock: 20, unit: 'tray', minThreshold: 5, sku: 'DRY-EGG-002' },
  { name: 'White Farm Eggs (Pack of 6)', category: 'Eggs & Breads', costPrice: 36, sellingPrice: 45, stock: 30, unit: 'pack', minThreshold: 8, sku: 'DRY-EGG-003' },
  { name: 'English Oven Sandwich White Bread 400g', category: 'Eggs & Breads', costPrice: 38, sellingPrice: 45, stock: 25, unit: 'loaf', minThreshold: 6, sku: 'DRY-EGG-004' },
  { name: 'English Oven 100% Whole Wheat Bread 400g', category: 'Eggs & Breads', costPrice: 45, sellingPrice: 55, stock: 20, unit: 'loaf', minThreshold: 5, sku: 'DRY-EGG-005' },
  { name: 'English Oven Multigrain Bread 400g', category: 'Eggs & Breads', costPrice: 52, sellingPrice: 65, stock: 15, unit: 'loaf', minThreshold: 4, sku: 'DRY-EGG-006' },
  { name: 'Fresh Pav Buns (Pack of 6)', category: 'Eggs & Breads', costPrice: 20, sellingPrice: 28, stock: 30, unit: 'pack', minThreshold: 8, sku: 'DRY-EGG-007' },
  { name: 'Burger Buns Jumbo (Pack of 2)', category: 'Eggs & Breads', costPrice: 25, sellingPrice: 35, stock: 20, unit: 'pack', minThreshold: 5, sku: 'DRY-EGG-008' },
];
