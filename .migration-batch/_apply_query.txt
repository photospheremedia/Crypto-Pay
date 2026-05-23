-- ============================================
-- Migration: Shop Extensions & Urban Piper Integration
-- Extends existing schema for e-commerce and tech services
-- ============================================

-- ============================================
-- 1. EXTEND PRODUCTS TABLE
-- Add e-commerce fields to existing products table
-- ============================================

-- Add new columns to existing products table
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS barcode TEXT,
  ADD COLUMN IF NOT EXISTS price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS compare_at_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS allow_backorder BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS weight_oz DECIMAL(8, 2),
  ADD COLUMN IF NOT EXISTS dimensions JSONB,
  ADD COLUMN IF NOT EXISTS ships_free BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shipping_class TEXT,
  ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_eco_friendly BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create unique index on slug (only if slug is not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique 
  ON public.products(slug) WHERE slug IS NOT NULL;

-- ============================================
-- 2. PRODUCT CATEGORIES
-- Hierarchical category structure
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  level INTEGER DEFAULT 0,
  icon TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON public.product_categories(parent_id);

-- ============================================
-- 3. PRODUCT REVIEWS
-- Customer reviews and ratings
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  admin_response TEXT,
  admin_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);

-- ============================================
-- 4. SHOPPING CARTS
-- Shopping cart for users and guests
-- ============================================
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  subtotal_cents INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON public.carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_status ON public.carts(status);

-- ============================================
-- 5. CART ITEMS
-- Items in shopping carts
-- ============================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL,
  options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);

-- ============================================
-- 6. WISHLISTS
-- User saved/favorited products
-- ============================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  notify_on_sale BOOLEAN DEFAULT FALSE,
  notify_on_stock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON public.wishlists(product_id);

-- ============================================
-- 7. URBAN PIPER SUBSCRIPTIONS
-- Technology service subscriptions (Hub/Meraki)
-- ============================================
CREATE TABLE IF NOT EXISTS public.urban_piper_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  hub_enabled BOOLEAN DEFAULT FALSE,
  hub_plan TEXT CHECK (hub_plan IN ('basic', 'pro', 'enterprise')),
  meraki_enabled BOOLEAN DEFAULT FALSE,
  meraki_domain TEXT,
  up_account_id TEXT,
  up_api_key_encrypted TEXT,
  monthly_fee_cents INTEGER NOT NULL DEFAULT 0,
  setup_fee_cents INTEGER DEFAULT 0,
  setup_fee_paid BOOLEAN DEFAULT FALSE,
  billing_start_date DATE,
  next_billing_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'provisioning', 'active', 'suspended', 'cancelled')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_up_subscriptions_customer ON public.urban_piper_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_up_subscriptions_status ON public.urban_piper_subscriptions(status);

-- ============================================
-- 8. URBAN PIPER DELIVERY INTEGRATIONS
-- Connected delivery platforms per subscription
-- ============================================
CREATE TABLE IF NOT EXISTS public.up_delivery_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.urban_piper_subscriptions(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN (
    'ubereats', 'doordash', 'grubhub', 'postmates', 
    'seamless', 'caviar', 'talabat', 'deliveroo', 'direct'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'connecting', 'active', 'error', 'disconnected')),
  store_id TEXT,
  store_name TEXT,
  menu_id TEXT,
  menu_sync_enabled BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  total_orders INTEGER DEFAULT 0,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_up_delivery_sub ON public.up_delivery_integrations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_up_delivery_platform ON public.up_delivery_integrations(platform);

-- ============================================
-- 9. URBAN PIPER ONBOARDING TICKETS
-- Onboarding progress tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.up_onboarding_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.urban_piper_subscriptions(id),
  form_data JSONB NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'demo_scheduled', 'demo_completed',
    'contract_sent', 'signed', 'provisioning', 'active', 'closed'
  )),
  assigned_to UUID REFERENCES auth.users(id),
  up_ticket_id TEXT,
  up_status TEXT,
  demo_scheduled_at TIMESTAMPTZ,
  demo_completed_at TIMESTAMPTZ,
  contract_sent_at TIMESTAMPTZ,
  contract_signed_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. PROMOTIONS / COUPONS
-- Discount codes and promotional offers
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value DECIMAL(10, 2) NOT NULL,
  minimum_order_cents INTEGER DEFAULT 0,
  maximum_discount_cents INTEGER,
  usage_limit INTEGER,
  usage_limit_per_user INTEGER DEFAULT 1,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_products', 'specific_categories')),
  product_ids UUID[],
  category_ids UUID[],
  is_active BOOLEAN DEFAULT TRUE,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON public.promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active);

-- ============================================
-- 11. PROMOTION USAGE TRACKING
-- Track who used which promotions
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotion_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  quote_id UUID REFERENCES public.quotes(id),
  discount_applied_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADDITIONAL PRODUCT INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory) WHERE subcategory IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand) WHERE brand IS NOT NULL;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urban_piper_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.up_delivery_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.up_onboarding_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_usage ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Product Categories: Public read
CREATE POLICY "Anyone can view active categories" ON public.product_categories
  FOR SELECT USING (is_active = TRUE);

-- Product Reviews: Public read approved, users manage own
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews
  FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Users can create reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Carts: Users manage own carts
CREATE POLICY "Users can view own carts" ON public.carts
  FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can manage own carts" ON public.carts
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Cart Items: Users manage items in their carts
CREATE POLICY "Users can manage cart items" ON public.cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
      AND (carts.user_id = auth.uid() OR carts.user_id IS NULL)
    )
  );

-- Wishlists: Users manage own wishlists
CREATE POLICY "Users can manage wishlists" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Urban Piper Subscriptions: Customer members can view
CREATE POLICY "Customer members can view tech subscriptions" ON public.urban_piper_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE tenant_id = urban_piper_subscriptions.customer_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Admins can manage subscriptions
CREATE POLICY "Admins can manage tech subscriptions" ON public.urban_piper_subscriptions
  FOR ALL USING (public.is_rhs_admin());

-- Delivery Integrations: Same as subscriptions
CREATE POLICY "Customer members can view delivery integrations" ON public.up_delivery_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.urban_piper_subscriptions ups
      JOIN public.memberships m ON m.tenant_id = ups.customer_id
      WHERE ups.id = up_delivery_integrations.subscription_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
    )
  );

CREATE POLICY "Admins can manage delivery integrations" ON public.up_delivery_integrations
  FOR ALL USING (public.is_rhs_admin());

-- Onboarding Tickets: Admins only
CREATE POLICY "Admins can manage onboarding tickets" ON public.up_onboarding_tickets
  FOR ALL USING (public.is_rhs_admin());

-- Promotions: Public read active
CREATE POLICY "Anyone can view active promotions" ON public.promotions
  FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Admins can manage promotions" ON public.promotions
  FOR ALL USING (public.is_rhs_admin());

-- Promotion Usage: Users can see own usage
CREATE POLICY "Users can view own promotion usage" ON public.promotion_usage
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
DROP TRIGGER IF EXISTS product_categories_set_updated_at ON public.product_categories;
CREATE TRIGGER product_categories_set_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS product_reviews_set_updated_at ON public.product_reviews;
CREATE TRIGGER product_reviews_set_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS carts_set_updated_at ON public.carts;
CREATE TRIGGER carts_set_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS cart_items_set_updated_at ON public.cart_items;
CREATE TRIGGER cart_items_set_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS up_subscriptions_set_updated_at ON public.urban_piper_subscriptions;
CREATE TRIGGER up_subscriptions_set_updated_at
  BEFORE UPDATE ON public.urban_piper_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS up_delivery_set_updated_at ON public.up_delivery_integrations;
CREATE TRIGGER up_delivery_set_updated_at
  BEFORE UPDATE ON public.up_delivery_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS up_onboarding_set_updated_at ON public.up_onboarding_tickets;
CREATE TRIGGER up_onboarding_set_updated_at
  BEFORE UPDATE ON public.up_onboarding_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS promotions_set_updated_at ON public.promotions;
CREATE TRIGGER promotions_set_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Update product review stats when reviews change
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.products
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.product_reviews 
        WHERE product_id = NEW.product_id AND is_approved = TRUE
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM public.product_reviews 
        WHERE product_id = NEW.product_id AND is_approved = TRUE
      ),
      updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.product_reviews 
        WHERE product_id = OLD.product_id AND is_approved = TRUE
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM public.product_reviews 
        WHERE product_id = OLD.product_id AND is_approved = TRUE
      ),
      updated_at = NOW()
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_review_stats ON public.product_reviews;
CREATE TRIGGER trigger_update_product_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_review_stats();

-- Update cart totals when items change
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
DECLARE
  target_cart_id UUID;
BEGIN
  target_cart_id := COALESCE(NEW.cart_id, OLD.cart_id);
  
  UPDATE public.carts
  SET 
    subtotal_cents = (
      SELECT COALESCE(SUM(price_cents * quantity), 0)
      FROM public.cart_items
      WHERE cart_id = target_cart_id
    ),
    item_count = (
      SELECT COALESCE(SUM(quantity), 0)
      FROM public.cart_items
      WHERE cart_id = target_cart_id
    ),
    updated_at = NOW()
  WHERE id = target_cart_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cart_totals ON public.cart_items;
CREATE TRIGGER trigger_update_cart_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_cart_totals();
