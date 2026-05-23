-- Enforce BTC-only wallet network for current product phase.
alter table public.user_wallet_profiles
  drop constraint if exists user_wallet_profiles_wallet_network_check;

alter table public.user_wallet_profiles
  add constraint user_wallet_profiles_wallet_network_check
  check (wallet_network in ('btc'));
