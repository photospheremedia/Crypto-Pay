-- ============================================================
-- FIX SECURITY DEFINER VIEWS
-- Date: 2026-02-02
-- Purpose: Change views from SECURITY DEFINER to SECURITY INVOKER
-- ============================================================

-- The Supabase AI migration recreated views without security_invoker settings,
-- causing them to default to SECURITY DEFINER which is a security risk.
-- This migration explicitly sets all views to SECURITY INVOKER to ensure
-- they run with the permissions of the querying user, not the view creator.

-- ============================================================
-- 1. FIX CHAT_LEADS_SUMMARY VIEW
-- ============================================================

-- Drop and recreate with security_invoker
DROP VIEW IF EXISTS public.chat_leads_summary CASCADE;

CREATE OR REPLACE VIEW public.chat_leads_summary
WITH (security_invoker = true)
AS  
SELECT 
  c.id,
  c.session_id,
  COALESCE(c.guest_name, up.full_name, 'Anonymous'::text) AS name,
  COALESCE(c.guest_email, up.email) AS email,
  c.guest_phone AS phone,
  c.is_guest,
  c.status,
  c.lead_status,
  c.lead_score,
  c.interested_in,
  c.contact_captured,
  c.message_count,
  c.started_at,
  c.ended_at,
  c.assigned_to,
  assigned_user.full_name AS assigned_to_name,
  c.internal_notes,
  c.follow_up_date,
  c.follow_up_completed,
  c.created_at,
  c.updated_at
FROM public.chat_conversations c
LEFT JOIN public.user_profiles up ON c.user_id = up.id
LEFT JOIN public.user_profiles assigned_user ON c.assigned_to = assigned_user.id
ORDER BY c.created_at DESC;

COMMENT ON VIEW public.chat_leads_summary IS 'Summary of chat conversations with lead capture info - enforces RLS of querying user';

-- ============================================================
-- 2. FIX SECURITY_DASHBOARD VIEW
-- ============================================================

DROP VIEW IF EXISTS public.security_dashboard CASCADE;

CREATE OR REPLACE VIEW public.security_dashboard
WITH (security_invoker = true)
AS
SELECT 
    up.id,
    up.email,
    up.created_at,
    up.updated_at,
    COUNT(DISTINCT us.id) as active_sessions,
    COUNT(DISTINCT CASE 
        WHEN use.event_type = 'failed_login' 
        AND use.created_at > NOW() - INTERVAL '24 hours' 
        THEN use.id 
    END) as failed_logins_24h,
    MAX(CASE WHEN use.event_type = 'login' THEN use.created_at END) as last_successful_login,
    MAX(CASE WHEN use.event_type = 'failed_login' THEN use.created_at END) as last_failed_login
FROM public.user_profiles up
LEFT JOIN public.user_sessions us ON us.user_id = up.id AND us.expires_at > NOW()
LEFT JOIN public.user_security_events use ON use.user_id = up.id
GROUP BY up.id, up.email, up.created_at, up.updated_at;

COMMENT ON VIEW public.security_dashboard IS 'Security overview for monitoring user activity and sessions - enforces RLS of querying user';

-- ============================================================
-- 3. FIX NEWSLETTER_ANALYTICS VIEW
-- ============================================================

DROP VIEW IF EXISTS public.newsletter_analytics CASCADE;

CREATE OR REPLACE VIEW public.newsletter_analytics
WITH (security_invoker = true)
AS
SELECT 
  DATE_TRUNC('day', created_at) as subscribe_date,
  list_type,
  source,
  status,
  COUNT(*) as subscriber_count,
  COUNT(CASE WHEN confirmed = true THEN 1 END) as confirmed_count,
  SUM(emails_sent) as total_emails_sent,
  SUM(emails_opened) as total_emails_opened,
  SUM(emails_clicked) as total_emails_clicked
FROM public.newsletter_subscribers
GROUP BY DATE_TRUNC('day', created_at), list_type, source, status
ORDER BY subscribe_date DESC;

COMMENT ON VIEW public.newsletter_analytics IS 'Newsletter subscription analytics - enforces RLS of querying user';

-- ============================================================
-- 4. FIX CUSTOMER_ANALYTICS VIEW
-- ============================================================

DROP VIEW IF EXISTS public.customer_analytics CASCADE;

CREATE OR REPLACE VIEW public.customer_analytics
WITH (security_invoker = true)
AS
SELECT 
    c.id,
    c.tenant_id,
    c.email,
    c.full_name as name,
    c.phone,
    c.status,
    c.total_orders,
    c.total_spent_cents,
    c.last_order_at,
    c.first_order_at,
    c.source,
    c.created_at,
    'customer'::text as customer_type,
    c.user_id IS NOT NULL as is_registered,
    c.accepts_marketing
FROM public.shop_customers c

UNION ALL

SELECT 
    g.id,
    g.tenant_id,
    g.email,
    g.name,
    g.phone,
    'lead'::text as status,
    0 as total_orders,
    COALESCE(g.cart_total_cents, 0) as total_spent_cents,
    NULL::timestamp with time zone as last_order_at,
    NULL::timestamp with time zone as first_order_at,
    g.utm_source as source,
    g.created_at,
    'lead'::text as customer_type,
    false as is_registered,
    false as accepts_marketing
FROM public.guest_sessions g
WHERE g.email IS NOT NULL 
  AND g.converted_to_customer_id IS NULL;

COMMENT ON VIEW public.customer_analytics IS 'Combined customer and guest analytics - enforces RLS of querying user';

-- ============================================================
-- 5. FIX LEAD_ANALYTICS VIEW
-- ============================================================

DROP VIEW IF EXISTS public.lead_analytics CASCADE;

CREATE OR REPLACE VIEW public.lead_analytics
WITH (security_invoker = true)
AS
SELECT 
  DATE_TRUNC('day', created_at) as signup_date,
  source,
  status,
  org_type,
  COUNT(*) as lead_count,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_count
FROM public.leads
GROUP BY DATE_TRUNC('day', created_at), source, status, org_type
ORDER BY signup_date DESC;

COMMENT ON VIEW public.lead_analytics IS 'Lead signup and conversion analytics - enforces RLS of querying user';

-- ============================================================
-- 6. VERIFY ALL VIEWS ARE NOW SECURITY INVOKER
-- ============================================================

-- Query to verify the security invoker setting (for manual verification):
-- SELECT 
--   schemaname, 
--   viewname,
--   viewowner,
--   definition
-- FROM pg_views
-- WHERE schemaname = 'public' 
--   AND viewname IN ('chat_leads_summary', 'security_dashboard', 'newsletter_analytics', 'customer_analytics', 'lead_analytics');

-- ============================================================
-- 7. GRANT APPROPRIATE PERMISSIONS
-- ============================================================

-- Grant SELECT to authenticated users (they'll be filtered by RLS)
GRANT SELECT ON public.chat_leads_summary TO authenticated;
GRANT SELECT ON public.security_dashboard TO authenticated;
GRANT SELECT ON public.newsletter_analytics TO authenticated;
GRANT SELECT ON public.customer_analytics TO authenticated;
GRANT SELECT ON public.lead_analytics TO authenticated;

-- ============================================================
-- SECURITY NOTES
-- ============================================================

/*
SECURITY INVOKER vs SECURITY DEFINER:

- SECURITY INVOKER (correct): View runs with permissions of the QUERYING USER
  - RLS policies apply based on who is running the query
  - Safer for multi-tenant applications
  - User sees only data they have permission to see

- SECURITY DEFINER (dangerous): View runs with permissions of the VIEW CREATOR
  - RLS policies apply based on who created the view
  - Can expose data the querying user shouldn't see
  - Privilege escalation risk if view creator is superuser

All views in this application should use SECURITY INVOKER to ensure proper
tenant isolation and RLS enforcement.
*/
