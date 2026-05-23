-- Clean up legacy role names
update public.memberships
set role = 'rhs_admin'
where role not in ('owner', 'manager', 'staff', 'rhs_admin');

-- Normalize admin helper (security definer)
create or replace function public.is_rhs_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'rhs_admin'
  );
$$;

alter function public.is_rhs_admin() set row_security = off;
grant execute on function public.is_rhs_admin() to authenticated, anon;

-- Normalize role checks (security definer)
create or replace function public.has_tenant_role(check_tenant_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = check_tenant_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = any(allowed_roles)
  );
$$;

alter function public.has_tenant_role(uuid, text[]) set row_security = off;
grant execute on function public.has_tenant_role(uuid, text[]) to authenticated, anon;
