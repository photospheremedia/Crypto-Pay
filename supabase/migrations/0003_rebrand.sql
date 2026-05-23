-- Rebrand admin role helpers (Restaurant Hub Solution)
create or replace function public.is_rhs_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = 'rhs_admin'
  );
$$;

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
