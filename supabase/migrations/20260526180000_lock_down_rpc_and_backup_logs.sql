-- Security hardening (Supabase linter + Context7 guidance):
-- - Enable RLS on backup_logs
-- - Add policies for tables with RLS but no policies
-- - Revoke public/anon/authenticated EXECUTE on server-only SECURITY DEFINER RPCs
-- - Grant service_role EXECUTE for portal + edge functions

-- ---------------------------------------------------------------------------
-- backup_logs: internal metadata — staff read, service role write
-- ---------------------------------------------------------------------------
alter table public.backup_logs enable row level security;

drop policy if exists "Staff read backup logs" on public.backup_logs;
create policy "Staff read backup logs"
  on public.backup_logs
  for select
  to authenticated
  using (public.is_staff_jwt());

drop policy if exists "Service role manages backup logs" on public.backup_logs;
create policy "Service role manages backup logs"
  on public.backup_logs
  for all
  to service_role
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Tables with RLS enabled but no policies (service-only internal data)
-- ---------------------------------------------------------------------------
drop policy if exists "Service role full access runner_api_clients" on public.runner_api_clients;
create policy "Service role full access runner_api_clients"
  on public.runner_api_clients
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role full access runner_api_events" on public.runner_api_events;
create policy "Service role full access runner_api_events"
  on public.runner_api_events
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Staff read customer_category_discounts" on public.customer_category_discounts;
create policy "Staff read customer_category_discounts"
  on public.customer_category_discounts
  for select
  to authenticated
  using (public.is_staff_jwt());

drop policy if exists "Service role full access customer_category_discounts" on public.customer_category_discounts;
create policy "Service role full access customer_category_discounts"
  on public.customer_category_discounts
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Staff read volume_pricing" on public.volume_pricing;
create policy "Staff read volume_pricing"
  on public.volume_pricing
  for select
  to authenticated
  using (public.is_staff_jwt());

drop policy if exists "Service role full access volume_pricing" on public.volume_pricing;
create policy "Service role full access volume_pricing"
  on public.volume_pricing
  for all
  to service_role
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- RLS helpers: revoke PUBLIC (anon inherits it), re-grant authenticated only
-- ---------------------------------------------------------------------------
revoke execute on function public.is_cp_admin() from public;
revoke execute on function public.is_rhs_admin() from public;
revoke execute on function public.is_merchant_account(uuid) from public;
revoke execute on function public.is_staff_jwt() from public;
revoke execute on function public.platform_admin_tenant_id() from public;

grant execute on function public.is_cp_admin() to authenticated, service_role;
grant execute on function public.is_rhs_admin() to authenticated, service_role;
grant execute on function public.is_merchant_account(uuid) to authenticated, service_role;
grant execute on function public.is_staff_jwt() to authenticated, service_role;
grant execute on function public.platform_admin_tenant_id() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Auth hook: only supabase_auth_admin may execute (Context7 pattern)
-- ---------------------------------------------------------------------------
revoke execute on function public.custom_access_token_hook(jsonb)
  from anon, authenticated, public;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;

-- ---------------------------------------------------------------------------
-- Server-only RPCs: revoke from anon + authenticated, grant service_role
-- ---------------------------------------------------------------------------
revoke execute on function public.admin_search(text, integer)
  from anon, authenticated, public;

revoke execute on function public.cleanup_expired_sessions()
  from anon, authenticated, public;

revoke execute on function public.convert_guest_to_customer(uuid, uuid)
  from anon, authenticated, public;

revoke execute on function public.get_chat_leads_stats()
  from anon, authenticated, public;

revoke execute on function public.get_customer_price(uuid, uuid, integer, numeric)
  from anon, authenticated, public;

revoke execute on function public.get_private_file_url(text, text)
  from anon, authenticated, public;

revoke execute on function public.get_super_admin_stats()
  from anon, authenticated, public;

revoke execute on function public.get_user_order_stats(uuid)
  from anon, authenticated, public;

revoke execute on function public.handle_new_user()
  from anon, authenticated, public;

revoke execute on function public.has_tenant_role_any(uuid, text[])
  from anon, authenticated, public;

revoke execute on function public.is_session_valid()
  from anon, authenticated, public;

revoke execute on function public.is_tenant_member_cached(uuid)
  from anon, authenticated, public;

revoke execute on function public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb)
  from anon, authenticated, public;

revoke execute on function public.log_security_event(uuid, character varying, inet, text, jsonb)
  from anon, authenticated, public;

revoke execute on function public.merchant_wallet_verification_guard()
  from anon, authenticated, public;

revoke execute on function public.process_admin_invite()
  from anon, authenticated, public;

revoke execute on function public.revoke_user_sessions(uuid)
  from anon, authenticated, public;

revoke execute on function public.rls_auto_enable()
  from anon, authenticated, public;

revoke execute on function public.set_updated_at()
  from anon, authenticated, public;

revoke execute on function public.update_staff_activity(text, text, text)
  from anon, authenticated, public;

-- Ensure admin stats RPCs stay service-role only (idempotent)
revoke execute on function public.admin_dashboard_stats(boolean)
  from anon, authenticated, public;
grant execute on function public.admin_dashboard_stats(boolean) to service_role;

grant execute on function public.admin_search(text, integer) to service_role;
grant execute on function public.cleanup_expired_sessions() to service_role;
grant execute on function public.convert_guest_to_customer(uuid, uuid) to service_role;
grant execute on function public.get_chat_leads_stats() to service_role;
grant execute on function public.get_customer_price(uuid, uuid, integer, numeric) to service_role;
grant execute on function public.get_private_file_url(text, text) to service_role;
grant execute on function public.get_super_admin_stats() to service_role;
grant execute on function public.get_user_order_stats(uuid) to service_role;
grant execute on function public.has_tenant_role_any(uuid, text[]) to service_role;
grant execute on function public.is_session_valid() to service_role;
grant execute on function public.is_tenant_member_cached(uuid) to service_role;
grant execute on function public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) to service_role;
grant execute on function public.log_security_event(uuid, character varying, inet, text, jsonb) to service_role;
grant execute on function public.process_admin_invite() to service_role;
grant execute on function public.revoke_user_sessions(uuid) to service_role;
grant execute on function public.update_staff_activity(text, text, text) to service_role;

-- Fix search_path on legacy helper (security advisor)
create or replace function public.is_rhs_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select public.is_cp_admin();
$$;
