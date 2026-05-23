-- Auth Hook for Custom Claims
-- This hook adds the user_role claim to JWT tokens for all sign-in methods
-- Works with: Email/password, OAuth, Magic links, Phone OTP, etc.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role text;
begin
  -- Fetch the user's role from memberships table
  -- Get the highest role if user belongs to multiple tenants
  select role
  into user_role
  from public.memberships
  where user_id = (event->>'user_id')::uuid
  order by 
    case role
      when 'rhs_admin' then 4
      when 'admin' then 3
      when 'owner' then 2
      when 'manager' then 1
      when 'staff' then 0
      else -1
    end desc
  limit 1;

  -- Get the claims object
  claims := event->'claims';

  -- Add the user_role claim (null if no role found)
  if user_role is not null then
    claims := jsonb_set(claims, '{"user_role"}', to_jsonb(user_role));
  else
    claims := jsonb_set(claims, '{"user_role"}', 'null'::jsonb);
  end if;

  -- Update the claims in the event
  event := jsonb_set(event, '{"claims"}', claims);

  return event;
end;
$$;

-- Grant necessary permissions for the auth hook
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- Grant read access to memberships for auth admin
grant select on table public.memberships to supabase_auth_admin;

-- Create RLS policy for auth admin to read memberships
create policy "Allow auth admin to read memberships"
on public.memberships
as permissive
for select
to supabase_auth_admin
using (true);
