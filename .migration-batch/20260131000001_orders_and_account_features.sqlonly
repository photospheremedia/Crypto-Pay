-- ============================================
-- Migration: Orders, Recently Viewed, Product Comparison & Account Features
-- Complete e-commerce order management and user activity tracking
-- ============================================

-- ============================================
-- 1. ORDERS TABLE
-- Complete order management system
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  )),
  
  -- Amounts (all in cents)
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Shipping information
  shipping_method TEXT,
  shipping_carrier TEXT,
  tracking_number TEXT,
  estimated_delivery_date DATE,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Addresses (stored as JSONB for flexibility)
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  billing_address JSONB DEFAULT '{}'::jsonb,
  
  -- Payment details
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Promotion applied
  promotion_id UUID REFERENCES public.promotions(id),
  promotion_code TEXT,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'RHS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 10001;

DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ============================================
-- 2. ORDER ITEMS
-- Individual items within an order
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  
  -- Snapshot of product at time of order
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_image TEXT,
  
  -- Pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  
  -- Options/variants if applicable
  options JSONB DEFAULT '{}'::jsonb,
  
  -- Fulfillment status per item
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'returned')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ============================================
-- 3. ORDER STATUS HISTORY
-- Track all status changes for transparency
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id);

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, previous_status)
    VALUES (NEW.id, NEW.status, OLD.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_order_status ON public.orders;
CREATE TRIGGER trigger_log_order_status
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- 4. RECENTLY VIEWED PRODUCTS
-- Track user browsing history
-- ============================================
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  view_count INTEGER NOT NULL DEFAULT 1,
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_last ON public.recently_viewed(user_id, last_viewed_at DESC);

-- Upsert function for recently viewed
CREATE OR REPLACE FUNCTION upsert_recently_viewed(
  p_user_id UUID,
  p_product_id UUID
) RETURNS void AS $$
BEGIN
  INSERT INTO public.recently_viewed (user_id, product_id, view_count, last_viewed_at)
  VALUES (p_user_id, p_product_id, 1, NOW())
  ON CONFLICT (user_id, product_id) 
  DO UPDATE SET 
    view_count = recently_viewed.view_count + 1,
    last_viewed_at = NOW();
    
  -- Keep only last 50 items per user
  DELETE FROM public.recently_viewed
  WHERE id IN (
    SELECT id FROM public.recently_viewed
    WHERE user_id = p_user_id
    ORDER BY last_viewed_at DESC
    OFFSET 50
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. PRODUCT COMPARISON LISTS
-- Save comparison sets
-- ============================================
CREATE TABLE IF NOT EXISTS public.comparison_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Comparison',
  product_ids UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comparison_lists_user ON public.comparison_lists(user_id);

-- ============================================
-- 6. SAVED ADDRESSES
-- User's saved shipping/billing addresses
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  address_type TEXT NOT NULL DEFAULT 'both' CHECK (address_type IN ('shipping', 'billing', 'both')),
  
  -- Address fields
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  
  -- Validation
  is_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON public.user_addresses(user_id, is_default);

-- Ensure only one default address per type per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE public.user_addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id 
      AND id != NEW.id
      AND (address_type = NEW.address_type OR address_type = 'both' OR NEW.address_type = 'both');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_default_address ON public.user_addresses;
CREATE TRIGGER trigger_single_default_address
  BEFORE INSERT OR UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- ============================================
-- 7. PAYMENT METHODS (For saved cards)
-- Store references to payment methods
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment provider reference (e.g., Stripe)
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_payment_method_id TEXT NOT NULL,
  
  -- Display info (not sensitive data)
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Status
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user ON public.user_payment_methods(user_id);

-- ============================================
-- 8. USER NOTIFICATIONS PREFERENCES
-- Control email and push notifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Email notifications
  email_order_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_shipping_updates BOOLEAN NOT NULL DEFAULT TRUE,
  email_promotions BOOLEAN NOT NULL DEFAULT TRUE,
  email_price_drops BOOLEAN NOT NULL DEFAULT TRUE,
  email_back_in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  email_newsletter BOOLEAN NOT NULL DEFAULT TRUE,
  email_account_activity BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Push notifications (for future mobile app)
  push_order_updates BOOLEAN NOT NULL DEFAULT TRUE,
  push_promotions BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- SMS notifications
  sms_order_updates BOOLEAN NOT NULL DEFAULT FALSE,
  sms_shipping_updates BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 9. USER ACTIVITY LOG
-- Track important account activities
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON public.user_activity_log(created_at DESC);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Orders: Users see own orders, admins see all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_rhs_admin());

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.is_rhs_admin());

-- Order Items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_rhs_admin())
    )
  );

CREATE POLICY "Users can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Order Status History
CREATE POLICY "Users can view own order history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = auth.uid() OR public.is_rhs_admin())
    )
  );

-- Recently Viewed
CREATE POLICY "Users manage own recently viewed" ON public.recently_viewed
  FOR ALL USING (auth.uid() = user_id);

-- Comparison Lists
CREATE POLICY "Users manage own comparison lists" ON public.comparison_lists
  FOR ALL USING (auth.uid() = user_id);

-- User Addresses
CREATE POLICY "Users manage own addresses" ON public.user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Payment Methods
CREATE POLICY "Users manage own payment methods" ON public.user_payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Notification Preferences
CREATE POLICY "Users manage own notification preferences" ON public.user_notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Activity Log
CREATE POLICY "Users view own activity" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id OR public.is_rhs_admin());

CREATE POLICY "System can insert activity" ON public.user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS comparison_lists_set_updated_at ON public.comparison_lists;
CREATE TRIGGER comparison_lists_set_updated_at
  BEFORE UPDATE ON public.comparison_lists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS user_addresses_set_updated_at ON public.user_addresses;
CREATE TRIGGER user_addresses_set_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS user_payment_methods_set_updated_at ON public.user_payment_methods;
CREATE TRIGGER user_payment_methods_set_updated_at
  BEFORE UPDATE ON public.user_payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS user_notification_preferences_set_updated_at ON public.user_notification_preferences;
CREATE TRIGGER user_notification_preferences_set_updated_at
  BEFORE UPDATE ON public.user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user's order stats
CREATE OR REPLACE FUNCTION get_user_order_stats(p_user_id UUID)
RETURNS TABLE (
  total_orders BIGINT,
  total_spent_cents BIGINT,
  pending_orders BIGINT,
  delivered_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_orders,
    COALESCE(SUM(total_cents), 0)::BIGINT as total_spent_cents,
    COUNT(*) FILTER (WHERE status IN ('pending', 'confirmed', 'processing', 'shipped'))::BIGINT as pending_orders,
    COUNT(*) FILTER (WHERE status = 'delivered')::BIGINT as delivered_orders
  FROM public.orders
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update product total_sales when order is delivered
CREATE OR REPLACE FUNCTION update_product_sales()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE public.products p
    SET total_sales = total_sales + oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_sales ON public.orders;
CREATE TRIGGER trigger_update_product_sales
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_product_sales();
