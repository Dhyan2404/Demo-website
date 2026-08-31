// Beauty Parlour / Salon & Cosmetics - ~90 items & services
export const parlourProducts = [
  // Hair Care Products
  { name: 'L’Oréal Professionnel Absolut Repair Shampoo 300ml', category: 'Hair Care', costPrice: 620, sellingPrice: 790, stock: 15, unit: 'bot', minThreshold: 3, sku: 'SAL-HR-001' },
  { name: 'L’Oréal Professionnel Absolut Repair Mask 250ml', category: 'Hair Care', costPrice: 710, sellingPrice: 890, stock: 12, unit: 'tub', minThreshold: 3, sku: 'SAL-HR-002' },
  { name: 'Matrix Opti.Care Smoothing Shampoo 350ml', category: 'Hair Care', costPrice: 380, sellingPrice: 480, stock: 18, unit: 'bot', minThreshold: 4, sku: 'SAL-HR-003' },
  { name: 'Matrix Opti.Care Conditioner 196g', category: 'Hair Care', costPrice: 310, sellingPrice: 395, stock: 18, unit: 'tube', minThreshold: 4, sku: 'SAL-HR-004' },
  { name: 'Streax Professional Spa Hair Treatment Cream 500g', category: 'Hair Care', costPrice: 390, sellingPrice: 520, stock: 10, unit: 'tub', minThreshold: 2, sku: 'SAL-HR-005' },
  { name: 'Livon Professional Hair Serum 100ml', category: 'Hair Care', costPrice: 220, sellingPrice: 299, stock: 25, unit: 'bot', minThreshold: 5, sku: 'SAL-HR-006' },
  { name: 'L’Oréal Mythic Oil Nourishing Serum 100ml', category: 'Hair Care', costPrice: 850, sellingPrice: 1100, stock: 8, unit: 'bot', minThreshold: 2, sku: 'SAL-HR-007' },
  { name: 'Garnier Color Naturals Black 1.0 Hair Color Kit', category: 'Hair Care', costPrice: 160, sellingPrice: 210, stock: 30, unit: 'kit', minThreshold: 6, sku: 'SAL-HR-008' },
  { name: 'L’Oréal Excellence Creme Hair Color Dark Brown 3', category: 'Hair Care', costPrice: 520, sellingPrice: 650, stock: 15, unit: 'box', minThreshold: 3, sku: 'SAL-HR-009' },
  { name: 'Streax Hair Serum with Walnut Oil 100ml', category: 'Hair Care', costPrice: 185, sellingPrice: 240, stock: 20, unit: 'bot', minThreshold: 4, sku: 'SAL-HR-010' },
  { name: 'Schwarzkopf Professional Taft Hair Spray 250ml', category: 'Hair Care', costPrice: 360, sellingPrice: 475, stock: 12, unit: 'can', minThreshold: 3, sku: 'SAL-HR-011' },
  { name: 'BBlunt Heat Protection Hair Mist 150ml', category: 'Hair Care', costPrice: 380, sellingPrice: 499, stock: 10, unit: 'bot', minThreshold: 2, sku: 'SAL-HR-012' },

  // Facial & Skincare Kits
  { name: 'O3+ Bridal Facial Kit Oxygenating Glow', category: 'Facial Kits', costPrice: 2400, sellingPrice: 3200, stock: 6, unit: 'kit', minThreshold: 2, sku: 'SAL-FCL-001' },
  { name: 'O3+ D-Tan Professional Pack 300g', category: 'Facial Kits', costPrice: 1150, sellingPrice: 1550, stock: 8, unit: 'tub', minThreshold: 2, sku: 'SAL-FCL-002' },
  { name: 'VLCC Diamond Facial Kit (Single Use 60g)', category: 'Facial Kits', costPrice: 260, sellingPrice: 375, stock: 20, unit: 'kit', minThreshold: 5, sku: 'SAL-FCL-003' },
  { name: 'VLCC Gold Radiance Facial Kit (Single Use 60g)', category: 'Facial Kits', costPrice: 220, sellingPrice: 315, stock: 25, unit: 'kit', minThreshold: 5, sku: 'SAL-FCL-004' },
  { name: 'Lotus Herbals Radiant Gold Glow Facial Kit', category: 'Facial Kits', costPrice: 240, sellingPrice: 350, stock: 15, unit: 'kit', minThreshold: 3, sku: 'SAL-FCL-005' },
  { name: 'Cheryls Cosmeceuticals TanClear Facial Kit', category: 'Facial Kits', costPrice: 1600, sellingPrice: 2100, stock: 5, unit: 'kit', minThreshold: 1, sku: 'SAL-FCL-006' },
  { name: 'Aroma Magic Pearl Facial Kit 5-Step', category: 'Facial Kits', costPrice: 280, sellingPrice: 395, stock: 12, unit: 'kit', minThreshold: 3, sku: 'SAL-FCL-007' },
  { name: 'Biotique Bio Papaya Tan Removal Scrub 100g', category: 'Facial Kits', costPrice: 140, sellingPrice: 199, stock: 20, unit: 'tub', minThreshold: 4, sku: 'SAL-FCL-008' },
  { name: 'Raaga Professional De-Tan Cream 500g Tub', category: 'Facial Kits', costPrice: 850, sellingPrice: 1150, stock: 6, unit: 'tub', minThreshold: 2, sku: 'SAL-FCL-009' },

  // Waxing & Bleach Products
  { name: 'Rica Brazilian Avocado Wax (Hard Wax) 800ml', category: 'Waxing & Bleach', costPrice: 1100, sellingPrice: 1450, stock: 8, unit: 'can', minThreshold: 2, sku: 'SAL-WAX-001' },
  { name: 'Rica White Chocolate Liposoluble Wax 800ml', category: 'Waxing & Bleach', costPrice: 950, sellingPrice: 1250, stock: 10, unit: 'can', minThreshold: 2, sku: 'SAL-WAX-002' },
  { name: 'Sleek Honey Cold Wax 800g', category: 'Waxing & Bleach', costPrice: 160, sellingPrice: 230, stock: 20, unit: 'tub', minThreshold: 5, sku: 'SAL-WAX-003' },
  { name: 'Sleek Chocolate Warm Wax 800g', category: 'Waxing & Bleach', costPrice: 180, sellingPrice: 250, stock: 18, unit: 'tub', minThreshold: 4, sku: 'SAL-WAX-004' },
  { name: 'Professional Non-Woven Waxing Strips (100 Strips)', category: 'Waxing & Bleach', costPrice: 65, sellingPrice: 110, stock: 35, unit: 'pkt', minThreshold: 8, sku: 'SAL-WAX-005' },
  { name: 'OxyGlow Oxy Bleach Cream 250g Jar', category: 'Waxing & Bleach', costPrice: 160, sellingPrice: 240, stock: 15, unit: 'jar', minThreshold: 3, sku: 'SAL-WAX-006' },
  { name: 'Fem Saffron & Milk Bleach 40g', category: 'Waxing & Bleach', costPrice: 55, sellingPrice: 75, stock: 25, unit: 'box', minThreshold: 5, sku: 'SAL-WAX-007' },
  { name: 'Rica Pre & After Wax Oil Lotion 250ml', category: 'Waxing & Bleach', costPrice: 420, sellingPrice: 580, stock: 10, unit: 'bot', minThreshold: 2, sku: 'SAL-WAX-008' },

  // Makeup & Nails
  { name: 'Maybelline New York Fit Me Matte Foundation 30ml', category: 'Makeup & Nails', costPrice: 410, sellingPrice: 549, stock: 15, unit: 'bot', minThreshold: 3, sku: 'SAL-MKP-001' },
  { name: 'Maybelline Colossal Waterproof Mascara 10ml', category: 'Makeup & Nails', costPrice: 280, sellingPrice: 399, stock: 20, unit: 'pcs', minThreshold: 4, sku: 'SAL-MKP-002' },
  { name: 'Lakmé Eyeconic Kajal Deep Black 0.35g', category: 'Makeup & Nails', costPrice: 160, sellingPrice: 210, stock: 35, unit: 'pcs', minThreshold: 8, sku: 'SAL-MKP-003' },
  { name: 'Sugar Cosmetics Matte As Hell Crayon Lipstick', category: 'Makeup & Nails', costPrice: 580, sellingPrice: 799, stock: 12, unit: 'pcs', minThreshold: 3, sku: 'SAL-MKP-004' },
  { name: 'PAC HD Liquid Concealer 10ml', category: 'Makeup & Nails', costPrice: 540, sellingPrice: 725, stock: 10, unit: 'tube', minThreshold: 2, sku: 'SAL-MKP-005' },
  { name: 'Swiss Beauty Ultimate Eyeshadow Palette', category: 'Makeup & Nails', costPrice: 240, sellingPrice: 349, stock: 15, unit: 'palette', minThreshold: 3, sku: 'SAL-MKP-006' },
  { name: 'Colorbar Nail Lacquer Professional (Red Shades)', category: 'Makeup & Nails', costPrice: 140, sellingPrice: 199, stock: 25, unit: 'bot', minThreshold: 5, sku: 'SAL-MKP-007' },
  { name: 'Colorbar Nail Polish Remover Acetone-Free 110ml', category: 'Makeup & Nails', costPrice: 110, sellingPrice: 150, stock: 20, unit: 'bot', minThreshold: 4, sku: 'SAL-MKP-008' },
  { name: 'UV LED Gel Nail Polish Base & Top Coat Set', category: 'Makeup & Nails', costPrice: 420, sellingPrice: 650, stock: 8, unit: 'set', minThreshold: 2, sku: 'SAL-MKP-009' },

  // Salon Services (POS Billing)
  { name: 'Service: Eyebrow Threading & Upper Lip', category: 'Salon Services', costPrice: 10, sellingPrice: 60, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-001' },
  { name: 'Service: Full Face Threading', category: 'Salon Services', costPrice: 15, sellingPrice: 120, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-002' },
  { name: 'Service: Full Arms + Full Legs Honey Waxing', category: 'Salon Services', costPrice: 80, sellingPrice: 450, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-003' },
  { name: 'Service: Rica Chocolate Waxing (Arms + Legs)', category: 'Salon Services', costPrice: 220, sellingPrice: 850, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-004' },
  { name: 'Service: O3+ Whitening & Glow Facial', category: 'Salon Services', costPrice: 350, sellingPrice: 1500, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-005' },
  { name: 'Service: VLCC Gold Instant Glow Facial', category: 'Salon Services', costPrice: 180, sellingPrice: 750, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-006' },
  { name: 'Service: L’Oréal Hair Spa Deep Nourish', category: 'Salon Services', costPrice: 150, sellingPrice: 800, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-007' },
  { name: 'Service: Hair Wash + Blowdry Styling', category: 'Salon Services', costPrice: 30, sellingPrice: 250, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-008' },
  { name: 'Service: Deluxe Manicure & Pedicure Combo', category: 'Salon Services', costPrice: 120, sellingPrice: 650, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-009' },
  { name: 'Service: Bridal Makeup & Hair Styling HD', category: 'Salon Services', costPrice: 1200, sellingPrice: 6500, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-010' },
  { name: 'Service: Party Makeup & Saree Draping', category: 'Salon Services', costPrice: 400, sellingPrice: 2200, stock: 999, unit: 'srv', minThreshold: 100, sku: 'SAL-SRV-011' },
];
