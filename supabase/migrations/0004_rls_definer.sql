-- Prevent RLS recursion on memberships by using SECURITY DEFINER helpers
create or replace function public.is_member_of_tenant(check_tenant_id uuid)
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
  );
$$;

alter function public.is_member_of_tenant(uuid) set row_security = off;
grant execute on function public.is_member_of_tenant(uuid) to authenticated, anon;

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
