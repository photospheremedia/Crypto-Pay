-- Sidebar badge counts in one DB round trip (service role only).

create or replace function public.admin_nav_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'pendingWallets',
      (select count(*)::int from public.merchant_wallets where status = 'pending'),
    'newLeads',
      (select count(*)::int
       from public.chat_conversations
       where contact_captured = true
         and lead_status = 'new'
         and started_at >= date_trunc('day', now() at time zone 'utc'))
  );
$$;

comment on function public.admin_nav_counts() is
  'Admin sidebar badges — pending wallets + new leads today.';

revoke all on function public.admin_nav_counts() from public, anon, authenticated;
grant execute on function public.admin_nav_counts() to service_role;
