-- =====================================================
-- Migration: Fix user_security_events RLS policies
-- Date: 2026-02-05
-- 
-- Problem: INSERT policy was WITH CHECK (false) which blocks
-- all inserts including from authenticated users logging
-- their own security events.
-- =====================================================

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS user_security_events_insert ON public.user_security_events;

-- Create a new policy that allows users to insert their own events
-- This is safe because:
-- 1. Users can only insert events for their own user_id
-- 2. The table is append-only (no update/delete allowed)
-- 3. SELECT is already restricted to own events
CREATE POLICY user_security_events_insert ON public.user_security_events
    FOR INSERT 
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

-- Also update the select policy to use optimized auth.uid() pattern
DROP POLICY IF EXISTS user_security_events_select ON public.user_security_events;

CREATE POLICY user_security_events_select ON public.user_security_events
    FOR SELECT 
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- Ensure no UPDATE or DELETE policies exist (append-only table)
DROP POLICY IF EXISTS user_security_events_update ON public.user_security_events;
DROP POLICY IF EXISTS user_security_events_delete ON public.user_security_events;

-- Add a comment explaining the security model
COMMENT ON TABLE public.user_security_events IS 
'Append-only audit log for security events. Users can only insert and view their own events.';
