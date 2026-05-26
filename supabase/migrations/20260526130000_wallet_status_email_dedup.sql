-- Prevent duplicate merchant status emails (verified/rejected) for the same verification request
alter table public.merchant_wallets
  add column if not exists merchant_status_emailed_at timestamptz,
  add column if not exists merchant_status_emailed_for_request timestamptz;

comment on column public.merchant_wallets.merchant_status_emailed_at is
  'When the merchant last received a verified/rejected status email';
comment on column public.merchant_wallets.merchant_status_emailed_for_request is
  'verification_requested_at value the last status email was sent for (one email per review cycle)';
