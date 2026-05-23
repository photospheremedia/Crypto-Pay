-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper: global admin check
create or replace function public.is_rhs_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'rhs_admin'
  );
$$;

-- Customers (maps to tenants)
create table if not exists public.customers (
  id uuid primary key references public.tenants(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

-- Locations
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null,
  address text,
  timezone text not null default 'America/Montreal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, name)
);

create index if not exists locations_customer_idx
on public.locations (customer_id);

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

-- Integrations
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  provider text not null,
  status text not null default 'pending',
  external_id text,
  config_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, provider)
);

create index if not exists integrations_customer_idx
on public.integrations (customer_id, provider);

drop trigger if exists integrations_set_updated_at on public.integrations;
create trigger integrations_set_updated_at
before update on public.integrations
for each row execute function public.set_updated_at();

-- Products (resale catalog)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  supplier text not null default 'supplier',
  name text not null,
  category text,
  supplier_url text,
  internal_sku text not null unique,
  cost_estimate numeric,
  resale_price numeric not null,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Quotes
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  status text not null default 'draft',
  subtotal numeric not null default 0,
  shipping_estimate numeric,
  tax_estimate numeric,
  total numeric not null default 0,
  notes text,
  attachments_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_customer_idx
on public.quotes (customer_id, status);

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

-- Quote lines
create table if not exists public.quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity int not null,
  unit_price numeric not null,
  line_total numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists quote_lines_quote_idx
on public.quote_lines (quote_id);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.locations enable row level security;
alter table public.integrations enable row level security;
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_lines enable row level security;

-- Customers policies

drop policy if exists "customers_select_members" on public.customers;
create policy "customers_select_members"
on public.customers for select
using (public.is_member_of_tenant(id) or public.is_rhs_admin());


drop policy if exists "customers_insert_block" on public.customers;
create policy "customers_insert_block"
on public.customers for insert
with check (false);


drop policy if exists "customers_update_owner" on public.customers;
create policy "customers_update_owner"
on public.customers for update
using (
  public.has_tenant_role(id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
)
with check (
  public.has_tenant_role(id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);

-- Locations policies

drop policy if exists "locations_select_members" on public.locations;
create policy "locations_select_members"
on public.locations for select
using (public.is_member_of_tenant(customer_id) or public.is_rhs_admin());


drop policy if exists "locations_insert_manager" on public.locations;
create policy "locations_insert_manager"
on public.locations for insert
with check (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);


drop policy if exists "locations_update_manager" on public.locations;
create policy "locations_update_manager"
on public.locations for update
using (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
)
with check (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);


drop policy if exists "locations_delete_manager" on public.locations;
create policy "locations_delete_manager"
on public.locations for delete
using (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);

-- Integrations policies

drop policy if exists "integrations_select_members" on public.integrations;
create policy "integrations_select_members"
on public.integrations for select
using (public.is_member_of_tenant(customer_id) or public.is_rhs_admin());


drop policy if exists "integrations_insert_manager" on public.integrations;
create policy "integrations_insert_manager"
on public.integrations for insert
with check (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);


drop policy if exists "integrations_update_manager" on public.integrations;
create policy "integrations_update_manager"
on public.integrations for update
using (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
)
with check (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);


drop policy if exists "integrations_delete_manager" on public.integrations;
create policy "integrations_delete_manager"
on public.integrations for delete
using (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);

-- Products policies

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
on public.products for select
using (auth.uid() is not null);


drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin"
on public.products for insert
with check (public.is_rhs_admin());


drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
on public.products for update
using (public.is_rhs_admin())
with check (public.is_rhs_admin());


drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
on public.products for delete
using (public.is_rhs_admin());

-- Quotes policies

drop policy if exists "quotes_select_members" on public.quotes;
create policy "quotes_select_members"
on public.quotes for select
using (public.is_member_of_tenant(customer_id) or public.is_rhs_admin());


drop policy if exists "quotes_insert_manager" on public.quotes;
create policy "quotes_insert_manager"
on public.quotes for insert
with check (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);


drop policy if exists "quotes_update_manager" on public.quotes;
create policy "quotes_update_manager"
on public.quotes for update
using (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
)
with check (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);


drop policy if exists "quotes_delete_manager" on public.quotes;
create policy "quotes_delete_manager"
on public.quotes for delete
using (
  public.has_tenant_role(customer_id, array['owner','manager','rhs_admin'])
  or public.is_rhs_admin()
);

-- Quote lines policies

drop policy if exists "quote_lines_select_members" on public.quote_lines;
create policy "quote_lines_select_members"
on public.quote_lines for select
using (
  exists (
    select 1 from public.quotes q
    where q.id = quote_id
      and (public.is_member_of_tenant(q.customer_id) or public.is_rhs_admin())
  )
);


drop policy if exists "quote_lines_insert_manager" on public.quote_lines;
create policy "quote_lines_insert_manager"
on public.quote_lines for insert
with check (
  exists (
    select 1 from public.quotes q
    where q.id = quote_id
      and (
        public.has_tenant_role(q.customer_id, array['owner','manager','rhs_admin'])
        or public.is_rhs_admin()
      )
  )
);


drop policy if exists "quote_lines_update_manager" on public.quote_lines;
create policy "quote_lines_update_manager"
on public.quote_lines for update
using (
  exists (
    select 1 from public.quotes q
    where q.id = quote_id
      and (
        public.has_tenant_role(q.customer_id, array['owner','manager','rhs_admin'])
        or public.is_rhs_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.quotes q
    where q.id = quote_id
      and (
        public.has_tenant_role(q.customer_id, array['owner','manager','rhs_admin'])
        or public.is_rhs_admin()
      )
  )
);


drop policy if exists "quote_lines_delete_manager" on public.quote_lines;
create policy "quote_lines_delete_manager"
on public.quote_lines for delete
using (
  exists (
    select 1 from public.quotes q
    where q.id = quote_id
      and (
        public.has_tenant_role(q.customer_id, array['owner','manager','rhs_admin'])
        or public.is_rhs_admin()
      )
  )
);
