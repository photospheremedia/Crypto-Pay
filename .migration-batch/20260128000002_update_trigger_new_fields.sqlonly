-- Migration: Update handle_new_user trigger to capture new signup fields
-- Adds: estimated_locations, how_heard_about_us, newsletter_consent

-- Update the trigger function to handle additional fields
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Insert or update user profile with all signup data
  insert into public.user_profiles (
    id,
    full_name,
    avatar_url,
    org_name,
    org_type,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    phone,
    estimated_locations,
    how_heard_about_us,
    newsletter_consent
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'org_name',
    new.raw_user_meta_data ->> 'org_type',
    new.raw_user_meta_data ->> 'address_line1',
    new.raw_user_meta_data ->> 'address_line2',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'state',
    new.raw_user_meta_data ->> 'postal_code',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'estimated_locations',
    new.raw_user_meta_data ->> 'how_heard_about_us',
    coalesce((new.raw_user_meta_data ->> 'newsletter_consent')::boolean, true)
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.user_profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.user_profiles.avatar_url),
    org_name = coalesce(excluded.org_name, public.user_profiles.org_name),
    org_type = coalesce(excluded.org_type, public.user_profiles.org_type),
    address_line1 = coalesce(excluded.address_line1, public.user_profiles.address_line1),
    address_line2 = coalesce(excluded.address_line2, public.user_profiles.address_line2),
    city = coalesce(excluded.city, public.user_profiles.city),
    state = coalesce(excluded.state, public.user_profiles.state),
    postal_code = coalesce(excluded.postal_code, public.user_profiles.postal_code),
    country = coalesce(excluded.country, public.user_profiles.country),
    phone = coalesce(excluded.phone, public.user_profiles.phone),
    estimated_locations = coalesce(excluded.estimated_locations, public.user_profiles.estimated_locations),
    how_heard_about_us = coalesce(excluded.how_heard_about_us, public.user_profiles.how_heard_about_us),
    newsletter_consent = coalesce(excluded.newsletter_consent, public.user_profiles.newsletter_consent),
    updated_at = now();
  
  -- Also create a lead record for marketing/sales tracking
  insert into public.leads (
    email,
    org_name,
    org_type,
    phone,
    city,
    state,
    country,
    estimated_locations,
    how_heard_about_us,
    newsletter_consent,
    source,
    user_id
  )
  values (
    new.email,
    new.raw_user_meta_data ->> 'org_name',
    new.raw_user_meta_data ->> 'org_type',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'state',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'estimated_locations',
    new.raw_user_meta_data ->> 'how_heard_about_us',
    coalesce((new.raw_user_meta_data ->> 'newsletter_consent')::boolean, true),
    'signup',
    new.id
  )
  on conflict (email) do update set
    user_id = excluded.user_id,
    org_name = coalesce(excluded.org_name, public.leads.org_name),
    org_type = coalesce(excluded.org_type, public.leads.org_type),
    phone = coalesce(excluded.phone, public.leads.phone),
    city = coalesce(excluded.city, public.leads.city),
    state = coalesce(excluded.state, public.leads.state),
    country = coalesce(excluded.country, public.leads.country),
    estimated_locations = coalesce(excluded.estimated_locations, public.leads.estimated_locations),
    how_heard_about_us = coalesce(excluded.how_heard_about_us, public.leads.how_heard_about_us),
    newsletter_consent = coalesce(excluded.newsletter_consent, public.leads.newsletter_consent),
    status = 'converted',
    converted_at = now(),
    updated_at = now();
  
  -- If user opted into newsletter, add them to newsletter subscribers
  if coalesce((new.raw_user_meta_data ->> 'newsletter_consent')::boolean, true) = true then
    insert into public.newsletter_subscribers (email, status, source, list_type)
    values (new.email, 'active', 'signup', 'weekly_ops_brief')
    on conflict (email) do update set
      status = 'active',
      resubscribed_at = case 
        when public.newsletter_subscribers.status = 'unsubscribed' then now() 
        else public.newsletter_subscribers.resubscribed_at 
      end,
      updated_at = now();
  end if;
  
  return new;
end;
$$;
