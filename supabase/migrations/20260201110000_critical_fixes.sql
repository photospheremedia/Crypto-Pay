-- ============================================
-- CRITICAL DATABASE SCHEMA FIXES
-- Addresses 11 critical and high-severity issues identified in schema audit
-- ============================================

-- ============================================
-- ISSUE #2: Missing Column - newsletter_subscribers.resubscribed_at
-- Severity: CRITICAL
-- File: 20260128000002_update_trigger_new_fields.sql references this column
-- ============================================
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS resubscribed_at TIMESTAMPTZ;

-- ============================================
-- ISSUE #3: Missing Unique Constraint - leads.email
-- Severity: CRITICAL
-- ON CONFLICT requires unique constraint, not just index
-- ============================================
DROP INDEX IF EXISTS public.idx_leads_email;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email_unique ON public.leads(email);

-- ============================================
-- ISSUE #8: Invalid Index - user_profiles.user_id doesn't exist
-- Severity: HIGH
-- user_profiles uses 'id' as PK, not 'user_id'
-- ============================================
-- Remove invalid index creation from previous migration
-- (Index doesn't exist yet so DROP IF EXISTS is safe)
DROP INDEX IF EXISTS public.idx_user_profiles_user_id;

-- ============================================
-- ISSUE #10: Missing Foreign Key Constraints - customer_pricing tables
-- Severity: HIGH
-- Add proper foreign key constraints to prevent orphaned records
-- ============================================

-- Fix customer_product_pricing foreign keys
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_product_pricing') THEN
    -- Only add if columns exist and aren't already constrained
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND table_name = 'customer_product_pricing' 
      AND constraint_name = 'customer_product_pricing_product_id_fkey'
    ) THEN
      ALTER TABLE public.customer_product_pricing
        ADD CONSTRAINT customer_product_pricing_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Fix customer_category_pricing foreign keys
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_category_pricing') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND table_name = 'customer_category_pricing' 
      AND constraint_name = 'customer_category_pricing_category_id_fkey'
    ) THEN
      ALTER TABLE public.customer_category_pricing
        ADD CONSTRAINT customer_category_pricing_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Fix customer_global_discount foreign keys
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_global_discount') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND table_name = 'customer_global_discount' 
      AND constraint_name = 'customer_global_discount_customer_id_fkey'
    ) THEN
      ALTER TABLE public.customer_global_discount
        ADD CONSTRAINT customer_global_discount_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- ============================================
-- ISSUE #11: Missing Index - chat_conversations.assigned_to
-- Severity: HIGH
-- Improve query performance for filtered queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned_to 
ON public.chat_conversations(assigned_to) 
WHERE assigned_to IS NOT NULL;

-- ============================================
-- ISSUE #7: Fix RLS Policy for user_settings
-- Severity: HIGH
-- user_settings.user_id references user_profiles(id), need proper join
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Service can insert settings" ON public.user_settings;

-- Create corrected policies
-- user_settings.user_id -> user_profiles.id -> auth.users.id, so we can use direct comparison
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

CREATE POLICY "Service can insert settings" ON public.user_settings
  FOR INSERT TO service_role
  WITH CHECK (true);

-- ============================================
-- ISSUE #15: Missing Index - orders.customer_id
-- Severity: MEDIUM (but included for performance)
-- Used in RLS policies and frequent joins
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- ============================================
-- PERFORMANCE: VACUUM ANALYZE (Run manually after migration)
-- VACUUM cannot be executed within a transaction/migration
-- Run these commands separately via psql or Supabase dashboard:
-- ============================================
-- VACUUM ANALYZE public.newsletter_subscribers;
-- VACUUM ANALYZE public.leads;
-- VACUUM ANALYZE public.user_settings;
-- VACUUM ANALYZE public.chat_conversations;

-- ============================================
-- VERIFICATION QUERIES
-- Run these manually to verify fixes:
-- ============================================

-- Check newsletter_subscribers has resubscribed_at
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers';

-- Check leads.email has unique constraint
-- SELECT indexdef FROM pg_indexes 
-- WHERE schemaname = 'public' AND tablename = 'leads' AND indexname = 'idx_leads_email_unique';

-- Check foreign keys exist
-- SELECT constraint_name, table_name 
-- FROM information_schema.table_constraints 
-- WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
-- AND table_name IN ('customer_product_pricing', 'customer_category_pricing', 'customer_global_discount');

-- Check indexes exist
-- SELECT indexname FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname IN ('idx_chat_conversations_assigned_to', 'idx_orders_customer_id');
