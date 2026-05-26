-- Single-round-trip admin dashboard metrics (service role / security definer).
-- Reduces 10+ PostgREST count requests to one DB call on free-tier Supabase.

create or replace function public.admin_dashboard_stats(p_include_super_admin boolean default false)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  today timestamptz := date_trunc('day', now() at time zone 'utc');
  staff_ids bigint;
  result jsonb;
begin
  select count(distinct m.user_id)::bigint
  into staff_ids
  from public.memberships m
  inner join public.tenants t on t.id = m.tenant_id
  where m.status = 'active'
    and t.slug = 'crypto-pay-admin'
    and m.role in ('cp_admin', 'rhs_admin', 'admin', 'manager', 'staff');

  result := jsonb_build_object(
    'totalLeads',
      (select count(*)::int from public.chat_conversations where contact_captured = true),
    'newLeadsToday',
      (select count(*)::int
       from public.chat_conversations
       where contact_captured = true
         and lead_status = 'new'
         and started_at >= today),
    'merchantAccounts',
      greatest(
        0,
        (select count(*)::int from public.user_profiles) - coalesce(staff_ids, 0)
      ),
    'walletsLinked',
      (select count(*)::int from public.user_wallet_profiles),
    'walletsVerified',
      (select count(*)::int from public.user_wallet_profiles where wallet_verified = true),
    'pendingWallets',
      (select count(*)::int from public.merchant_wallets where status = 'pending'),
    'verifiedMerchantWallets',
      (select count(*)::int from public.merchant_wallets where status = 'verified'),
    'totalMerchantWallets',
      (select count(*)::int from public.merchant_wallets),
    'recentLeads',
      coalesce(
        (
          select jsonb_agg(row_to_json(r))
          from (
            select
              id,
              guest_name,
              guest_email,
              guest_phone,
              lead_status,
              contact_captured,
              started_at,
              message_count
            from public.chat_conversations
            where contact_captured = true
            order by started_at desc
            limit 5
          ) r
        ),
        '[]'::jsonb
      )
  );

  if p_include_super_admin then
    result := result || jsonb_build_object(
      'totalUsers',
        (select count(*)::int from public.memberships where status = 'active'),
      'staffCount',
        (select count(*)::int
         from public.memberships
         where status = 'active'
           and role in ('staff', 'admin', 'owner', 'manager', 'cp_admin', 'rhs_admin')),
      'chatsToday',
        (select count(*)::int
         from public.chat_conversations
         where started_at >= today),
      'recentActivity',
        coalesce(
          (
            select jsonb_agg(row_to_json(a))
            from (
              select *
              from public.audit_log
              order by created_at desc
              limit 10
            ) a
          ),
          '[]'::jsonb
        ),
      'staffList',
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', s.id,
                'user_id', s.user_id,
                'role', s.role,
                'status', s.status,
                'created_at', s.created_at,
                'tenant_id', s.tenant_id,
                'profile', (
                  select jsonb_build_object(
                    'id', p.id,
                    'email', p.email,
                    'full_name', p.full_name,
                    'avatar_url', p.avatar_url
                  )
                  from public.user_profiles p
                  where p.id = s.user_id
                )
              )
            )
            from (
              select id, user_id, role, status, created_at, tenant_id
              from public.memberships
              where status = 'active'
                and role in ('staff', 'admin', 'owner', 'cp_admin', 'rhs_admin')
              order by created_at desc
              limit 20
            ) s
          ),
          '[]'::jsonb
        )
    );
  end if;

  return result;
end;
$$;

comment on function public.admin_dashboard_stats(boolean) is
  'Aggregated admin dashboard counters — one call for portal /api/admin/stats.';

revoke all on function public.admin_dashboard_stats(boolean) from public, anon, authenticated;
grant execute on function public.admin_dashboard_stats(boolean) to service_role;

create index if not exists idx_chat_conversations_new_leads_today
  on public.chat_conversations (started_at desc)
  where contact_captured = true and lead_status = 'new';
