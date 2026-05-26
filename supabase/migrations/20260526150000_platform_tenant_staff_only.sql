-- Platform staff = memberships on crypto-pay-admin only (not merchant tenant "owner").
-- Remove mistaken platform admin membership; fix JWT hook + merchant detection.

create or replace function public.platform_admin_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.tenants where slug = 'crypto-pay-admin' limit 1;
$$;

comment on function public.platform_admin_tenant_id() is
  'UUID of the Crypto Pay platform admin tenant (slug crypto-pay-admin).';

grant execute on function public.platform_admin_tenant_id() to authenticated, anon;

-- demo merchant is a merchant only — not platform staff.
delete from public.memberships m
using public.tenants t, auth.users u
where m.tenant_id = t.id
  and m.user_id = u.id
  and t.slug = 'crypto-pay-admin'
  and lower(u.email) = 'merchant@example.com';

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb;
  user_role text;
begin
  select m.role
  into user_role
  from public.memberships m
  where m.user_id = (event->>'user_id')::uuid
    and m.status = 'active'
    and m.tenant_id = public.platform_admin_tenant_id()
    and m.role in ('cp_admin', 'rhs_admin', 'admin', 'manager', 'staff')
  order by
    case m.role
      when 'cp_admin' then 5
      when 'rhs_admin' then 5
      when 'admin' then 4
      when 'manager' then 2
      when 'staff' then 1
      else -1
    end desc
  limit 1;

  claims := event->'claims';

  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{platform_realm}', '"admin"'::jsonb);
  else
    claims := jsonb_set(claims, '{user_role}', 'null'::jsonb);
    claims := jsonb_set(claims, '{platform_realm}', '"merchant"'::jsonb);
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

create or replace function public.is_staff_jwt()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'platform_realm') = 'admin', false);
$$;

create or replace function public.is_merchant_account(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.memberships m
    where m.user_id = target_user_id
      and m.status = 'active'
      and m.tenant_id = public.platform_admin_tenant_id()
      and m.role in ('cp_admin', 'rhs_admin', 'admin', 'manager', 'staff')
  );
$$;

comment on function public.is_merchant_account(uuid) is
  'True when the user has no active staff membership on the platform admin tenant.';
