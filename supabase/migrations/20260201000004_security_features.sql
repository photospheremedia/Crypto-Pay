-- Add password-related tracking and security features to user_profiles
-- This migration adds support for password management and security features

-- Add columns for password and security tracking
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_reset_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[],
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_ip INET,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ;

-- Add security audit logging
CREATE TABLE IF NOT EXISTS public.user_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'password_change', 'password_reset', '2fa_enabled', '2fa_disabled', 'login', 'failed_login', 'account_locked'
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.user_security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.user_security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.user_security_events(event_type);

-- Add RLS policies
ALTER TABLE public.user_security_events ENABLE ROW LEVEL SECURITY;

-- Users can only view their own security events
CREATE POLICY user_security_events_select ON public.user_security_events
    FOR SELECT USING (user_id = auth.uid());

-- Only the system can insert security events (via service role)
CREATE POLICY user_security_events_insert ON public.user_security_events
    FOR INSERT WITH CHECK (false); -- Must use service role

-- Add sessions table for active session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_name TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    os TEXT,
    ip_address INET,
    location_city TEXT,
    location_country TEXT,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);

-- Add RLS for sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY user_sessions_select ON public.user_sessions
    FOR SELECT USING (user_id = auth.uid());

-- Users can delete their own sessions (logout)
CREATE POLICY user_sessions_delete ON public.user_sessions
    FOR DELETE USING (user_id = auth.uid());

-- Only system can insert sessions
CREATE POLICY user_sessions_insert ON public.user_sessions
    FOR INSERT WITH CHECK (false); -- Must use service role

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS void AS $$
BEGIN
    INSERT INTO public.user_security_events (user_id, event_type, ip_address, user_agent, metadata)
    VALUES (p_user_id, p_event_type, p_ip_address, p_user_agent, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update last_login on user_profiles
CREATE OR REPLACE FUNCTION update_last_login() RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles 
    SET last_login_at = NOW(),
        failed_login_attempts = 0
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_last_login'
    ) THEN
        CREATE TRIGGER trigger_update_last_login
            AFTER INSERT ON public.user_sessions
            FOR EACH ROW
            EXECUTE FUNCTION update_last_login();
    END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions TO postgres;

COMMENT ON TABLE public.user_security_events IS 'Audit log for security-related events (password changes, 2FA, logins)';
COMMENT ON TABLE public.user_sessions IS 'Active user sessions for session management and device tracking';
COMMENT ON FUNCTION log_security_event IS 'Logs security events with IP and user agent tracking';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Removes expired sessions (should be run periodically via cron)';
