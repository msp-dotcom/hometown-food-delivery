-- Run this AFTER Vercel has deployed once (so the tables already exist).
-- Paste this whole file into Supabase's SQL Editor and click Run.
-- This loads the same demo data used throughout our prototypes.

INSERT INTO "Hotel" ("id", "name", "phone", "address", "latitude", "longitude", "isOpen", "createdAt")
VALUES
  ('hotel_abc', 'ABC Hotel', '+919845000001', 'Main Junction, Hometown', 12.9716, 77.5946, true, now()),
  ('hotel_royal', 'Royal Biryani', '+919900000002', 'Near Bus Stand, Hometown', 12.9800, 77.6000, true, now());

INSERT INTO "MenuItem" ("id", "hotelId", "name", "price", "category", "imageEmoji", "available", "createdAt")
VALUES
  ('item_1', 'hotel_abc', 'Chicken Biryani', 180, 'Non-Veg', '🍛', true, now()),
  ('item_2', 'hotel_abc', 'Kabab Platter', 150, 'Non-Veg', '🍢', true, now()),
  ('item_3', 'hotel_abc', 'Paneer Masala', 130, 'Veg', '🥘', true, now()),
  ('item_4', 'hotel_abc', 'Sweet Lassi', 60, 'Drinks', '🥛', true, now()),
  ('item_5', 'hotel_royal', 'Veg Fried Rice', 120, 'Veg', '🍚', true, now()),
  ('item_6', 'hotel_royal', 'Cold Milk 500ml', 40, 'Drinks', '🥤', true, now()),
  ('item_7', 'hotel_royal', 'Chicken Fry', 140, 'Non-Veg', '🍗', true, now());

INSERT INTO "Rider" ("id", "name", "phone", "available")
VALUES
  ('rider_suresh', 'Suresh', '+919845012345', true),
  ('rider_manoj', 'Manoj', '+919900011122', false);
