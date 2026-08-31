// Medical & Pharmacy Store - ~150 items
export const pharmacyProducts = [
  // Pain Relief, Fever & Cold (OTC)
  { name: 'Dolo 650mg Paracetamol Tablets (Strip of 15)', category: 'OTC & Fever', costPrice: 24, sellingPrice: 32, stock: 120, unit: 'strip', minThreshold: 30, sku: 'MED-OTC-001' },
  { name: 'Crocin Advance 500mg Fast Relief (Strip of 15)', category: 'OTC & Fever', costPrice: 18, sellingPrice: 25, stock: 100, unit: 'strip', minThreshold: 25, sku: 'MED-OTC-002' },
  { name: 'Crocin Pain Relief Paracetamol + Caffeine (Strip 15)', category: 'OTC & Fever', costPrice: 48, sellingPrice: 65, stock: 60, unit: 'strip', minThreshold: 15, sku: 'MED-OTC-003' },
  { name: 'Combiflam Paracetamol + Ibuprofen (Strip of 20)', category: 'OTC & Fever', costPrice: 36, sellingPrice: 48, stock: 80, unit: 'strip', minThreshold: 20, sku: 'MED-OTC-004' },
  { name: 'Saridon Headache Relief Tablet (Strip of 10)', category: 'OTC & Fever', costPrice: 35, sellingPrice: 45, stock: 90, unit: 'strip', minThreshold: 20, sku: 'MED-OTC-005' },
  { name: 'Disprin Regular 325mg Effervescent (Strip 10)', category: 'OTC & Fever', costPrice: 10, sellingPrice: 14, stock: 80, unit: 'strip', minThreshold: 20, sku: 'MED-OTC-006' },
  { name: 'Cheston Cold Tablet (Strip of 10)', category: 'OTC & Fever', costPrice: 38, sellingPrice: 52, stock: 60, unit: 'strip', minThreshold: 15, sku: 'MED-OTC-007' },
  { name: 'Sinarest New Tablet Cold & Sinus (Strip 10)', category: 'OTC & Fever', costPrice: 45, sellingPrice: 60, stock: 50, unit: 'strip', minThreshold: 15, sku: 'MED-OTC-008' },
  { name: 'Wikoryl Cold & Flu Tablet (Strip of 10)', category: 'OTC & Fever', costPrice: 40, sellingPrice: 55, stock: 50, unit: 'strip', minThreshold: 12, sku: 'MED-OTC-009' },
  { name: 'Vicks VapoRub Balm 50ml Jar', category: 'OTC & Fever', costPrice: 125, sellingPrice: 150, stock: 40, unit: 'jar', minThreshold: 10, sku: 'MED-OTC-010' },
  { name: 'Vicks Inhaler for Stuffy Nose (Pack of 2)', category: 'OTC & Fever', costPrice: 85, sellingPrice: 110, stock: 50, unit: 'pack', minThreshold: 15, sku: 'MED-OTC-011' },
  { name: 'Amrutanjan Strong Pain Balm 50g', category: 'OTC & Fever', costPrice: 80, sellingPrice: 105, stock: 35, unit: 'jar', minThreshold: 8, sku: 'MED-OTC-012' },
  { name: 'Moov Pain Relief Fast Acting Spray 80g', category: 'OTC & Fever', costPrice: 160, sellingPrice: 195, stock: 30, unit: 'can', minThreshold: 8, sku: 'MED-OTC-013' },
  { name: 'Volini Pain Relief Gel 50g Tube', category: 'OTC & Fever', costPrice: 130, sellingPrice: 160, stock: 35, unit: 'tube', minThreshold: 8, sku: 'MED-OTC-014' },
  { name: 'Iodex Double Power Balm 40g', category: 'OTC & Fever', costPrice: 110, sellingPrice: 135, stock: 30, unit: 'jar', minThreshold: 6, sku: 'MED-OTC-015' },

  // Cough Syrups & Lozenges
  { name: 'Benadryl Dry Cough Syrup 100ml', category: 'Cough Syrups', costPrice: 95, sellingPrice: 125, stock: 40, unit: 'bot', minThreshold: 10, sku: 'MED-CGH-001' },
  { name: 'Ascoril D Plus Sugar Free Syrup 100ml', category: 'Cough Syrups', costPrice: 110, sellingPrice: 142, stock: 35, unit: 'bot', minThreshold: 8, sku: 'MED-CGH-002' },
  { name: 'Grilinctus BM Cough Syrup 100ml', category: 'Cough Syrups', costPrice: 90, sellingPrice: 118, stock: 30, unit: 'bot', minThreshold: 8, sku: 'MED-CGH-003' },
  { name: 'Dabur Honitus Herbal Cough Syrup 100ml', category: 'Cough Syrups', costPrice: 82, sellingPrice: 105, stock: 45, unit: 'bot', minThreshold: 10, sku: 'MED-CGH-004' },
  { name: 'Strepsils Honey & Lemon Lozenges (Jar of 200)', category: 'Cough Syrups', costPrice: 380, sellingPrice: 500, stock: 10, unit: 'jar', minThreshold: 2, sku: 'MED-CGH-005' },
  { name: 'Vicks Cough Drops Ginger (Pouch of 50)', category: 'Cough Syrups', costPrice: 70, sellingPrice: 100, stock: 25, unit: 'pouch', minThreshold: 5, sku: 'MED-CGH-006' },

  // Digestion, Antacids & Stomach
  { name: 'Eno Fruit Salt Lemon Flavor 100g Bottle', category: 'Digestion & Gut', costPrice: 125, sellingPrice: 155, stock: 35, unit: 'bot', minThreshold: 8, sku: 'MED-DIG-001' },
  { name: 'Eno Regular Sachets 5g (Box of 30)', category: 'Digestion & Gut', costPrice: 200, sellingPrice: 270, stock: 20, unit: 'box', minThreshold: 5, sku: 'MED-DIG-002' },
  { name: 'Digene Mint Antacid Liquid 200ml', category: 'Digestion & Gut', costPrice: 115, sellingPrice: 145, stock: 35, unit: 'bot', minThreshold: 8, sku: 'MED-DIG-003' },
  { name: 'Digene Chewable Antacid Tablets Mint (Strip 15)', category: 'Digestion & Gut', costPrice: 18, sellingPrice: 26, stock: 60, unit: 'strip', minThreshold: 15, sku: 'MED-DIG-004' },
  { name: 'Gelusil MPS Liquid Antacid 200ml', category: 'Digestion & Gut', costPrice: 110, sellingPrice: 140, stock: 30, unit: 'bot', minThreshold: 6, sku: 'MED-DIG-005' },
  { name: 'Pantocid 40mg Pantoprazole (Strip of 15)', category: 'Digestion & Gut', costPrice: 120, sellingPrice: 165, stock: 50, unit: 'strip', minThreshold: 12, sku: 'MED-DIG-006' },
  { name: 'Pan D Capsule Pantoprazole + Domperidone (Strip 15)', category: 'Digestion & Gut', costPrice: 160, sellingPrice: 215, stock: 60, unit: 'strip', minThreshold: 15, sku: 'MED-DIG-007' },
  { name: 'Omez 20mg Omeprazole Capsules (Strip of 20)', category: 'Digestion & Gut', costPrice: 48, sellingPrice: 65, stock: 55, unit: 'strip', minThreshold: 12, sku: 'MED-DIG-008' },
  { name: 'Sporlac DS Probiotic Tablets (Strip of 20)', category: 'Digestion & Gut', costPrice: 95, sellingPrice: 130, stock: 35, unit: 'strip', minThreshold: 8, sku: 'MED-DIG-009' },
  { name: 'Electral ORS Powder WHO Formula 21.8g (Box 20)', category: 'Digestion & Gut', costPrice: 340, sellingPrice: 440, stock: 15, unit: 'box', minThreshold: 4, sku: 'MED-DIG-010' },
  { name: 'Cremaffin Mixed Fruit Laxative Syrup 200ml', category: 'Digestion & Gut', costPrice: 180, sellingPrice: 235, stock: 20, unit: 'bot', minThreshold: 4, sku: 'MED-DIG-011' },
  { name: 'Kayam Churna Ayurvedic Constipation Powder 100g', category: 'Digestion & Gut', costPrice: 75, sellingPrice: 95, stock: 30, unit: 'bot', minThreshold: 6, sku: 'MED-DIG-012' },

  // Vitamins, Supplements & Immunity
  { name: 'Becosules Z B-Complex with Zinc (Strip of 20)', category: 'Vitamins & Nutrition', costPrice: 42, sellingPrice: 55, stock: 70, unit: 'strip', minThreshold: 15, sku: 'MED-VIT-001' },
  { name: 'Limcee 500mg Vitamin C Chewable (Strip of 15)', category: 'Vitamins & Nutrition', costPrice: 20, sellingPrice: 28, stock: 80, unit: 'strip', minThreshold: 20, sku: 'MED-VIT-002' },
  { name: 'Shelcal 500mg Calcium + Vit D3 (Strip of 15)', category: 'Vitamins & Nutrition', costPrice: 95, sellingPrice: 130, stock: 60, unit: 'strip', minThreshold: 15, sku: 'MED-VIT-003' },
  { name: 'Revital H Daily Multivitamin Men (Strip of 10)', category: 'Vitamins & Nutrition', costPrice: 85, sellingPrice: 110, stock: 40, unit: 'strip', minThreshold: 8, sku: 'MED-VIT-004' },
  { name: 'Revital H Woman Daily Multivitamin (Strip of 10)', category: 'Vitamins & Nutrition', costPrice: 90, sellingPrice: 115, stock: 35, unit: 'strip', minThreshold: 8, sku: 'MED-VIT-005' },
  { name: 'Supradyn Daily Multivitamin Tablet (Strip of 15)', category: 'Vitamins & Nutrition', costPrice: 45, sellingPrice: 59, stock: 60, unit: 'strip', minThreshold: 12, sku: 'MED-VIT-006' },
  { name: 'Evion 400mg Vitamin E Capsules (Strip of 10)', category: 'Vitamins & Nutrition', costPrice: 28, sellingPrice: 38, stock: 80, unit: 'strip', minThreshold: 20, sku: 'MED-VIT-007' },
  { name: 'Seven Seas Cod Liver Oil Capsules 100s', category: 'Vitamins & Nutrition', costPrice: 290, sellingPrice: 375, stock: 20, unit: 'bot', minThreshold: 4, sku: 'MED-VIT-008' },
  { name: 'Dabur Chyawanprash 2X Immunity 1kg', category: 'Vitamins & Nutrition', costPrice: 340, sellingPrice: 410, stock: 25, unit: 'tub', minThreshold: 5, sku: 'MED-VIT-009' },

  // First Aid, Bandages & Diagnostics
  { name: 'Hansaplast Regular Bandages (Box of 100 Strips)', category: 'First Aid & Surgical', costPrice: 160, sellingPrice: 220, stock: 20, unit: 'box', minThreshold: 5, sku: 'MED-AID-001' },
  { name: 'Betadine 5% Antiseptic Ointment 20g Tube', category: 'First Aid & Surgical', costPrice: 70, sellingPrice: 92, stock: 40, unit: 'tube', minThreshold: 8, sku: 'MED-AID-002' },
  { name: 'Soframycin Skin Ointment 30g Tube', category: 'First Aid & Surgical', costPrice: 48, sellingPrice: 62, stock: 45, unit: 'tube', minThreshold: 10, sku: 'MED-AID-003' },
  { name: 'Boroline Antiseptic Ayurvedic Cream 20g', category: 'First Aid & Surgical', costPrice: 38, sellingPrice: 48, stock: 50, unit: 'tube', minThreshold: 12, sku: 'MED-AID-004' },
  { name: 'Cotton Absorbent Roll 100g Hospital Grade', category: 'First Aid & Surgical', costPrice: 35, sellingPrice: 55, stock: 35, unit: 'roll', minThreshold: 8, sku: 'MED-AID-005' },
  { name: 'Crepe Bandage 10cm Heavy Elastic Roll', category: 'First Aid & Surgical', costPrice: 95, sellingPrice: 145, stock: 25, unit: 'roll', minThreshold: 5, sku: 'MED-AID-006' },
  { name: 'Accu-Chek Active Glucose Test Strips (50 Strips)', category: 'Diagnostics', costPrice: 850, sellingPrice: 1099, stock: 15, unit: 'box', minThreshold: 3, sku: 'MED-DIA-001' },
  { name: 'Dr. Morepen Digital Thermometer Rigid Tip', category: 'Diagnostics', costPrice: 120, sellingPrice: 180, stock: 25, unit: 'pcs', minThreshold: 5, sku: 'MED-DIA-002' },
  { name: 'Omron Automatic Digital BP Monitor Hem-7120', category: 'Diagnostics', costPrice: 1750, sellingPrice: 2250, stock: 6, unit: 'pcs', minThreshold: 2, sku: 'MED-DIA-003' },
];
