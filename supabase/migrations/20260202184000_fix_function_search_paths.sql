-- Migration: Fix function search_path security warnings
-- Issue: 29 functions have mutable search_path (SECURITY risk)
-- Solution: Use ALTER FUNCTION ... SET search_path = '' to prevent search path injection
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
--
-- Using DO block with conditional checks to handle varying function signatures

DO $$
DECLARE
  v_function RECORD;
  v_sql TEXT;
BEGIN
  -- Get all functions that need fixing
  FOR v_function IN 
    SELECT 
      p.proname AS name,
      pg_get_function_identity_arguments(p.oid) AS args,
      n.nspname AS schema
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        -- Core utility functions
        'current_user_id',
        'set_updated_at',
        'update_updated_at_column',
        -- Session & security functions
        'is_session_valid',
        'cleanup_expired_sessions',
        'revoke_user_sessions',
        'log_security_event',
        'log_audit_event',
        'update_staff_activity',
        -- User & auth functions
        'handle_new_user',
        'is_hanouta_admin',
        'process_admin_invite',
        -- Tenant & membership functions
        'is_tenant_member_cached',
        'has_tenant_role_any',
        -- Product & pricing functions
        'get_customer_price',
        'update_product_review_stats',
        'update_product_sales',
        'upsert_recently_viewed',
        -- Order & cart functions
        'generate_order_number',
        'log_order_status_change',
        'update_cart_totals',
        -- Customer & analytics functions
        'get_user_order_stats',
        'update_customer_order_stats',
        'convert_guest_to_customer',
        'ensure_single_default_address',
        'get_super_admin_stats',
        -- Chat & messaging functions
        'detect_contact_in_message',
        'get_chat_leads_stats',
        'room_messages_broadcast_trigger'
      )
  LOOP
    -- Construct ALTER FUNCTION statement
    v_sql := format('ALTER FUNCTION %I.%I(%s) SET search_path = ''''', 
                    v_function.schema, 
                    v_function.name, 
                    v_function.args);
    
    -- Execute the ALTER
    BEGIN
      EXECUTE v_sql;
      RAISE NOTICE 'Fixed: %.%(%)', v_function.schema, v_function.name, v_function.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not alter function %.%(%): %', 
                    v_function.schema, v_function.name, v_function.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- =============================================================================
-- ADD COMMENTS TO CRITICAL SECURITY FUNCTIONS
-- =============================================================================

DO $$
BEGIN
  -- Only add comments if functions exist
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'current_user_id' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'COMMENT ON FUNCTION public.current_user_id() IS ''Returns current authenticated user ID - SECURITY: search_path set to empty''';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_session_valid' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'COMMENT ON FUNCTION public.is_session_valid() IS ''Validates user session - SECURITY: search_path set to empty''';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_hanouta_admin' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'COMMENT ON FUNCTION public.is_hanouta_admin() IS ''Check if user is Hanouta admin - SECURITY: search_path set to empty''';
  END IF;
END $$;
