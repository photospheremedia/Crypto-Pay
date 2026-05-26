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
