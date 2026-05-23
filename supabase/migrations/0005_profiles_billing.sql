-- Customer profile (organization details)
create table if not exists public.customer_profiles (
  customer_id uuid primary key references public.customers(id) on delete cascade,
  org_type text,
  legal_name text,
  trade_name text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  phone text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists customer_profiles_set_updated_at on public.customer_profiles;
create trigger customer_profiles_set_updated_at
before update on public.customer_profiles
for each row execute function public.set_updated_at();

alter table public.customer_profiles enable row level security;

drop policy if exists "customer_profiles_select_members" on public.customer_profiles;
create policy "customer_profiles_select_members"
on public.customer_profiles for select
using (public.is_member_of_tenant(customer_id) or public.is_rhs_admin());

drop policy if exists "customer_profiles_insert_manager" on public.customer_profiles;
create policy "customer_profiles_insert_manager"
on public.customer_profiles for insert
with check (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);

drop policy if exists "customer_profiles_update_manager" on public.customer_profiles;
create policy "customer_profiles_update_manager"
on public.customer_profiles for update
using (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
)
with check (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);

-- Update supplier default to generic label (remove vendor naming)
alter table public.products
  alter column supplier set default 'supplier';

update public.products
set supplier = 'supplier'
where supplier is null or supplier <> 'supplier';

-- Billing plans (admin-managed)
create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price_cents int not null,
  interval text not null, -- month | year | one_time
  is_active boolean not null default true,
  features_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Subscriptions (one row per customer)
create table if not exists public.billing_subscriptions (
  customer_id uuid primary key references public.customers(id) on delete cascade,
  plan_id uuid references public.billing_plans(id) on delete set null,
  provider text not null default 'skrill',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists billing_subscriptions_set_updated_at on public.billing_subscriptions;
create trigger billing_subscriptions_set_updated_at
before update on public.billing_subscriptions
for each row execute function public.set_updated_at();

-- Payment methods (stored references only)
create table if not exists public.billing_payment_methods (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  provider text not null default 'skrill',
  provider_payment_method_id text not null,
  brand text,
  last4 text,
  exp_month int,
  exp_year int,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists billing_payment_methods_customer_idx
on public.billing_payment_methods (customer_id);

-- Payments (one-time + recurring)
create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions(customer_id) on delete set null,
  provider text not null default 'skrill',
  provider_payment_id text,
  type text not null, -- one_time | recurring
  status text not null, -- pending | paid | failed | refunded
  amount_cents int not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create index if not exists billing_payments_customer_idx
on public.billing_payments (customer_id, created_at desc);

-- Enable RLS
alter table public.billing_plans enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_payment_methods enable row level security;
alter table public.billing_payments enable row level security;

-- Billing plans are read-only for authenticated users
drop policy if exists "billing_plans_select_authenticated" on public.billing_plans;
create policy "billing_plans_select_authenticated"
on public.billing_plans for select
using (auth.uid() is not null);

drop policy if exists "billing_plans_write_block" on public.billing_plans;
create policy "billing_plans_write_block"
on public.billing_plans for insert
with check (false);

-- Subscriptions readable by tenant members
drop policy if exists "billing_subscriptions_select_members" on public.billing_subscriptions;
create policy "billing_subscriptions_select_members"
on public.billing_subscriptions for select
using (public.is_member_of_tenant(customer_id) or public.is_rhs_admin());

drop policy if exists "billing_subscriptions_write_block" on public.billing_subscriptions;
create policy "billing_subscriptions_write_block"
on public.billing_subscriptions for insert
with check (false);

drop policy if exists "billing_subscriptions_update_block" on public.billing_subscriptions;
create policy "billing_subscriptions_update_block"
on public.billing_subscriptions for update
using (false);

-- Payment methods readable by tenant members
drop policy if exists "billing_payment_methods_select_members" on public.billing_payment_methods;
create policy "billing_payment_methods_select_members"
on public.billing_payment_methods for select
using (public.is_member_of_tenant(customer_id) or public.is_rhs_admin());

drop policy if exists "billing_payment_methods_write_block" on public.billing_payment_methods;
create policy "billing_payment_methods_write_block"
on public.billing_payment_methods for insert
with check (false);

drop policy if exists "billing_payment_methods_update_block" on public.billing_payment_methods;
create policy "billing_payment_methods_update_block"
on public.billing_payment_methods for update
using (false);

-- Payments readable by tenant members
drop policy if exists "billing_payments_select_members" on public.billing_payments;
create policy "billing_payments_select_members"
on public.billing_payments for select
using (public.is_member_of_tenant(customer_id) or public.is_rhs_admin());

drop policy if exists "billing_payments_write_block" on public.billing_payments;
create policy "billing_payments_write_block"
on public.billing_payments for insert
with check (false);
