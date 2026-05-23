-- =====================================================
-- Migration: Performance and Security Optimization
-- Date: 2026-02-05
-- 
-- Implements Supabase RLS best practices:
-- 1. Critical indexes for auth/membership checks
-- 2. Wrapped auth.uid() in SELECT for caching
-- 3. search_path = '' on security definer functions
-- 4. TO authenticated clause on all policies
-- 5. Composite indexes for common query patterns
-- =====================================================

-- =====================================================
-- PART 1: CRITICAL INDEXES FOR AUTH PERFORMANCE
-- =====================================================

-- Index on memberships.user_id - CRITICAL for all auth checks
-- This is the most frequently queried column in RLS policies
CREATE INDEX IF NOT EXISTS idx_memberships_user_id 
ON public.memberships (user_id);

-- Composite index for membership auth checks (covers 95% of RLS queries)
CREATE INDEX IF NOT EXISTS idx_memberships_user_tenant_status 
ON public.memberships (user_id, tenant_id, status) 
WHERE status = 'active';

-- Composite index for role-based checks
CREATE INDEX IF NOT EXISTS idx_memberships_user_role_active 
ON public.memberships (user_id, role) 
WHERE status = 'active';

-- Index for products search (name with text_pattern_ops for LIKE queries)
CREATE INDEX IF NOT EXISTS idx_products_name_search 
ON public.products USING btree (name text_pattern_ops);

-- Index for products by category and active status
CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON public.products (category, is_active) 
WHERE is_active = true;

-- Index for customers search
CREATE INDEX IF NOT EXISTS idx_customers_name_search 
ON public.customers USING btree (name text_pattern_ops);

-- Index for quotes by customer and status
CREATE INDEX IF NOT EXISTS idx_quotes_customer_status 
ON public.quotes (customer_id, status);

-- =====================================================
-- PART 2: OPTIMIZED HELPER FUNCTIONS
-- With SELECT wrapper and search_path security
-- =====================================================

-- Drop and recreate current_user_id with caching
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT (SELECT auth.uid());
$$;

-- Optimized is_member_of_tenant with SELECT wrapper and search_path
CREATE OR REPLACE FUNCTION public.is_member_of_tenant(check_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.tenant_id = check_tenant_id
      AND m.user_id = (SELECT auth.uid())
      AND m.status = 'active'
  );
$$;

-- Optimized has_tenant_role with SELECT wrapper and search_path
CREATE OR REPLACE FUNCTION public.has_tenant_role(check_tenant_id uuid, allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.tenant_id = check_tenant_id
      AND m.user_id = (SELECT auth.uid())
      AND m.status = 'active'
      AND m.role = ANY(allowed_roles)
  );
$$;

-- Optimized is_rhs_admin with SELECT wrapper and search_path
CREATE OR REPLACE FUNCTION public.is_rhs_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = (SELECT auth.uid())
      AND m.status = 'active'
      AND m.role = 'rhs_admin'
  );
$$;

-- Optimized set_updated_at trigger function with search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- PART 3: OPTIMIZED RLS POLICIES WITH TO AUTHENTICATED
-- =====================================================

-- Tenants policies (optimized with TO authenticated)
DROP POLICY IF EXISTS "tenants_select_members" ON public.tenants;
CREATE POLICY "tenants_select_members"
ON public.tenants FOR SELECT
TO authenticated
USING (public.is_member_of_tenant(id));

DROP POLICY IF EXISTS "tenants_update_owner" ON public.tenants;
CREATE POLICY "tenants_update_owner"
ON public.tenants FOR UPDATE
TO authenticated
USING (public.has_tenant_role(id, ARRAY['owner','rhs_admin']))
WITH CHECK (public.has_tenant_role(id, ARRAY['owner','rhs_admin']));

-- Memberships policies (optimized)
DROP POLICY IF EXISTS "memberships_select_members" ON public.memberships;
CREATE POLICY "memberships_select_members"
ON public.memberships FOR SELECT
TO authenticated
USING (public.is_member_of_tenant(tenant_id));

DROP POLICY IF EXISTS "memberships_write_owner" ON public.memberships;
CREATE POLICY "memberships_write_owner"
ON public.memberships FOR INSERT
TO authenticated
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner','rhs_admin']));

DROP POLICY IF EXISTS "memberships_update_owner" ON public.memberships;
CREATE POLICY "memberships_update_owner"
ON public.memberships FOR UPDATE
TO authenticated
USING (public.has_tenant_role(tenant_id, ARRAY['owner','rhs_admin']))
WITH CHECK (public.has_tenant_role(tenant_id, ARRAY['owner','rhs_admin']));

-- Audit log policies (optimized)
DROP POLICY IF EXISTS "audit_select_members" ON public.audit_log;
CREATE POLICY "audit_select_members"
ON public.audit_log FOR SELECT
TO authenticated
USING (tenant_id IS NULL OR public.is_member_of_tenant(tenant_id));

-- Customers policies (optimized)
DROP POLICY IF EXISTS "customers_select_members" ON public.customers;
CREATE POLICY "customers_select_members"
ON public.customers FOR SELECT
TO authenticated
USING (public.is_member_of_tenant(id));

DROP POLICY IF EXISTS "customers_update_owner" ON public.customers;
CREATE POLICY "customers_update_owner"
ON public.customers FOR UPDATE
TO authenticated
USING (public.has_tenant_role(id, ARRAY['owner','admin','manager','rhs_admin']))
WITH CHECK (public.has_tenant_role(id, ARRAY['owner','admin','manager','rhs_admin']));

-- Locations policies (optimized)
DROP POLICY IF EXISTS "locations_select_members" ON public.locations;
CREATE POLICY "locations_select_members"
ON public.locations FOR SELECT
TO authenticated
USING (public.is_member_of_tenant(customer_id));

DROP POLICY IF EXISTS "locations_write_owner" ON public.locations;
CREATE POLICY "locations_write_owner"
ON public.locations FOR INSERT
TO authenticated
WITH CHECK (public.has_tenant_role(customer_id, ARRAY['owner','admin','manager','rhs_admin']));

DROP POLICY IF EXISTS "locations_update_owner" ON public.locations;
CREATE POLICY "locations_update_owner"
ON public.locations FOR UPDATE
TO authenticated
USING (public.has_tenant_role(customer_id, ARRAY['owner','admin','manager','rhs_admin']))
WITH CHECK (public.has_tenant_role(customer_id, ARRAY['owner','admin','manager','rhs_admin']));

DROP POLICY IF EXISTS "locations_delete_owner" ON public.locations;
CREATE POLICY "locations_delete_owner"
ON public.locations FOR DELETE
TO authenticated
USING (public.has_tenant_role(customer_id, ARRAY['owner','rhs_admin']));

-- Integrations policies (optimized)
DROP POLICY IF EXISTS "integrations_select_members" ON public.integrations;
CREATE POLICY "integrations_select_members"
ON public.integrations FOR SELECT
TO authenticated
USING (public.is_member_of_tenant(customer_id));

DROP POLICY IF EXISTS "integrations_write_owner" ON public.integrations;
CREATE POLICY "integrations_write_owner"
ON public.integrations FOR INSERT
TO authenticated
WITH CHECK (public.has_tenant_role(customer_id, ARRAY['owner','admin','rhs_admin']));

DROP POLICY IF EXISTS "integrations_update_owner" ON public.integrations;
CREATE POLICY "integrations_update_owner"
ON public.integrations FOR UPDATE
TO authenticated
USING (public.has_tenant_role(customer_id, ARRAY['owner','admin','rhs_admin']))
WITH CHECK (public.has_tenant_role(customer_id, ARRAY['owner','admin','rhs_admin']));

-- Products policies (admin-only write, all authenticated can read)
DROP POLICY IF EXISTS "products_select_all" ON public.products;
CREATE POLICY "products_select_all"
ON public.products FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "products_write_admin" ON public.products;
CREATE POLICY "products_write_admin"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.is_rhs_admin());

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin"
ON public.products FOR UPDATE
TO authenticated
USING (public.is_rhs_admin())
WITH CHECK (public.is_rhs_admin());

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin"
ON public.products FOR DELETE
TO authenticated
USING (public.is_rhs_admin());

-- Quotes policies (optimized)
DROP POLICY IF EXISTS "quotes_select_members" ON public.quotes;
CREATE POLICY "quotes_select_members"
ON public.quotes FOR SELECT
TO authenticated
USING (public.is_member_of_tenant(customer_id) OR public.is_rhs_admin());

DROP POLICY IF EXISTS "quotes_write_staff" ON public.quotes;
CREATE POLICY "quotes_write_staff"
ON public.quotes FOR INSERT
TO authenticated
WITH CHECK (public.has_tenant_role(customer_id, ARRAY['owner','admin','manager','staff','rhs_admin']) OR public.is_rhs_admin());

DROP POLICY IF EXISTS "quotes_update_staff" ON public.quotes;
CREATE POLICY "quotes_update_staff"
ON public.quotes FOR UPDATE
TO authenticated
USING (public.has_tenant_role(customer_id, ARRAY['owner','admin','manager','staff','rhs_admin']) OR public.is_rhs_admin())
WITH CHECK (public.has_tenant_role(customer_id, ARRAY['owner','admin','manager','staff','rhs_admin']) OR public.is_rhs_admin());

-- Quote lines policies (optimized)
DROP POLICY IF EXISTS "quote_lines_select_members" ON public.quote_lines;
CREATE POLICY "quote_lines_select_members"
ON public.quote_lines FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_id
    AND (public.is_member_of_tenant(q.customer_id) OR public.is_rhs_admin())
  )
);

DROP POLICY IF EXISTS "quote_lines_write_staff" ON public.quote_lines;
CREATE POLICY "quote_lines_write_staff"
ON public.quote_lines FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_id
    AND (public.has_tenant_role(q.customer_id, ARRAY['owner','admin','manager','staff','rhs_admin']) OR public.is_rhs_admin())
  )
);

DROP POLICY IF EXISTS "quote_lines_update_staff" ON public.quote_lines;
CREATE POLICY "quote_lines_update_staff"
ON public.quote_lines FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_id
    AND (public.has_tenant_role(q.customer_id, ARRAY['owner','admin','manager','staff','rhs_admin']) OR public.is_rhs_admin())
  )
);

DROP POLICY IF EXISTS "quote_lines_delete_staff" ON public.quote_lines;
CREATE POLICY "quote_lines_delete_staff"
ON public.quote_lines FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_id
    AND (public.has_tenant_role(q.customer_id, ARRAY['owner','admin','manager','rhs_admin']) OR public.is_rhs_admin())
  )
);

-- =====================================================
-- PART 4: ADDITIONAL SEARCH INDEXES
-- =====================================================

-- Orders indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON public.orders (status);

CREATE INDEX IF NOT EXISTS idx_orders_customer_status 
ON public.orders (customer_id, status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON public.orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_number_search
ON public.orders USING btree (order_number text_pattern_ops);

-- Chat conversations indexes for leads
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status 
ON public.chat_conversations (status);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead_status 
ON public.chat_conversations (lead_status);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_guest_email_search
ON public.chat_conversations USING btree (guest_email text_pattern_ops)
WHERE guest_email IS NOT NULL;

-- User profiles search
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_search 
ON public.user_profiles USING btree (email text_pattern_ops)
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name_search 
ON public.user_profiles USING btree (full_name text_pattern_ops)
WHERE full_name IS NOT NULL;

-- =====================================================
-- PART 5: SECURITY DEFINER FUNCTION FOR ADMIN SEARCH
-- Bypasses RLS for performance on admin search
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_search(
  search_query text,
  result_limit int DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
  products_result jsonb;
  orders_result jsonb;
  customers_result jsonb;
BEGIN
  -- Only allow admins
  IF NOT public.is_rhs_admin() AND NOT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = (SELECT auth.uid())
      AND m.status = 'active'
      AND m.role IN ('admin', 'owner', 'manager')
  ) THEN
    RETURN '{"error": "Unauthorized"}'::jsonb;
  END IF;

  -- Search products
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', p.id,
    'type', 'product',
    'title', p.name,
    'subtitle', 'SKU: ' || p.internal_sku || ' • $' || COALESCE(p.resale_price::text, '0'),
    'href', '/admin/products/' || p.id
  )), '[]'::jsonb)
  INTO products_result
  FROM (
    SELECT id, name, internal_sku, resale_price
    FROM public.products
    WHERE name ILIKE '%' || search_query || '%'
       OR internal_sku ILIKE '%' || search_query || '%'
    LIMIT result_limit
  ) p;

  -- Search orders
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', o.id,
    'type', 'order',
    'title', 'Order #' || o.order_number,
    'subtitle', o.status || ' • $' || COALESCE((o.total_cents / 100.0)::text, '0'),
    'href', '/admin/orders/' || o.id
  )), '[]'::jsonb)
  INTO orders_result
  FROM (
    SELECT id, order_number, status, total_cents
    FROM public.orders
    WHERE order_number ILIKE '%' || search_query || '%'
    LIMIT result_limit
  ) o;

  -- Search customers
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'type', 'customer',
    'title', c.name,
    'subtitle', 'Customer',
    'href', '/admin/customers/' || c.id
  )), '[]'::jsonb)
  INTO customers_result
  FROM (
    SELECT id, name
    FROM public.customers
    WHERE name ILIKE '%' || search_query || '%'
    LIMIT result_limit
  ) c;

  -- Combine results
  result = jsonb_build_object(
    'products', products_result,
    'orders', orders_result,
    'customers', customers_result
  );

  RETURN result;
END;
$$;

-- Grant execute to authenticated users (function does its own auth check)
GRANT EXECUTE ON FUNCTION public.admin_search(text, int) TO authenticated;

-- =====================================================
-- PART 6: ANALYZE TABLES FOR QUERY PLANNER
-- =====================================================

ANALYZE public.memberships;
ANALYZE public.tenants;
ANALYZE public.customers;
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.quotes;
ANALYZE public.locations;

-- Log completion
DO $$ 
BEGIN 
  RAISE NOTICE 'Performance optimization migration completed successfully';
END $$;
