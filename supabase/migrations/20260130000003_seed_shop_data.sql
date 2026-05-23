-- ============================================
-- Seed Data: Product Categories & Sample Promotions
-- Run after the migration is applied
-- ============================================

-- ============================================
-- INSERT PRODUCT CATEGORIES
-- ============================================
INSERT INTO public.product_categories (name, slug, description, icon, display_order, level, is_active) VALUES
  ('Packaging & Takeout', 'packaging-takeout', 'Containers, bags, and boxes for takeout orders', 'Box', 1, 0, TRUE),
  ('Cutlery & Utensils', 'cutlery-utensils', 'Forks, knives, spoons and serving utensils', 'UtensilsCrossed', 2, 0, TRUE),
  ('Beverages & Cups', 'beverages-cups', 'Hot cups, cold cups, lids and dispensers', 'Coffee', 3, 0, TRUE),
  ('Labels & Packaging', 'labels-packaging', 'Food labels, stickers and tamper-evident seals', 'Tag', 4, 0, TRUE),
  ('Kitchen Equipment', 'kitchen-equipment', 'Commercial kitchen equipment and tools', 'ChefHat', 5, 0, TRUE),
  ('Cleaning & Safety', 'cleaning-safety', 'Sanitizers, cleaning supplies and safety gear', 'Shield', 6, 0, TRUE),
  ('Paper Products', 'paper-products', 'Napkins, paper towels and table covers', 'ShoppingBag', 7, 0, TRUE),
  ('Furniture & Fixtures', 'furniture-fixtures', 'Tables, chairs, booths and outdoor furniture', 'Armchair', 8, 0, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for Packaging & Takeout
INSERT INTO public.product_categories (name, slug, description, parent_id, display_order, level, is_active)
SELECT 
  subcat.name, 
  subcat.slug, 
  subcat.description,
  (SELECT id FROM public.product_categories WHERE slug = 'packaging-takeout'),
  subcat.display_order,
  1,
  TRUE
FROM (VALUES
  ('Takeout Containers', 'takeout-containers', 'Food containers for takeout', 1),
  ('Paper Bags', 'paper-bags', 'Eco-friendly paper bags', 2),
  ('Plastic Bags', 'plastic-bags', 'Durable plastic bags', 3),
  ('Food Boxes', 'food-boxes', 'Various food boxes', 4),
  ('Pizza Boxes', 'pizza-boxes', 'Pizza packaging', 5),
  ('Deli Containers', 'deli-containers', 'Deli and salad containers', 6),
  ('Cup Carriers', 'cup-carriers', 'Drink carriers', 7)
) AS subcat(name, slug, description, display_order)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for Cutlery & Utensils
INSERT INTO public.product_categories (name, slug, description, parent_id, display_order, level, is_active)
SELECT 
  subcat.name, 
  subcat.slug, 
  subcat.description,
  (SELECT id FROM public.product_categories WHERE slug = 'cutlery-utensils'),
  subcat.display_order,
  1,
  TRUE
FROM (VALUES
  ('Plastic Cutlery', 'plastic-cutlery', 'Disposable plastic utensils', 1),
  ('Wooden Utensils', 'wooden-utensils', 'Eco-friendly wooden utensils', 2),
  ('Compostable Cutlery', 'compostable-cutlery', 'Biodegradable utensils', 3),
  ('Chopsticks', 'chopsticks', 'Disposable chopsticks', 4),
  ('Serving Utensils', 'serving-utensils', 'Large serving spoons and tongs', 5),
  ('Stirrers & Straws', 'stirrers-straws', 'Drink stirrers and straws', 6)
) AS subcat(name, slug, description, display_order)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for Beverages & Cups
INSERT INTO public.product_categories (name, slug, description, parent_id, display_order, level, is_active)
SELECT 
  subcat.name, 
  subcat.slug, 
  subcat.description,
  (SELECT id FROM public.product_categories WHERE slug = 'beverages-cups'),
  subcat.display_order,
  1,
  TRUE
FROM (VALUES
  ('Hot Cups', 'hot-cups', 'Cups for hot beverages', 1),
  ('Cold Cups', 'cold-cups', 'Cups for cold beverages', 2),
  ('Cup Lids', 'cup-lids', 'Lids for various cup sizes', 3),
  ('Cup Sleeves', 'cup-sleeves', 'Insulating cup sleeves', 4)
) AS subcat(name, slug, description, display_order)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- UPDATE EXISTING PRODUCTS WITH SHOP FIELDS
-- This updates any existing products with the new e-commerce fields
-- ============================================
UPDATE public.products
SET 
  slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', '')),
  status = CASE WHEN is_active THEN 'active' ELSE 'archived' END,
  price_cents = COALESCE((resale_price * 100)::INTEGER, 0)
WHERE slug IS NULL;

-- ============================================
-- INSERT SAMPLE PROMOTIONS
-- ============================================
INSERT INTO public.promotions (code, name, description, discount_type, discount_value, minimum_order_cents, is_active, starts_at, expires_at) VALUES
  ('WELCOME10', 'New Customer Discount', '10% off your first order', 'percentage', 10.00, 5000, TRUE, NOW(), NOW() + INTERVAL '1 year'),
  ('FREESHIP50', 'Free Shipping', 'Free shipping on orders over $50', 'free_shipping', 0, 5000, TRUE, NOW(), NOW() + INTERVAL '6 months'),
  ('BULK15', 'Bulk Order Discount', '15% off orders over $500', 'percentage', 15.00, 50000, TRUE, NOW(), NOW() + INTERVAL '3 months'),
  ('ECO20', 'Eco-Friendly Savings', '20% off eco-friendly products', 'percentage', 20.00, 0, TRUE, NOW(), NOW() + INTERVAL '2 months')
ON CONFLICT (code) DO NOTHING;
