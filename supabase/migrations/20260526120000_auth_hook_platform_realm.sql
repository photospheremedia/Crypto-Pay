-- Align JWT custom claims with platform realms (admin GUI vs merchant account).
-- Supabase best practice: encode role/realm in the access token via Auth Hook,
-- then enforce data access with RLS (auth.jwt() ->> 'user_role').

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
    and m.role in ('cp_admin', 'rhs_admin', 'admin', 'owner', 'manager', 'staff')
  order by
    case m.role
      when 'cp_admin' then 5
      when 'rhs_admin' then 5
      when 'admin' then 4
      when 'owner' then 3
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

comment on function public.custom_access_token_hook(jsonb) is
  'Injects user_role and platform_realm (admin|merchant) into JWT for RLS and app routing.';

-- Staff check from JWT (for RLS policies); complements membership-based is_cp_admin().
create or replace function public.is_staff_jwt()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'platform_realm') = 'admin'
    or (auth.jwt() ->> 'user_role') in (
      'cp_admin', 'rhs_admin', 'admin', 'owner', 'manager', 'staff'
    ),
    false
  );
$$;

grant execute on function public.is_staff_jwt() to authenticated, anon;
