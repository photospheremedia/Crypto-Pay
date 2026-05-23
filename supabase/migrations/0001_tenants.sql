-- Extensions
create extension if not exists "pgcrypto";

-- Tenants
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- Memberships
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

-- Audit log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  diff_json jsonb,
  created_at timestamptz not null default now()
);

-- Helper function: current user id
create or replace function public.current_user_id()
returns uuid
language sql stable
as $$
  select auth.uid();
$$;

-- Helper function: check membership
create or replace function public.is_member_of_tenant(check_tenant_id uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = check_tenant_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

-- Helper function: check role
create or replace function public.has_tenant_role(check_tenant_id uuid, allowed_roles text[])
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = check_tenant_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = any(allowed_roles)
  );
$$;

-- Enable RLS
alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.audit_log enable row level security;

-- Tenants policies
drop policy if exists "tenants_select_members" on public.tenants;
create policy "tenants_select_members"
on public.tenants for select
using (public.is_member_of_tenant(id));

drop policy if exists "tenants_update_owner" on public.tenants;
create policy "tenants_update_owner"
on public.tenants for update
using (public.has_tenant_role(id, array['owner','rhs_admin']))
with check (public.has_tenant_role(id, array['owner','rhs_admin']));

drop policy if exists "tenants_insert_block" on public.tenants;
create policy "tenants_insert_block"
on public.tenants for insert
with check (false);

-- Memberships policies
drop policy if exists "memberships_select_members" on public.memberships;
create policy "memberships_select_members"
on public.memberships for select
using (public.is_member_of_tenant(tenant_id));

drop policy if exists "memberships_write_owner" on public.memberships;
create policy "memberships_write_owner"
on public.memberships for insert
with check (public.has_tenant_role(tenant_id, array['owner','rhs_admin']));

drop policy if exists "memberships_update_owner" on public.memberships;
create policy "memberships_update_owner"
on public.memberships for update
using (public.has_tenant_role(tenant_id, array['owner','rhs_admin']))
with check (public.has_tenant_role(tenant_id, array['owner','rhs_admin']));

drop policy if exists "memberships_delete_block" on public.memberships;
create policy "memberships_delete_block"
on public.memberships for delete
using (false);

-- Audit log policies
drop policy if exists "audit_select_members" on public.audit_log;
create policy "audit_select_members"
on public.audit_log for select
using (tenant_id is null or public.is_member_of_tenant(tenant_id));

drop policy if exists "audit_insert_block" on public.audit_log;
create policy "audit_insert_block"
on public.audit_log for insert
with check (false);
