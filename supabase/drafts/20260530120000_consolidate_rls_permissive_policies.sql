-- DRAFT — NOT YET A MIGRATION. Do not deploy as-is.
--
-- Purpose: resolve the 89 "Multiple Permissive Policies" performance advisories by
--   (1) scoping policies to the `authenticated` role instead of the implicit
--       `{public}` role (which also matches anon/authenticator/dashboard_user/etc.,
--       multiplying the lint by ~6x per action), and
--   (2) merging overlapping admin/staff/own policies for the SAME action into a
--       single permissive policy combined with OR.
--
-- Safety notes:
--   * `service_role` has BYPASSRLS, so the `*_service_manage` policies (which only
--     ever matched service_role JWTs) are pure dead weight and are dropped.
--   * Behaviour is intended to be equivalent: each combined USING/WITH CHECK is the
--     OR of the originals it replaces.
--   * `anon` access is preserved ONLY where it is intentional today: public lead
--     submission and public newsletter signup (INSERT).
--
-- HOW TO SHIP THIS SAFELY (test-first; do NOT just move it into migrations/):
--   1. Start a local stack and apply against a fresh copy of the schema:
--        supabase db reset            # applies all migrations to local
--        psql "$LOCAL_DB_URL" -f supabase/drafts/20260530120000_consolidate_rls_permissive_policies.sql
--   2. Run the RLS regression checks (anon submit lead/subscribe; merchant sees own
--      wallet only; staff/admin see all; user sees own profile/sessions; admin sees
--      all security events) — see apps/portal/tests + manual checks.
--   3. Re-run advisors and confirm the permissive-policy warnings drop to ~0.
--   4. Only then: move/rename this file into supabase/migrations/ with a fresh
--      timestamp so the Supabase CI/CD workflow applies it to production.

begin;

-- =========================================================================
-- user_sessions  (was: sessions_service_manage + sessions_user_own_access, role public, ALL)
-- =========================================================================
drop policy if exists "sessions_service_manage" on public.user_sessions;
drop policy if exists "sessions_user_own_access" on public.user_sessions;

create policy "sessions_user_own_access" on public.user_sessions
  as permissive for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- =========================================================================
-- newsletter_subscribers
--   was: "Service role can manage all subscribers" (ALL, public)  -> dropped (bypassrls)
--        "Users can manage own subscription"       (ALL, public)  -> authenticated
--        "Anyone can subscribe with valid email"   (INSERT, public)-> anon only
-- =========================================================================
drop policy if exists "Service role can manage all subscribers" on public.newsletter_subscribers;
drop policy if exists "Users can manage own subscription" on public.newsletter_subscribers;
drop policy if exists "Anyone can subscribe with valid email" on public.newsletter_subscribers;

create policy "Anyone can subscribe with valid email" on public.newsletter_subscribers
  as permissive for insert to anon
  with check (
    (email is not null)
    and (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text)
  );

create policy "Users can manage own subscription" on public.newsletter_subscribers
  as permissive for all to authenticated
  using (
    ((select auth.uid()) is not null)
    and (email = ((select users.email from auth.users where users.id = (select auth.uid())))::text)
  )
  with check (
    ((select auth.uid()) is not null)
    and (email = ((select users.email from auth.users where users.id = (select auth.uid())))::text)
  );

-- =========================================================================
-- merchant_wallets
--   SELECT: CP admins + Staff + own  -> single authenticated policy (OR)
--   UPDATE: CP admins + Staff + own  -> single authenticated policy (OR)
--   INSERT: own (re-scoped)          DELETE: own pending (re-scoped)
-- =========================================================================
drop policy if exists "CP admins view all merchant wallets" on public.merchant_wallets;
drop policy if exists "Staff view all merchant wallets" on public.merchant_wallets;
drop policy if exists "Users view own merchant wallets" on public.merchant_wallets;
drop policy if exists "CP admins update merchant wallet verification" on public.merchant_wallets;
drop policy if exists "Staff update merchant wallet verification" on public.merchant_wallets;
drop policy if exists "Users update own merchant wallets" on public.merchant_wallets;
drop policy if exists "Users insert own merchant wallets" on public.merchant_wallets;
drop policy if exists "Users delete own pending merchant wallets" on public.merchant_wallets;

create policy "merchant_wallets_select" on public.merchant_wallets
  as permissive for select to authenticated
  using (
    is_platform_super_admin()
    or is_staff_jwt()
    or ((select auth.uid()) = user_id)
  );

create policy "merchant_wallets_insert" on public.merchant_wallets
  as permissive for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "merchant_wallets_update" on public.merchant_wallets
  as permissive for update to authenticated
  using (
    is_platform_super_admin()
    or is_staff_jwt()
    or ((select auth.uid()) = user_id)
  )
  with check (
    is_platform_super_admin()
    or is_staff_jwt()
    or ((select auth.uid()) = user_id)
  );

create policy "merchant_wallets_delete" on public.merchant_wallets
  as permissive for delete to authenticated
  using (((select auth.uid()) = user_id) and (status = 'pending'::text));

-- =========================================================================
-- user_security_events
--   was: service_manage (dropped), admin_view + user_view + *_select (3 SELECT) -> 1 SELECT
--   INSERT policy already authenticated/single -> kept
-- =========================================================================
drop policy if exists "security_events_service_manage" on public.user_security_events;
drop policy if exists "security_events_admin_view" on public.user_security_events;
drop policy if exists "security_events_user_view" on public.user_security_events;
drop policy if exists "user_security_events_select" on public.user_security_events;

create policy "user_security_events_select" on public.user_security_events
  as permissive for select to authenticated
  using (
    ((select auth.uid()) = user_id)
    or exists (
      select 1 from public.user_profiles up
      where up.id = (select auth.uid())
        and up.role = any (array['admin'::text, 'owner'::text])
    )
  );

-- =========================================================================
-- staff_activity
--   was: "Users can update own activity" (ALL, public) + "Admins can view staff activity" (SELECT, public)
--   The ALL policy overlapped admin SELECT -> split per-action; SELECT = own OR admin.
-- =========================================================================
drop policy if exists "Users can update own activity" on public.staff_activity;
drop policy if exists "Admins can view staff activity" on public.staff_activity;

create policy "staff_activity_select" on public.staff_activity
  as permissive for select to authenticated
  using (
    (user_id = (select auth.uid()))
    or exists (
      select 1 from public.memberships m
      where m.user_id = (select auth.uid())
        and m.status = 'active'::text
        and m.role = any (array['rhs_admin'::text, 'admin'::text, 'owner'::text])
    )
  );

create policy "staff_activity_insert_own" on public.staff_activity
  as permissive for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "staff_activity_update_own" on public.staff_activity
  as permissive for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "staff_activity_delete_own" on public.staff_activity
  as permissive for delete to authenticated
  using (user_id = (select auth.uid()));

-- =========================================================================
-- sms_outbound_log  (SELECT: CP admins + own -> single authenticated policy)
-- =========================================================================
drop policy if exists "CP admins read SMS outbound log" on public.sms_outbound_log;
drop policy if exists "Users read own SMS outbound log" on public.sms_outbound_log;

create policy "sms_outbound_log_select" on public.sms_outbound_log
  as permissive for select to authenticated
  using (
    is_platform_super_admin()
    or ((select auth.uid()) = user_id)
  );

-- =========================================================================
-- leads
--   INSERT: public submit -> anon + authenticated (single policy)
--   SELECT: admins + own   -> single authenticated policy (OR)
-- =========================================================================
drop policy if exists "Anyone can submit leads" on public.leads;
drop policy if exists "Admins can view all leads" on public.leads;
drop policy if exists "Users can view own lead" on public.leads;

create policy "Anyone can submit leads" on public.leads
  as permissive for insert to anon, authenticated
  with check (
    (email is not null)
    and (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text)
  );

create policy "leads_select" on public.leads
  as permissive for select to authenticated
  using (
    (user_id = (select auth.uid()))
    or exists (
      select 1 from public.user_profiles
      where user_profiles.id = (select auth.uid())
        and user_profiles.role = 'admin'::text
    )
  );

-- =========================================================================
-- user_wallet_profiles  (all already authenticated; just merge SELECT x3 and UPDATE x3)
-- =========================================================================
drop policy if exists "CP admins can view all wallet profiles" on public.user_wallet_profiles;
drop policy if exists "Staff view all wallet profiles" on public.user_wallet_profiles;
drop policy if exists "Users can view own wallet profile" on public.user_wallet_profiles;
drop policy if exists "CP admins can update wallet verification" on public.user_wallet_profiles;
drop policy if exists "Staff update wallet verification" on public.user_wallet_profiles;
drop policy if exists "Users can update own wallet profile" on public.user_wallet_profiles;

create policy "user_wallet_profiles_select" on public.user_wallet_profiles
  as permissive for select to authenticated
  using (
    is_platform_super_admin()
    or is_staff_jwt()
    or ((select auth.uid()) = user_id)
  );

create policy "user_wallet_profiles_update" on public.user_wallet_profiles
  as permissive for update to authenticated
  using (
    is_platform_super_admin()
    or is_staff_jwt()
    or ((select auth.uid()) = user_id)
  )
  with check (
    is_platform_super_admin()
    or is_staff_jwt()
    or ((select auth.uid()) = user_id)
  );
-- NOTE: "Users can insert own wallet profile" (INSERT, authenticated) is already a
-- single policy and is intentionally left unchanged.

-- =========================================================================
-- user_profiles  (merge SELECT x2 and UPDATE x2; both already authenticated)
--   "Service can insert profiles" (INSERT, service_role) left unchanged — it does not
--   overlap authenticated/anon and service_role bypasses RLS anyway.
-- =========================================================================
drop policy if exists "Staff read merchant profiles" on public.user_profiles;
drop policy if exists "Users can view own profile" on public.user_profiles;
drop policy if exists "Staff update merchant profiles" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;

create policy "user_profiles_select" on public.user_profiles
  as permissive for select to authenticated
  using (
    ((select auth.uid()) = id)
    or (is_staff_jwt() and (coalesce(role, ''::text) <> 'cp_admin'::text))
  );

create policy "user_profiles_update" on public.user_profiles
  as permissive for update to authenticated
  using (
    ((select auth.uid()) = id)
    or (is_staff_jwt() and (coalesce(role, ''::text) <> 'cp_admin'::text))
  )
  with check (
    ((select auth.uid()) = id)
    or (coalesce(role, ''::text) <> 'cp_admin'::text)
  );

commit;

-- Verification (run after applying locally): expect zero rows.
-- select tablename, cmd, count(*)
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('user_sessions','newsletter_subscribers','merchant_wallets',
--     'user_security_events','staff_activity','sms_outbound_log','leads',
--     'user_wallet_profiles','user_profiles')
-- group by tablename, cmd, roles
-- having count(*) > 1;
