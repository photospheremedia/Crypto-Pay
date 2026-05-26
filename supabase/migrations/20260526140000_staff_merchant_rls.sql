-- Separate merchant accounts from staff in RLS; allow all staff JWT roles to review wallets.

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
      and m.role in (
        'cp_admin', 'rhs_admin', 'admin', 'owner', 'manager', 'staff'
      )
  );
$$;

comment on function public.is_merchant_account(uuid) is
  'True when the user has no active platform staff membership (merchant self-serve account).';

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
