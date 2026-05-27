-- Track admin reminder sends for resend cooldown (24h per wallet)
alter table public.merchant_wallets
  add column if not exists last_admin_reminder_at timestamptz;

comment on column public.merchant_wallets.last_admin_reminder_at is
  'Last time merchant triggered an admin review reminder email';
