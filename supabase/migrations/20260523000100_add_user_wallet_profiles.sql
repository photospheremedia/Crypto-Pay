-- Wallet profiles for signed-in customer onboarding and payout configuration
create table if not exists public.user_wallet_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_network text not null check (wallet_network in ('btc')),
  wallet_address text not null,
  wallet_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists idx_user_wallet_profiles_user_id
  on public.user_wallet_profiles(user_id);

alter table public.user_wallet_profiles enable row level security;

drop policy if exists "Users can view own wallet profile" on public.user_wallet_profiles;
create policy "Users can view own wallet profile"
  on public.user_wallet_profiles
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own wallet profile" on public.user_wallet_profiles;
create policy "Users can insert own wallet profile"
  on public.user_wallet_profiles
  for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own wallet profile" on public.user_wallet_profiles;
create policy "Users can update own wallet profile"
  on public.user_wallet_profiles
  for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists user_wallet_profiles_updated_at on public.user_wallet_profiles;
create trigger user_wallet_profiles_updated_at
  before update on public.user_wallet_profiles
  for each row execute function update_updated_at_column();
