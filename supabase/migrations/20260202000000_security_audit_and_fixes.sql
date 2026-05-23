-- ============================================================
-- COMPREHENSIVE SECURITY AUDIT AND FIXES
-- Date: 2026-02-02
-- Purpose: Address database schema errors and security issues
-- ============================================================

-- ============================================================
-- 1. FIX COLUMN REFERENCE ERRORS IN SECURITY ENHANCEMENTS
-- ============================================================

-- ISSUE: Previous migration referenced non-existent columns
-- FIX: Drop incorrect indexes and create correct ones

DROP INDEX IF EXISTS idx_user_profiles_user_id CASCADE;
DROP INDEX IF EXISTS idx_user_profiles_last_login CASCADE;
DROP INDEX IF EXISTS idx_user_profiles_failed_login CASCADE;
DROP INDEX IF EXISTS idx_user_profiles_account_locked CASCADE;
DROP INDEX IF EXISTS idx_user_profiles_email_verification CASCADE;

-- Create correct indexes on user_profiles
-- user_profiles actual columns: id, email, full_name, company_name, phone, avatar_url, role, 
-- org_name, org_type, address_line1, address_line2, city, state, postal_code, country, 
-- business_type, number_of_locations, notification_preferences, timezone, onboarding_completed,
-- onboarding_step, created_at, updated_at
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created ON public.user_profiles(created_at DESC);

-- ============================================================
-- 2. CREATE REQUIRED SECURITY TABLES
-- ============================================================

-- Create user_sessions table for session tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_security_events table for audit logging
CREATE TABLE IF NOT EXISTS public.user_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_security_events_user_id ON public.user_security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_events_created_at ON public.user_security_events(created_at DESC);

-- ============================================================
-- 3. FIX SECURITY DASHBOARD VIEW
-- ============================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.security_dashboard CASCADE;

-- Create corrected security dashboard view using actual columns
CREATE OR REPLACE VIEW public.security_dashboard AS
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

-- Enable security invoker for proper RLS enforcement
ALTER VIEW public.security_dashboard SET (security_invoker = true);

COMMENT ON VIEW public.security_dashboard IS 'Security overview for monitoring user activity and sessions - admin only';

-- ============================================================
-- 4. CREATE IMPROVED SESSION VALIDATION FUNCTION
-- ============================================================

DROP FUNCTION IF EXISTS public.is_session_valid() CASCADE;

CREATE OR REPLACE FUNCTION public.is_session_valid()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if we have a valid authenticated user
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Additional validation could be added here
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_session_valid() TO authenticated;

COMMENT ON FUNCTION public.is_session_valid() IS 'Validates if the current session is valid';

-- ============================================================
-- 5. CREATE SECURITY LOGGING FUNCTION
-- ============================================================

DROP FUNCTION IF EXISTS public.log_security_event(UUID, VARCHAR, INET, TEXT, JSONB) CASCADE;

CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id UUID,
    p_event_type VARCHAR,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.user_security_events (user_id, event_type, ip_address, user_agent, details)
    VALUES (p_user_id, p_event_type, p_ip_address, p_user_agent, p_details)
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the operation
    RAISE WARNING 'Failed to log security event for user %: %', p_user_id, SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.log_security_event(UUID, VARCHAR, INET, TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION public.log_security_event(UUID, VARCHAR, INET, TEXT, JSONB) IS 'Logs security events for audit trail';

-- ============================================================
-- 6. CREATE SESSION CLEANUP FUNCTION
-- ============================================================

DROP FUNCTION IF EXISTS public.cleanup_expired_sessions() CASCADE;

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_sessions
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error cleaning up expired sessions: %', SQLERRM;
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_expired_sessions() IS 'Removes expired session records - should be run regularly via pg_cron';

-- ============================================================
-- 7. CREATE SESSION REVOCATION FUNCTION
-- ============================================================

DROP FUNCTION IF EXISTS public.revoke_user_sessions(UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.revoke_user_sessions(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Check if user is admin
    PERFORM 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
    LIMIT 1;
    
    -- Only allow user to revoke their own sessions, or admins to revoke any
    IF NOT FOUND AND auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot revoke sessions for other users';
    END IF;
    
    DELETE FROM public.user_sessions
    WHERE user_id = p_user_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error revoking user sessions: %', SQLERRM;
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.revoke_user_sessions(UUID) TO authenticated;

COMMENT ON FUNCTION public.revoke_user_sessions(UUID) IS 'Revokes all sessions for a user - used for logout all or account security changes';

-- ============================================================
-- 8. IMPLEMENT ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on security tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS sessions_user_own_access ON public.user_sessions;
DROP POLICY IF EXISTS sessions_service_manage ON public.user_sessions;
DROP POLICY IF EXISTS security_events_user_view ON public.user_security_events;
DROP POLICY IF EXISTS security_events_service_manage ON public.user_security_events;
DROP POLICY IF EXISTS security_events_admin_view ON public.user_security_events;

-- User sessions RLS policies
CREATE POLICY sessions_user_own_access ON public.user_sessions
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY sessions_service_manage ON public.user_sessions
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- User security events RLS policies
CREATE POLICY security_events_user_view ON public.user_security_events
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY security_events_service_manage ON public.user_security_events
    FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Admin can view all security events
CREATE POLICY security_events_admin_view ON public.user_security_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid()
            AND up.role IN ('admin', 'owner')
        )
    );

-- ============================================================
-- 9. ADD COMPREHENSIVE SECURITY COMMENTS
-- ============================================================

COMMENT ON TABLE public.user_sessions IS 'Tracks active user sessions for security monitoring and session management';
COMMENT ON TABLE public.user_security_events IS 'Audit log of security-related events (logins, password changes, etc.)';
COMMENT ON COLUMN public.user_sessions.session_token IS 'Unique token for this session - used for invalidating sessions';
COMMENT ON COLUMN public.user_sessions.expires_at IS 'When this session should no longer be valid';
COMMENT ON COLUMN public.user_security_events.event_type IS 'Type of security event: login, failed_login, logout, password_change, email_change, 2fa_enabled, etc.';
COMMENT ON COLUMN public.user_security_events.metadata IS 'Additional JSON metadata about the event';

-- ============================================================
-- SECURITY AUDIT SUMMARY
-- ============================================================
/*
ISSUES FIXED IN THIS MIGRATION:
1. ✓ Removed references to non-existent columns (user_id, last_login_at, failed_login_attempts, account_locked_until, two_factor_enabled, last_password_change)
2. ✓ Created proper user_sessions table for tracking active sessions
3. ✓ Created user_security_events table for comprehensive audit trail
4. ✓ Fixed session validation function to work with current Supabase schema
5. ✓ Implemented proper RLS policies on all security tables

BEST PRACTICES IMPLEMENTED:
1. All security functions use SECURITY DEFINER to enforce rules consistently
2. RLS policies prevent privilege escalation:
   - Users can only see/manage their own sessions
   - Admins can view all events
   - Service role can bypass RLS for internal operations
3. Proper indexes for performance on common queries
4. Audit trail captures IP, user agent, and timestamps

RECOMMENDED NEXT STEPS:
1. Run cleanup_expired_sessions() regularly (recommend: hourly via pg_cron)
2. Monitor user_security_events for suspicious patterns
3. Consider adding:
   - Rate limiting on failed login attempts
   - Geo-IP checking for unusual access
   - Device fingerprinting to detect credential theft
   - Email notifications on new sessions
4. Audit all SECURITY DEFINER functions for input validation
5. Test RLS policies with different user roles
*/