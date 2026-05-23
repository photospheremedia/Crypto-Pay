-- ============================================
-- COMPREHENSIVE RLS SECURITY AUDIT FIXES
-- Based on official Supabase best practices
-- https://supabase.com/docs/guides/database/postgres/row-level-security
-- ============================================

-- ISSUES FOUND:
-- 1. auth.uid() not wrapped with (SELECT ...) - causes poor performance
-- 2. Missing auth.uid() IS NOT NULL checks - can cause silent failures
-- 3. Missing TO role specifications - policies run unnecessarily
-- 4. Missing indexes on columns used in RLS policies - full table scans

-- BEST PRACTICES APPLIED:
-- ✓ Wrap auth.uid() with (SELECT auth.uid()) for query plan caching (99%+ faster)
-- ✓ Always check (SELECT auth.uid()) IS NOT NULL to prevent silent failures
-- ✓ Specify TO authenticated or TO anon to limit policy execution
-- ✓ Create indexes on all columns used in policy WHERE/USING clauses
-- ✓ Use security definer functions when RLS needs to be bypassed safely

-- NOTE: This migration only updates tables that exist in production
-- Tables referenced: user_profiles, orders, order_items, user_addresses, 
-- user_payment_methods, quotes, carts, cart_items, product_reviews, 
-- chat_conversations, chat_messages

-- ============================================
-- Fix user_profiles policies
-- Note: user_profiles uses 'id' as primary key, not 'user_id'
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Service can insert profiles" ON public.user_profiles;
CREATE POLICY "Service can insert profiles" ON public.user_profiles
  FOR INSERT TO service_role
  WITH CHECK (true);

-- user_profiles.id is already indexed as primary key

-- ============================================
-- Fix orders policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

-- orders.user_id index already exists: idx_orders_user

-- ============================================
-- Fix order_items policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = (SELECT auth.uid())
    )
  );

-- order_items.order_id index already exists: idx_order_items_order

-- ============================================
-- Fix user_addresses policies (not 'addresses')
-- ============================================
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.user_addresses;
CREATE POLICY "Users can manage own addresses" ON public.user_addresses
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

-- user_addresses.user_id index already exists: idx_user_addresses_user

-- ============================================
-- Fix user_payment_methods policies (not 'payment_methods')
-- ============================================
DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.user_payment_methods;
CREATE POLICY "Users can manage own payment methods" ON public.user_payment_methods
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

-- user_payment_methods.user_id index already exists: idx_user_payment_methods_user

-- ============================================
-- Fix quotes policies
-- NOTE: Quotes table uses customer_id (tenant), not direct user_id
-- Skipping quotes policy updates as they require tenant relationship
-- ============================================

-- quotes.customer_id index likely already exists

-- ============================================
-- Fix carts policies
-- ============================================
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" ON public.carts
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

-- Add index on user_id for RLS performance
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);

-- ============================================
-- Fix cart_items policies
-- ============================================
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
CREATE POLICY "Users can manage own cart items" ON public.cart_items
  FOR ALL TO authenticated
  USING (
    (SELECT auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id
        AND carts.user_id = (SELECT auth.uid())
    )
  );

-- Add index on cart_id for RLS join performance
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);

-- ============================================
-- Fix product_reviews policies
-- NOTE: product_reviews uses is_approved boolean, not status
-- ============================================
DROP POLICY IF EXISTS "Users can manage own reviews" ON public.product_reviews;
CREATE POLICY "Users can manage own reviews" ON public.product_reviews
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.product_reviews;
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews
  FOR SELECT
  USING (is_approved = true);

-- Add index on is_approved for RLS performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON public.product_reviews(is_approved);
-- user_id index already exists: idx_product_reviews_user

-- ============================================
-- Fix chat_conversations policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

-- Add index on user_id for RLS performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);

-- ============================================
-- Fix chat_messages policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
        AND chat_conversations.user_id = (SELECT auth.uid())
    )
  );

-- Add index on conversation_id for RLS join performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
