-- 15 more winning products across 7 niches
INSERT INTO products (title, description, image_url, niche, supplier_url, demand_score, trend_label, is_featured)
VALUES
  -- Home Decor (3)
  ('Sunset Projection Lamp',
   'RGB projector lamp that casts a warm, adjustable sunset glow across a room for photos, ambiance, and relaxation. Extremely photogenic product with viral potential on TikTok and Instagram Reels.',
   'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400',
   'Home Decor', 'https://www.aliexpress.com/wholesale?SearchText=sunset+projection+lamp', 92, 'Hot', true),

  ('Macrame Wall Hanging Set',
   'Handwoven boho macrame wall art set that instantly upgrades bedrooms and living rooms. Strong Pinterest and Instagram aesthetic appeal drives high organic reach.',
   'https://images.unsplash.com/photo-1522444195799-478538b28823?w=400',
   'Home Decor', 'https://www.aliexpress.com/wholesale?SearchText=macrame+wall+hanging', 78, 'Rising', true),

  ('Floating Bookshelf Set',
   'Invisible-mount floating shelves that display books and decor without visible brackets. Easy install and a favorite in home-organization content.',
   'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400',
   'Home Decor', 'https://www.aliexpress.com/wholesale?SearchText=floating+bookshelf', 74, 'Trending', true),

  -- Tech Gadgets (3)
  ('Portable Mini Projector',
   'Compact 1080p-supported mini projector for movie nights, gaming, and presentations, with built-in speaker and phone mirroring. Broad appeal across entertainment and productivity audiences.',
   'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400',
   'Tech Gadgets', 'https://www.aliexpress.com/wholesale?SearchText=mini+projector', 90, 'Hot', true),

  ('Bluetooth Tracker Tile',
   'Coin-sized Bluetooth tracker that attaches to keys, wallets, or bags and pairs with a phone app for real-time location finding. Consistent evergreen demand with strong repeat-purchase rate.',
   'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=400',
   'Tech Gadgets', 'https://www.aliexpress.com/wholesale?SearchText=bluetooth+tracker', 85, 'Trending', true),

  ('Fast Wireless Charging Stand',
   'Angled 15W wireless charging stand that keeps phones visible for notifications while charging, ideal for desks and nightstands. High-margin accessory with universal appeal.',
   'https://images.unsplash.com/photo-1591290619762-d0a5ba6d0d1a?w=400',
   'Tech Gadgets', 'https://www.aliexpress.com/wholesale?SearchText=wireless+charging+stand', 81, 'Rising', true),

  -- Pet Supplies (2)
  ('Orthopedic Memory Foam Dog Bed',
   'Supportive memory-foam bed designed for senior and large-breed dogs, with a washable cover and non-slip base. Premium price point with strong customer loyalty.',
   'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
   'Pet Supplies', 'https://www.aliexpress.com/wholesale?SearchText=orthopedic+dog+bed', 86, 'Hot', true),

  ('No-Pull Dog Harness',
   'Adjustable front-clip harness that reduces pulling on walks while distributing pressure evenly across the chest. High repeat-purchase potential across breeds and sizes.',
   'https://images.unsplash.com/photo-1601758228041-3caa3971e2b6?w=400',
   'Pet Supplies', 'https://www.aliexpress.com/wholesale?SearchText=no+pull+dog+harness', 80, 'Trending', true),

  -- Beauty (2)
  ('Ice Roller Facial Massager',
   'Cooling stainless-steel roller that reduces puffiness and tightens skin in a quick morning routine. Low cost, high perceived value, and strong short-form video demo potential.',
   'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
   'Beauty', 'https://www.aliexpress.com/wholesale?SearchText=ice+roller+facial', 83, 'Trending', true),

  ('Heatless Hair Curler Set',
   'No-heat silk curling ribbon that creates overnight curls without damage, trending heavily across beauty TikTok. Broad appeal and strong influencer-driven demand.',
   'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
   'Beauty', 'https://www.aliexpress.com/wholesale?SearchText=heatless+hair+curler', 89, 'Hot', true),

  -- Kitchen (2)
  ('Electric Coffee Frother Wand',
   'Rechargeable handheld frother that creates café-style foam for lattes and matcha in seconds. Compact, giftable, and a strong repeat-purchase item for coffee enthusiasts.',
   'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400',
   'Kitchen', 'https://www.aliexpress.com/wholesale?SearchText=electric+coffee+frother', 77, 'Rising', true),

  ('Stackable Glass Food Storage Set',
   'Leak-proof glass containers with airtight lids that stack neatly in fridges and pantries. Strong meal-prep and organization audience with consistent demand.',
   'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400',
   'Kitchen', 'https://www.aliexpress.com/wholesale?SearchText=glass+food+storage+set', 72, 'Rising', true),

  -- Fitness (2)
  ('Adjustable Ankle Weights Set',
   'Comfortable, adjustable ankle weights for strength training and rehab exercises, sold in pairs with multiple resistance levels. Compact and appeals to home-fitness shoppers.',
   'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
   'Fitness', 'https://www.aliexpress.com/wholesale?SearchText=adjustable+ankle+weights', 75, 'Rising', true),

  ('Foldable Under-Desk Treadmill',
   'Compact walking treadmill that slides under a desk for low-impact movement during work hours. High AOV and rides the growing work-from-home wellness trend.',
   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
   'Fitness', 'https://www.aliexpress.com/wholesale?SearchText=under+desk+treadmill', 94, 'Hot', true),

  -- Baby (1)
  ('Silicone Baby Feeding Set',
   'BPA-free silicone suction bowl, plate, and utensil set designed for self-feeding toddlers, with a strong spill-resistant grip. High-trust, high-repeat-purchase item for parents.',
   'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400',
   'Baby', 'https://www.aliexpress.com/wholesale?SearchText=silicone+baby+feeding+set', 79, 'Trending', true);
