begin;
-- Crypto Pay schema realignment (migrated from Restaurant Hub)
-- Safe to run on existing projects: keeps legacy role checks working.

-- ---------------------------------------------------------------------------
-- Roles: rhs_admin → cp_admin (Crypto Pay platform super-admin)
-- ---------------------------------------------------------------------------
update public.memberships
set role = 'cp_admin'
where role = 'rhs_admin';

create or replace function public.is_cp_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role in ('cp_admin', 'rhs_admin')
  );
$$;

create or replace function public.is_rhs_admin()
returns boolean
language sql
stable
as $$
  select public.is_cp_admin();
$$;

grant execute on function public.is_cp_admin() to authenticated, anon;
grant execute on function public.is_rhs_admin() to authenticated, anon;

-- JWT custom claim hook
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb;
  user_role text;
begin
  select role
  into user_role
  from public.memberships
  where user_id = (event->>'user_id')::uuid
  order by
    case role
      when 'cp_admin' then 5
      when 'rhs_admin' then 5
      when 'admin' then 4
      when 'owner' then 3
      when 'manager' then 2
      when 'staff' then 1
      else -1
    end desc
  limit 1;

  claims := event->'claims';

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  else
    claims := jsonb_set(claims, '{user_role}', 'null'::jsonb);
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- ---------------------------------------------------------------------------
-- Merchant wallet profiles (Crypto Pay onboarding)
-- ---------------------------------------------------------------------------
create table if not exists public.user_wallet_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_network text not null,
  wallet_address text not null,
  wallet_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_wallet_profiles
  drop constraint if exists user_wallet_profiles_wallet_network_check;

alter table public.user_wallet_profiles
  add constraint user_wallet_profiles_wallet_network_check
  check (wallet_network in ('btc', 'eth', 'ltc', 'usdt', 'usdc'));

alter table public.user_wallet_profiles enable row level security;

drop policy if exists "Users can view own wallet profile" on public.user_wallet_profiles;
create policy "Users can view own wallet profile"
  on public.user_wallet_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own wallet profile" on public.user_wallet_profiles;
create policy "Users can insert own wallet profile"
  on public.user_wallet_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own wallet profile" on public.user_wallet_profiles;
create policy "Users can update own wallet profile"
  on public.user_wallet_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "CP admins can view all wallet profiles" on public.user_wallet_profiles;
create policy "CP admins can view all wallet profiles"
  on public.user_wallet_profiles
  for select
  to authenticated
  using (public.is_cp_admin());

drop policy if exists "CP admins can update wallet verification" on public.user_wallet_profiles;
create policy "CP admins can update wallet verification"
  on public.user_wallet_profiles
  for update
  to authenticated
  using (public.is_cp_admin())
  with check (public.is_cp_admin());

drop trigger if exists user_wallet_profiles_updated_at on public.user_wallet_profiles;
create trigger user_wallet_profiles_updated_at
  before update on public.user_wallet_profiles
  for each row execute function update_updated_at_column();

grant select, insert, update on public.user_wallet_profiles to authenticated;
grant all on public.user_wallet_profiles to service_role;
-- Named merchant wallets (multiple per user) with admin verification workflow

create table if not exists public.merchant_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  wallet_network text not null,
  wallet_address text not null,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected')),
  is_primary boolean not null default false,
  verification_requested_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, label),
  constraint merchant_wallets_wallet_network_check
    check (wallet_network in ('btc', 'eth', 'ltc', 'usdt', 'usdc'))
);

create index if not exists idx_merchant_wallets_user_id
  on public.merchant_wallets (user_id);

create index if not exists idx_merchant_wallets_status
  on public.merchant_wallets (status);

create index if not exists idx_merchant_wallets_pending
  on public.merchant_wallets (verification_requested_at desc)
  where status = 'pending';

-- Migrate legacy single wallet rows
insert into public.merchant_wallets (
  user_id,
  label,
  wallet_network,
  wallet_address,
  status,
  is_primary,
  verification_requested_at,
  verified_at,
  created_at,
  updated_at
)
select
  user_id,
  'Primary wallet',
  wallet_network,
  wallet_address,
  case when wallet_verified then 'verified' else 'pending' end,
  true,
  coalesce(updated_at, created_at),
  case when wallet_verified then updated_at else null end,
  created_at,
  updated_at
from public.user_wallet_profiles
on conflict (user_id, label) do nothing;

create or replace function public.merchant_wallet_verification_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.verification_requested_at := coalesce(new.verification_requested_at, now());
    new.verified_at := null;
    new.verified_by := null;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if not public.is_cp_admin() then
      if new.status is distinct from old.status
        and new.status in ('verified', 'rejected') then
        new.status := old.status;
      end if;

      if new.wallet_address is distinct from old.wallet_address
        or new.wallet_network is distinct from old.wallet_network
        or new.label is distinct from old.label then
        new.status := 'pending';
        new.verification_requested_at := now();
        new.verified_at := null;
        new.verified_by := null;
        new.rejection_reason := null;
      end if;
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists merchant_wallet_verification_guard on public.merchant_wallets;
create trigger merchant_wallet_verification_guard
  before insert or update on public.merchant_wallets
  for each row execute function public.merchant_wallet_verification_guard();

alter table public.merchant_wallets enable row level security;

drop policy if exists "Users view own merchant wallets" on public.merchant_wallets;
create policy "Users view own merchant wallets"
  on public.merchant_wallets for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users insert own merchant wallets" on public.merchant_wallets;
create policy "Users insert own merchant wallets"
  on public.merchant_wallets for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own merchant wallets" on public.merchant_wallets;
create policy "Users update own merchant wallets"
  on public.merchant_wallets for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete own pending merchant wallets" on public.merchant_wallets;
create policy "Users delete own pending merchant wallets"
  on public.merchant_wallets for delete
  using ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists "CP admins view all merchant wallets" on public.merchant_wallets;
create policy "CP admins view all merchant wallets"
  on public.merchant_wallets for select
  using (public.is_cp_admin());

drop policy if exists "CP admins update merchant wallet verification" on public.merchant_wallets;
create policy "CP admins update merchant wallet verification"
  on public.merchant_wallets for update
  using (public.is_cp_admin())
  with check (public.is_cp_admin());

drop trigger if exists merchant_wallets_updated_at on public.merchant_wallets;
create trigger merchant_wallets_updated_at
  before update on public.merchant_wallets
  for each row execute function update_updated_at_column();

grant select, insert, update, delete on public.merchant_wallets to authenticated;
grant all on public.merchant_wallets to service_role;

comment on table public.merchant_wallets is
  'Merchant payout wallets (named). Saves go pending until Crypto Pay admin verifies.';
-- Runner app API: machine clients + wallet linkage (idempotent external_id)

create table if not exists public.runner_api_clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  api_key text not null unique,
  api_secret text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.runner_api_clients is
  'Machine clients (settlement runner, etc.). api_secret readable only via service role / edge functions.';

alter table public.runner_api_clients enable row level security;

-- No policies: only service_role / security definer paths

alter table public.merchant_wallets
  add column if not exists source text not null default 'portal'
    check (source in ('portal', 'runner_api'));

alter table public.merchant_wallets
  add column if not exists runner_client_id uuid references public.runner_api_clients(id) on delete set null;

alter table public.merchant_wallets
  add column if not exists external_id text;

create unique index if not exists idx_merchant_wallets_runner_external
  on public.merchant_wallets (runner_client_id, external_id)
  where external_id is not null;

create index if not exists idx_merchant_wallets_runner_client
  on public.merchant_wallets (runner_client_id);

-- Audit trail for runner ↔ portal handshake
create table if not exists public.runner_api_events (
  id uuid primary key default gen_random_uuid(),
  runner_client_id uuid references public.runner_api_clients(id) on delete set null,
  event_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  merchant_wallet_id uuid references public.merchant_wallets(id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_runner_api_events_client_created
  on public.runner_api_events (runner_client_id, created_at desc);

alter table public.runner_api_events enable row level security;

drop trigger if exists runner_api_clients_updated_at on public.runner_api_clients;
create trigger runner_api_clients_updated_at
  before update on public.runner_api_clients
  for each row execute function update_updated_at_column();

grant all on public.runner_api_clients to service_role;
grant all on public.runner_api_events to service_role;

-- PostgREST (Supabase API) must see new tables
notify pgrst, 'reload schema';
-- Rename legacy Restaurant Hub admin tenant to Crypto Pay branding
update public.tenants
set
  name = 'Crypto Pay Admin',
  slug = 'crypto-pay-admin'
where slug = 'rhs-admin';

-- Marketing email sender defaults
update public.email_campaigns
set from_name = 'Crypto Pay'
where from_name ilike '%restaurant hub%';

update public.email_automations
set from_name = 'Crypto Pay'
where from_name ilike '%restaurant hub%';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'email_campaigns' and column_name = 'from_name'
  ) then
    alter table public.email_campaigns alter column from_name set default 'Crypto Pay';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'email_automations' and column_name = 'from_name'
  ) then
    alter table public.email_automations alter column from_name set default 'Crypto Pay';
  end if;
end $$;
-- Track admin reminder sends for resend cooldown (24h per wallet)
alter table public.merchant_wallets
  add column if not exists last_admin_reminder_at timestamptz;

comment on column public.merchant_wallets.last_admin_reminder_at is
  'Last time merchant triggered an admin review reminder email';
-- Prevent duplicate merchant status emails (verified/rejected) for the same verification request
alter table public.merchant_wallets
  add column if not exists merchant_status_emailed_at timestamptz,
  add column if not exists merchant_status_emailed_for_request timestamptz;

comment on column public.merchant_wallets.merchant_status_emailed_at is
  'When the merchant last received a verified/rejected status email';
comment on column public.merchant_wallets.merchant_status_emailed_for_request is
  'verification_requested_at value the last status email was sent for (one email per review cycle)';
-- Only re-open verification when payout address/network changes (not label-only edits)
create or replace function public.merchant_wallet_verification_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.verification_requested_at := coalesce(new.verification_requested_at, now());
    new.verified_at := null;
    new.verified_by := null;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if not public.is_cp_admin() then
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
$$;
-- Platform staff = memberships on crypto-pay-admin only (not merchant tenant "owner").
-- Fix JWT hook + merchant detection.

create or replace function public.platform_admin_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.tenants where slug = 'crypto-pay-admin' limit 1;
$$;

comment on function public.platform_admin_tenant_id() is
  'UUID of the Crypto Pay platform admin tenant (slug crypto-pay-admin).';

grant execute on function public.platform_admin_tenant_id() to authenticated, anon;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb;
  user_role text;
begin
  select m.role
  into user_role
  from public.memberships m
  where m.user_id = (event->>'user_id')::uuid
    and m.status = 'active'
    and m.tenant_id = public.platform_admin_tenant_id()
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
    claims := jsonb_set(claims, '{platform_realm}', '"admin"'::jsonb);
  else
    claims := jsonb_set(claims, '{user_role}', 'null'::jsonb);
    claims := jsonb_set(claims, '{platform_realm}', '"merchant"'::jsonb);
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

create or replace function public.is_staff_jwt()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'platform_realm') = 'admin', false);
$$;

create or replace function public.is_merchant_account(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.memberships m
    where m.user_id = target_user_id
      and m.status = 'active'
      and m.tenant_id = public.platform_admin_tenant_id()
      and m.role in ('cp_admin', 'rhs_admin', 'admin', 'manager', 'staff')
  );
$$;

comment on function public.is_merchant_account(uuid) is
  'True when the user has no active staff membership on the platform admin tenant.';

grant execute on function public.is_merchant_account(uuid) to authenticated, anon;

-- Staff may read/update merchant profiles only (not other staff).
drop policy if exists "Staff read merchant profiles" on public.user_profiles;
create policy "Staff read merchant profiles"
  on public.user_profiles
  for select
  to authenticated
  using (
    public.is_staff_jwt()
    and public.is_merchant_account(id)
  );

drop policy if exists "Staff update merchant profiles" on public.user_profiles;
create policy "Staff update merchant profiles"
  on public.user_profiles
  for update
  to authenticated
  using (
    public.is_staff_jwt()
    and public.is_merchant_account(id)
  )
  with check (
    public.is_merchant_account(id)
  );

-- Wallet review: all staff roles (not only cp_admin).
drop policy if exists "Staff view all merchant wallets" on public.merchant_wallets;
create policy "Staff view all merchant wallets"
  on public.merchant_wallets
  for select
  to authenticated
  using (public.is_staff_jwt());

drop policy if exists "Staff update merchant wallet verification" on public.merchant_wallets;
create policy "Staff update merchant wallet verification"
  on public.merchant_wallets
  for update
  to authenticated
  using (public.is_staff_jwt())
  with check (public.is_staff_jwt());

drop policy if exists "Staff view all wallet profiles" on public.user_wallet_profiles;
create policy "Staff view all wallet profiles"
  on public.user_wallet_profiles
  for select
  to authenticated
  using (public.is_staff_jwt());

drop policy if exists "Staff update wallet verification" on public.user_wallet_profiles;
create policy "Staff update wallet verification"
  on public.user_wallet_profiles
  for update
  to authenticated
  using (public.is_staff_jwt())
  with check (public.is_staff_jwt());
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
commit;
