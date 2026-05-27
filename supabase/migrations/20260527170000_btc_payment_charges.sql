-- BTC payment charges (Blockonomics receiving-payments flow)
-- Checkout → WebSocket detect (UI) → HTTP callback (source of truth)

create table if not exists public.crypto_payment_charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text,
  fiat_amount numeric(18, 2) not null check (fiat_amount > 0),
  fiat_currency text not null default 'USD',
  crypto text not null default 'BTC' check (crypto in ('BTC', 'USDT')),
  crypto_amount numeric(24, 8) not null,
  btc_address text not null,
  provider_account text,
  status text not null default 'pending'
    check (status in ('pending', 'detected', 'confirming', 'confirmed', 'failed')),
  provider_status smallint,
  value_satoshi bigint,
  txid text,
  rbf smallint,
  price_locked_until timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crypto_payment_charges_user_created
  on public.crypto_payment_charges (user_id, created_at desc);

create index if not exists idx_crypto_payment_charges_address
  on public.crypto_payment_charges (btc_address);

create unique index if not exists idx_crypto_payment_charges_callback_dedupe
  on public.crypto_payment_charges (btc_address, txid, provider_status)
  where txid is not null and provider_status is not null;

alter table public.crypto_payment_charges enable row level security;

drop policy if exists "Users can view own payment charges" on public.crypto_payment_charges;
create policy "Users can view own payment charges"
  on public.crypto_payment_charges
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own payment charges" on public.crypto_payment_charges;
create policy "Users can insert own payment charges"
  on public.crypto_payment_charges
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "CP admins can view all payment charges" on public.crypto_payment_charges;
create policy "CP admins can view all payment charges"
  on public.crypto_payment_charges
  for select
  to authenticated
  using (public.is_cp_admin());

drop trigger if exists crypto_payment_charges_updated_at on public.crypto_payment_charges;
create trigger crypto_payment_charges_updated_at
  before update on public.crypto_payment_charges
  for each row execute function update_updated_at_column();

grant select, insert on public.crypto_payment_charges to authenticated;
grant all on public.crypto_payment_charges to service_role;
