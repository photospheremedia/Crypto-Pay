-- Post–Crypto Pay apply: lock down RPCs, runner RLS, drop orphaned RH functions.

begin;

-- Runner API tables (service role only)
drop policy if exists "Service role full access runner_api_clients" on public.runner_api_clients;
create policy "Service role full access runner_api_clients"
  on public.runner_api_clients for all to service_role
  using (true) with check (true);

drop policy if exists "Service role full access runner_api_events" on public.runner_api_events;
create policy "Service role full access runner_api_events"
  on public.runner_api_events for all to service_role
  using (true) with check (true);

-- backup_logs when present
do $$
begin
  if exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'backup_logs'
  ) then
    execute 'alter table public.backup_logs enable row level security';
    execute 'drop policy if exists "Staff read backup logs" on public.backup_logs';
    execute $p$
      create policy "Staff read backup logs"
        on public.backup_logs for select to authenticated
        using (public.is_staff_jwt())
    $p$;
    execute 'drop policy if exists "Service role manages backup logs" on public.backup_logs';
    execute $p$
      create policy "Service role manages backup logs"
        on public.backup_logs for all to service_role
        using (true) with check (true)
    $p$;
  end if;
end $$;

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

revoke execute on function public.custom_access_token_hook(jsonb)
  from anon, authenticated, public;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;

revoke execute on function public.admin_dashboard_stats(boolean)
  from anon, authenticated, public;
grant execute on function public.admin_dashboard_stats(boolean) to service_role;

revoke execute on function public.get_chat_leads_stats() from anon, authenticated, public;
grant execute on function public.get_chat_leads_stats() to service_role;

revoke execute on function public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb)
  from anon, authenticated, public;
grant execute on function public.log_audit_event(text, text, text, text, jsonb, jsonb, jsonb) to service_role;

revoke execute on function public.revoke_user_sessions(uuid) from anon, authenticated, public;
grant execute on function public.revoke_user_sessions(uuid) to service_role;

revoke execute on function public.update_staff_activity(text, text, text) from anon, authenticated, public;
grant execute on function public.update_staff_activity(text, text, text) to service_role;

-- Orphan Restaurant Hub functions (tables already dropped)
drop function if exists public.update_orders_updated_at();
drop function if exists public.update_quotes_updated_at();
drop function if exists public.get_product_image_url();
drop function if exists public.get_visitor_analytics(integer);
drop function if exists public.update_visitor_session_timestamp();
drop function if exists public.room_messages_broadcast_trigger();

notify pgrst, 'reload schema';

commit;
