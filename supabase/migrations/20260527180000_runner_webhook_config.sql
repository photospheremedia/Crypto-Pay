-- Outbound webhooks: Crypto Pay → Runner when wallet verification status changes

alter table public.runner_api_clients
  add column if not exists webhook_url text,
  add column if not exists webhook_secret text;

comment on column public.runner_api_clients.webhook_url is
  'HTTPS endpoint on the runner app. Crypto Pay POSTs wallet.status.* events here.';

comment on column public.runner_api_clients.webhook_secret is
  'Shared secret for HMAC signing outbound webhook payloads (X-CryptoPay-Signature).';
