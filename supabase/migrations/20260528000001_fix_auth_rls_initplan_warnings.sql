-- Fix Supabase linter warning: auth_rls_initplan
--
-- Best practice (Supabase docs):
-- Wrap auth.*() and current_setting() calls in (select ...) inside RLS policies
-- so Postgres can cache the result per statement (initPlan) instead of re-evaluating
-- the function for every row.

-- public.admin_invites
ALTER POLICY "Super admins can view invites"
ON public.admin_invites
USING (
  EXISTS (
    SELECT 1
    FROM memberships
    WHERE memberships.user_id = (select auth.uid())
      AND memberships.role = 'rhs_admin'
      AND memberships.status = 'active'
  )
);

-- public.chat_conversations
ALTER POLICY "Admins can update conversations"
ON public.chat_conversations
USING (
  EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = ANY (ARRAY['admin', 'staff', 'super_admin'])
  )
);

ALTER POLICY "Service role can insert conversations"
ON public.chat_conversations
WITH CHECK (
  (((select auth.jwt()) ->> 'role') = 'service_role')
  OR ((select auth.uid()) IS NOT NULL)
);

ALTER POLICY "Users can view own conversations"
ON public.chat_conversations
USING (
  (select auth.uid()) IS NOT NULL
  AND (select auth.uid()) = user_id
);

-- public.chat_messages
ALTER POLICY "Service role and users can insert messages"
ON public.chat_messages
WITH CHECK (
  (((select auth.jwt()) ->> 'role') = 'service_role')
  OR EXISTS (
    SELECT 1
    FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = (select auth.uid())
  )
);

ALTER POLICY "Users can view own messages"
ON public.chat_messages
USING (
  (select auth.uid()) IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = (select auth.uid())
  )
);

-- public.email_automations
ALTER POLICY "automations_admin_all"
ON public.email_automations
USING (
  EXISTS (
    SELECT 1
    FROM memberships m
    WHERE m.user_id = (select auth.uid())
      AND m.role = ANY (ARRAY['rhs_admin', 'admin'])
      AND m.status = 'active'
  )
);

-- public.email_campaigns
ALTER POLICY "campaigns_admin_all"
ON public.email_campaigns
USING (
  EXISTS (
    SELECT 1
    FROM memberships m
    WHERE m.user_id = (select auth.uid())
      AND m.role = ANY (ARRAY['rhs_admin', 'admin'])
      AND m.status = 'active'
  )
);

-- public.leads
ALTER POLICY "Admins can view all leads"
ON public.leads
USING (
  EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_profiles.id = (select auth.uid())
      AND user_profiles.role = 'admin'
  )
);

ALTER POLICY "Users can view own lead"
ON public.leads
USING (user_id = (select auth.uid()));

-- public.newsletter_subscribers
ALTER POLICY "Service role can manage all subscribers"
ON public.newsletter_subscribers
USING (((select auth.jwt()) ->> 'role') = 'service_role')
WITH CHECK (((select auth.jwt()) ->> 'role') = 'service_role');

ALTER POLICY "Users can manage own subscription"
ON public.newsletter_subscribers
USING (
  (select auth.uid()) IS NOT NULL
  AND email = (
    (SELECT users.email
     FROM auth.users
     WHERE users.id = (select auth.uid()))
  )::text
)
WITH CHECK (
  (select auth.uid()) IS NOT NULL
  AND email = (
    (SELECT users.email
     FROM auth.users
     WHERE users.id = (select auth.uid()))
  )::text
);

-- public.staff_activity
ALTER POLICY "Admins can view staff activity"
ON public.staff_activity
USING (
  EXISTS (
    SELECT 1
    FROM memberships
    WHERE memberships.user_id = (select auth.uid())
      AND memberships.status = 'active'
      AND memberships.role = ANY (ARRAY['rhs_admin', 'admin', 'owner'])
  )
);

ALTER POLICY "Users can update own activity"
ON public.staff_activity
USING (user_id = (select auth.uid()));

-- public.tenant_settings
ALTER POLICY "tenant_settings_insert"
ON public.tenant_settings
WITH CHECK (
  tenant_id IN (
    SELECT memberships.tenant_id
    FROM memberships
    WHERE memberships.user_id = (select auth.uid())
      AND memberships.role = ANY (ARRAY['owner', 'admin'])
  )
);

ALTER POLICY "tenant_settings_select"
ON public.tenant_settings
USING (
  tenant_id IN (
    SELECT memberships.tenant_id
    FROM memberships
    WHERE memberships.user_id = (select auth.uid())
  )
);

ALTER POLICY "tenant_settings_update"
ON public.tenant_settings
USING (
  tenant_id IN (
    SELECT memberships.tenant_id
    FROM memberships
    WHERE memberships.user_id = (select auth.uid())
      AND memberships.role = ANY (ARRAY['owner', 'admin'])
  )
);

-- public.user_security_events
ALTER POLICY "security_events_admin_view"
ON public.user_security_events
USING (
  EXISTS (
    SELECT 1
    FROM user_profiles up
    WHERE up.id = (select auth.uid())
      AND up.role = ANY (ARRAY['admin', 'owner'])
  )
);

ALTER POLICY "security_events_service_manage"
ON public.user_security_events
USING (((select auth.jwt()) ->> 'role') = 'service_role')
WITH CHECK (((select auth.jwt()) ->> 'role') = 'service_role');

ALTER POLICY "security_events_user_view"
ON public.user_security_events
USING (user_id = (select auth.uid()));

-- public.user_sessions
ALTER POLICY "sessions_service_manage"
ON public.user_sessions
USING (((select auth.jwt()) ->> 'role') = 'service_role')
WITH CHECK (((select auth.jwt()) ->> 'role') = 'service_role');

ALTER POLICY "sessions_user_own_access"
ON public.user_sessions
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

