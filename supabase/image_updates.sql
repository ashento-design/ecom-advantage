-- Replaces generic/duplicated stock photos with images that actually
-- depict each product. The previous seed data reused the same handful
-- of photo IDs across unrelated products (e.g. the same "gray sneaker"
-- image was used for a posture corrector, resistance bands, AND a
-- treadmill) — every URL below was chosen from a live Unsplash search
-- for that specific product and verified to return HTTP 200 with
-- content-type image/jpeg before being added here.

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1517637382994-f02da38c6728?w=400' WHERE title = 'Posture Corrector Brace';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1543512214-4f76e81f8bfc?w=400' WHERE title = 'LED Desk Lamp with Wireless Charger';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1689844833510-10939e60e8dc?w=400' WHERE title = 'Magnetic Phone Wallet';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1619795811261-8d0af2278b55?w=400' WHERE title = 'Smart Posture Corrector Trainer';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1737144426404-9b99f49cce04?w=400' WHERE title = 'LED Facial Light Therapy Mask';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1627483334784-cc4dd0b96b56?w=400' WHERE title = 'Multi-Function Rolling Herb & Vegetable Cutter';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1552226351-1ac7863af926?w=400' WHERE title = 'Resistance Bands Set with Door Anchor';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1629157319204-04e762649fbc?w=400' WHERE title = 'Reusable Silicone Food Storage Bags Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1772800562154-2a321e304f19?w=400' WHERE title = 'Cat Water Fountain Automatic Dispenser';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1601758123927-4f7acc7da589?w=400' WHERE title = 'Dog Anxiety Calming Bed Donut';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1717160675643-53a7a2ebaa9f?w=400' WHERE title = 'Scalp Massager Shampoo Brush';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1679689384991-35f609124c37?w=400' WHERE title = 'Interactive Treat-Dispensing Dog Puzzle Toy';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1620354600301-e8b325ef1181?w=400' WHERE title = 'Baby Head Shaping Pillow Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1764347923709-fc48487f2486?w=400' WHERE title = 'Wireless Car Phone Mount Charger';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1670867015507-63eaf0773f74?w=400' WHERE title = 'Electric Mini Vegetable Chopper';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1653638390484-bc1c263ce9e4?w=400' WHERE title = 'Orthopedic Memory Foam Dog Bed';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1598962056963-9323f7a1dac2?w=400' WHERE title = 'No-Pull Dog Harness';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1775642548888-7183ff686cb6?w=400' WHERE title = 'Ice Roller Facial Massager';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1516429084384-3aa965e20ff7?w=400' WHERE title = 'Heatless Hair Curler Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1782948603046-da477494723f?w=400' WHERE title = 'Electric Coffee Frother Wand';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1681146375902-e26675413dad?w=400' WHERE title = 'Stackable Glass Food Storage Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511803261138-f7ae974239d1?w=400' WHERE title = 'Adjustable Ankle Weights Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1723468353356-e18254cd8a63?w=400' WHERE title = 'Foldable Under-Desk Treadmill';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1652480199108-80b8dd8bc075?w=400' WHERE title = 'Silicone Baby Feeding Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1708232981795-2baec1d6687b?w=400' WHERE title = 'Sunset Projection Lamp';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1715000103283-01ed4755483e?w=400' WHERE title = 'Macrame Wall Hanging Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1588111948296-83a8e036e004?w=400' WHERE title = 'Floating Bookshelf Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1637656358738-3fcfacb63559?w=400' WHERE title = 'Portable Mini Projector';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1772683709386-c9fc6e24c6db?w=400' WHERE title = 'Bluetooth Tracker Tile';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1545235616-db3cd822ad8c?w=400' WHERE title = 'Fast Wireless Charging Stand';
