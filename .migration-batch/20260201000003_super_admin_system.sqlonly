-- ============================================
-- SUPER ADMIN SYSTEM TABLES
-- ============================================
-- Audit logs, staff activity, system metrics

-- ============================================
-- 1. AUDIT LOGS TABLE
-- ============================================
-- Track all important actions for compliance and debugging

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who performed the action
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  
  -- What was done
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'export', etc.
  resource_type TEXT NOT NULL, -- 'lead', 'order', 'product', 'user', 'settings', etc.
  resource_id TEXT, -- ID of the affected resource
  
  -- Details
  description TEXT,
  old_values JSONB, -- Previous state (for updates)
  new_values JSONB, -- New state
  metadata JSONB, -- Additional context
  
  -- Request info
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================
-- 2. STAFF ACTIVITY TABLE
-- ============================================
-- Track staff online status and recent activity

CREATE TABLE IF NOT EXISTS public.staff_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity tracking
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  last_action TEXT,
  last_resource TEXT,
  
  -- Session info
  is_online BOOLEAN DEFAULT false,
  current_page TEXT,
  session_started_at TIMESTAMPTZ,
  
  -- Stats (updated periodically)
  leads_handled_today INT DEFAULT 0,
  orders_processed_today INT DEFAULT 0,
  messages_sent_today INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_activity_last_seen ON public.staff_activity(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_activity_online ON public.staff_activity(is_online) WHERE is_online = true;

-- ============================================
-- 3. SYSTEM METRICS TABLE
-- ============================================
-- Daily/hourly aggregated metrics for dashboard

CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time bucket
  period_type TEXT NOT NULL CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  period_start TIMESTAMPTZ NOT NULL,
  
  -- Metrics
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  
  -- Dimensions (optional grouping)
  dimension_name TEXT,
  dimension_value TEXT,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(period_type, period_start, metric_name, dimension_name, dimension_value)
);

CREATE INDEX IF NOT EXISTS idx_system_metrics_lookup ON public.system_metrics(metric_name, period_type, period_start DESC);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to log an audit event
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_role TEXT;
  v_log_id UUID;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    SELECT role INTO v_user_role FROM public.memberships 
    WHERE user_id = v_user_id AND status = 'active' LIMIT 1;
  END IF;
  
  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id, user_email, user_role,
    action, resource_type, resource_id,
    description, old_values, new_values, metadata
  ) VALUES (
    v_user_id, v_user_email, v_user_role,
    p_action, p_resource_type, p_resource_id,
    p_description, p_old_values, p_new_values, p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to update staff activity
CREATE OR REPLACE FUNCTION public.update_staff_activity(
  p_action TEXT DEFAULT NULL,
  p_resource TEXT DEFAULT NULL,
  p_page TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.staff_activity (
    user_id, last_seen_at, last_action, last_resource, 
    current_page, is_online, session_started_at
  ) VALUES (
    auth.uid(), now(), p_action, p_resource, 
    p_page, true, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    last_seen_at = now(),
    last_action = COALESCE(p_action, staff_activity.last_action),
    last_resource = COALESCE(p_resource, staff_activity.last_resource),
    current_page = COALESCE(p_page, staff_activity.current_page),
    is_online = true,
    updated_at = now();
END;
$$;

-- Function to get system stats for super admin dashboard
CREATE OR REPLACE FUNCTION public.get_super_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_tenants BIGINT,
  total_leads BIGINT,
  new_leads_today BIGINT,
  total_orders BIGINT,
  orders_today BIGINT,
  revenue_today NUMERIC,
  active_staff BIGINT,
  chat_conversations_today BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM auth.users)::BIGINT as total_users,
    (SELECT COUNT(*) FROM public.tenants WHERE status = 'active')::BIGINT as total_tenants,
    (SELECT COUNT(*) FROM public.chat_conversations WHERE contact_captured = true)::BIGINT as total_leads,
    (SELECT COUNT(*) FROM public.chat_conversations 
     WHERE contact_captured = true AND started_at >= CURRENT_DATE)::BIGINT as new_leads_today,
    (SELECT COUNT(*) FROM public.orders)::BIGINT as total_orders,
    (SELECT COUNT(*) FROM public.orders WHERE created_at >= CURRENT_DATE)::BIGINT as orders_today,
    COALESCE((SELECT SUM(total_cents)::NUMERIC / 100 FROM public.orders 
     WHERE created_at >= CURRENT_DATE), 0) as revenue_today,
    (SELECT COUNT(*) FROM public.staff_activity 
     WHERE is_online = true AND last_seen_at > now() - interval '5 minutes')::BIGINT as active_staff,
    (SELECT COUNT(*) FROM public.chat_conversations 
     WHERE started_at >= CURRENT_DATE)::BIGINT as chat_conversations_today;
END;
$$;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Audit logs: Only super admins can read
CREATE POLICY "Super admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_rhs_admin());

-- Staff activity: Admins can view, users can update their own
CREATE POLICY "Admins can view staff activity"
  ON public.staff_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND role IN ('rhs_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "Users can update own activity"
  ON public.staff_activity FOR ALL
  USING (user_id = auth.uid());

-- System metrics: Only super admins
CREATE POLICY "Super admins can view system metrics"
  ON public.system_metrics FOR SELECT
  USING (public.is_rhs_admin());

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_staff_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_super_admin_stats TO authenticated;
