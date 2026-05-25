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

-- ---------------------------------------------------------------------------
-- Deprecation notes (Restaurant Hub tables retained for data safety)
-- ---------------------------------------------------------------------------
comment on table public.products is 'DEPRECATED (Restaurant Hub). Not used by Crypto Pay.';
comment on table public.orders is 'DEPRECATED (Restaurant Hub shop). Not used by Crypto Pay.';
comment on table public.quotes is 'DEPRECATED (Restaurant Hub supplies). Not used by Crypto Pay.';
comment on table public.customers is 'DEPRECATED (Restaurant Hub tenant alias). Crypto Pay uses user_profiles + memberships.';
comment on table public.integrations is 'DEPRECATED (Restaurant Hub delivery/POS). Not used by Crypto Pay.';
