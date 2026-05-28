-- Remove legacy Restaurant Hub naming (`rhs_*`) from developer-facing APIs
-- and address Supabase security advisors for SECURITY DEFINER RPC exposure.
--
-- Strategy:
-- - Stop using SECURITY DEFINER helper RPCs in `public` (removes linter warnings).
-- - Use JWT claims (`user_role`, `platform_realm`) set by `custom_access_token_hook`
--   for RLS checks (SECURITY INVOKER).
-- - Inline the admin-tenant lookup inside `custom_access_token_hook` and drop
--   `platform_admin_tenant_id()`.
-- - Replace `is_merchant_account()` with a simple profile-role guard to avoid
--   SECURITY DEFINER membership checks in RLS.

-- -----------------------------------------------------
-- Admin/staff helpers (SECURITY INVOKER)
-- -----------------------------------------------------

-- True for platform super admins only (cp_admin / rhs_admin).
CREATE OR REPLACE FUNCTION public.is_platform_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(((select auth.jwt()) ->> 'user_role') IN ('cp_admin', 'rhs_admin'), false);
$$;

-- True for any staff session (platform_realm=admin) based on JWT claims.
CREATE OR REPLACE FUNCTION public.is_staff_jwt()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce(((select auth.jwt()) ->> 'platform_realm') = 'admin', false);
$$;

-- -----------------------------------------------------
-- RLS policy updates (remove rhs/cp helper calls)
-- -----------------------------------------------------

-- audit_logs: super admins only
ALTER POLICY "Super admins can view audit logs"
ON public.audit_logs
USING (public.is_platform_super_admin());

-- merchant_wallets: cp super admins
ALTER POLICY "CP admins view all merchant wallets"
ON public.merchant_wallets
USING (public.is_platform_super_admin());

ALTER POLICY "CP admins update merchant wallet verification"
ON public.merchant_wallets
USING (public.is_platform_super_admin())
WITH CHECK (public.is_platform_super_admin());

-- user_wallet_profiles: cp super admins
ALTER POLICY "CP admins can view all wallet profiles"
ON public.user_wallet_profiles
USING (public.is_platform_super_admin());

ALTER POLICY "CP admins can update wallet verification"
ON public.user_wallet_profiles
USING (public.is_platform_super_admin())
WITH CHECK (public.is_platform_super_admin());

-- user_profiles: staff can only access merchant profiles (non-cp_admin)
ALTER POLICY "Staff read merchant profiles"
ON public.user_profiles
USING (public.is_staff_jwt() AND coalesce(role, '') <> 'cp_admin');

ALTER POLICY "Staff update merchant profiles"
ON public.user_profiles
USING (public.is_staff_jwt() AND coalesce(role, '') <> 'cp_admin')
WITH CHECK (coalesce(role, '') <> 'cp_admin');

-- -----------------------------------------------------
-- Update trigger/auth-hook helpers
-- -----------------------------------------------------

-- merchant_wallet_verification_guard: replace is_cp_admin() with JWT-based check.
CREATE OR REPLACE FUNCTION public.merchant_wallet_verification_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.verification_requested_at := coalesce(new.verification_requested_at, now());
    new.verified_at := null;
    new.verified_by := null;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if not public.is_platform_super_admin() then
      if new.status is distinct from old.status
        and new.status in ('verified', 'rejected') then
        new.status := old.status;
      end if;

      if new.wallet_address is distinct from old.wallet_address
        or new.wallet_network is distinct from old.wallet_network then
        new.status := 'pending';
        new.verification_requested_at := now();
        new.verified_at := null;
        new.verified_by := null;
        new.rejection_reason := null;
        new.merchant_status_emailed_at := null;
        new.merchant_status_emailed_for_request := null;
      end if;
    end if;

    return new;
  end if;

  return new;
end;
$function$;

-- Inline admin-tenant lookup directly in the hook to remove platform_admin_tenant_id().
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
declare
  claims jsonb;
  user_role text;
  v_admin_tenant_id uuid;
begin
  select t.id
  into v_admin_tenant_id
  from public.tenants t
  where t.slug = 'crypto-pay-admin'
  limit 1;

  select m.role
  into user_role
  from public.memberships m
  where m.user_id = (event->>'user_id')::uuid
    and m.status = 'active'
    and m.tenant_id = v_admin_tenant_id
    and m.role in ('cp_admin', 'rhs_admin', 'admin', 'manager', 'staff')
  order by
    case m.role
      when 'cp_admin' then 5
      when 'rhs_admin' then 5
      when 'admin' then 4
      when 'manager' then 2
      when 'staff' then 1
      else -1
    end desc
  limit 1;

  claims := event->'claims';

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{platform_realm}', '\"admin\"'::jsonb);
  else
    claims := jsonb_set(claims, '{user_role}', 'null'::jsonb);
    claims := jsonb_set(claims, '{platform_realm}', '\"merchant\"'::jsonb);
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$function$;

-- -----------------------------------------------------
-- Drop legacy functions (no longer referenced)
-- -----------------------------------------------------

DROP FUNCTION IF EXISTS public.is_rhs_admin();
DROP FUNCTION IF EXISTS public.is_cp_admin();
DROP FUNCTION IF EXISTS public.is_merchant_account(uuid);
DROP FUNCTION IF EXISTS public.platform_admin_tenant_id();

