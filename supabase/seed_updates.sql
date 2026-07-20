-- TASK 1: Fix broken LED Desk Lamp image
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'
WHERE title = 'LED Desk Lamp with Wireless Charger';

-- TASK 2: Add 12 new products
INSERT INTO products (title, description, image_url, niche, supplier_url, demand_score, trend_label, is_featured)
VALUES
  ('Cat Water Fountain Automatic Dispenser',
   'Quiet 2L filtered fountain that encourages cats to drink more water with continuous circulation. Ultra-quiet pump and replaceable carbon filters make it a low-maintenance upsell for pet owners.',
   'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400',
   'Pet Supplies', 'https://www.aliexpress.com/wholesale?SearchText=cat+water+fountain', 91, 'Hot', true),

  ('Dog Anxiety Calming Bed Donut',
   'Ultra-soft donut-shaped bed with raised rim that mimics a mother''s embrace, helping anxious dogs settle faster. Machine washable and available in multiple sizes for a wide audience.',
   'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
   'Pet Supplies', 'https://www.aliexpress.com/wholesale?SearchText=calming+dog+bed', 85, 'Trending', true),

  ('Interactive Treat-Dispensing Dog Puzzle Toy',
   'Slow-feeder puzzle toy that slots treats into sliding compartments, keeping dogs mentally stimulated and reducing separation anxiety. Strong repeat-purchase potential across breeds.',
   'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
   'Pet Supplies', 'https://www.aliexpress.com/wholesale?SearchText=dog+puzzle+toy', 78, 'Rising', true),

  ('Electric Mini Vegetable Chopper',
   'Cordless rechargeable chopper that dices onions, garlic, and herbs in seconds with one-touch operation. Dishwasher-safe bowl and blade make it a favorite in kitchen-gadget ad creatives.',
   'https://images.unsplash.com/photo-1584990347449-a41d1cf2b60c?w=400',
   'Kitchen Gadgets', 'https://www.aliexpress.com/wholesale?SearchText=electric+mini+chopper', 88, 'Hot', true),

  ('Reusable Silicone Food Storage Bags Set',
   'Leakproof, freezer-safe silicone bags that replace single-use plastic, dishwasher and microwave safe. Strong eco-angle messaging drives high engagement with sustainability-minded shoppers.',
   'https://images.unsplash.com/photo-1584346133934-a3a2f36cee6b?w=400',
   'Kitchen Gadgets', 'https://www.aliexpress.com/wholesale?SearchText=silicone+food+storage+bags', 74, 'Rising', true),

  ('Multi-Function Rolling Herb & Vegetable Cutter',
   'Rolling cutter with five stainless steel blades for instantly dicing herbs, vegetables, and salads. Highly visual product that performs well in short-form video demos.',
   'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
   'Kitchen Gadgets', 'https://www.aliexpress.com/wholesale?SearchText=rolling+herb+cutter', 79, 'Trending', true),

  ('LED Facial Light Therapy Mask',
   'At-home red and blue light therapy mask targeting acne, fine lines, and skin tone in 10-minute sessions. Premium unboxing experience and strong before/after UGC potential.',
   'https://images.unsplash.com/photo-1616394158624-3e6a1c7b8e5c?w=400',
   'Beauty', 'https://www.aliexpress.com/wholesale?SearchText=led+facial+mask', 93, 'Hot', true),

  ('Scalp Massager Shampoo Brush',
   'Silicone scalp massager that boosts circulation and lathers shampoo more effectively for a spa-like shower experience. Extremely low price point drives impulse purchases at scale.',
   'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
   'Beauty', 'https://www.aliexpress.com/wholesale?SearchText=scalp+massager+brush', 76, 'Rising', true),

  ('Resistance Bands Set with Door Anchor',
   'Five-band progressive resistance set with door anchor and handles for full-body home workouts. Compact and portable, appealing to the growing home-fitness niche.',
   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
   'Fitness', 'https://www.aliexpress.com/wholesale?SearchText=resistance+bands+set', 82, 'Trending', true),

  ('Smart Posture Corrector Trainer',
   'Wearable posture trainer that gently vibrates when it detects slouching, retraining users toward better spinal alignment. Strong pain-point marketing angle for desk workers.',
   'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
   'Fitness', 'https://www.aliexpress.com/wholesale?SearchText=posture+corrector', 87, 'Hot', true),

  ('Baby Head Shaping Pillow Set',
   'Ergonomic memory-foam pillow set designed to prevent flat-head syndrome and support safe, comfortable sleep. High trust and repeat-gifting product for new-parent audiences.',
   'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400',
   'Baby Products', 'https://www.aliexpress.com/wholesale?SearchText=baby+head+shaping+pillow', 80, 'Rising', true),

  ('Wireless Car Phone Mount Charger',
   'Auto-clamping wireless charging mount that snaps onto air vents and charges phones at 15W while driving. Broad appeal and strong margins make it a reliable evergreen SKU.',
   'https://images.unsplash.com/photo-1617704548623-340376564e68?w=400',
   'Car Accessories', 'https://www.aliexpress.com/wholesale?SearchText=wireless+car+charger+mount', 84, 'Trending', true);
