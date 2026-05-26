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
