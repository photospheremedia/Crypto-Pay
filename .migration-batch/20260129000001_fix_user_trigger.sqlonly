-- Migration: Fix handle_new_user trigger for admin user creation
-- This migration makes the trigger more resilient to foreign key timing issues

-- Option 1: Make user_settings insertion deferred or use exception handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles (this should work as id is the same as auth.users.id)
  INSERT INTO public.user_profiles (
    id, email, full_name, avatar_url, phone,
    org_name, org_type, address_line1, address_line2,
    city, state, postal_code, country, company_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'org_name',
    NEW.raw_user_meta_data->>'org_type',
    NEW.raw_user_meta_data->>'address_line1',
    NEW.raw_user_meta_data->>'address_line2',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'postal_code',
    COALESCE(NEW.raw_user_meta_data->>'country', 'US'),
    NEW.raw_user_meta_data->>'org_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    org_name = EXCLUDED.org_name,
    org_type = EXCLUDED.org_type,
    address_line1 = EXCLUDED.address_line1,
    address_line2 = EXCLUDED.address_line2,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    postal_code = EXCLUDED.postal_code,
    country = EXCLUDED.country,
    updated_at = NOW();
  
  -- Create user settings - wrap in exception handler in case FK constraint fails
  BEGIN
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN foreign_key_violation THEN
    -- FK violation means auth.users row isn't visible yet, 
    -- settings will be created when user first logs in
    NULL;
  END;
  
  -- Create lead record - also wrap in exception handler
  BEGIN
    INSERT INTO public.leads (
      user_id, email, phone, full_name, org_name, org_type,
      address_line1, address_line2, city, state, postal_code, country,
      status, source
    )
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.raw_user_meta_data->>'org_name',
      NEW.raw_user_meta_data->>'org_type',
      NEW.raw_user_meta_data->>'address_line1',
      NEW.raw_user_meta_data->>'address_line2',
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'state',
      NEW.raw_user_meta_data->>'postal_code',
      COALESCE(NEW.raw_user_meta_data->>'country', 'US'),
      'converted',
      CASE 
        WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
        ELSE 'website'
      END
    );
  EXCEPTION WHEN foreign_key_violation OR unique_violation THEN
    -- Ignore FK or unique constraint violations for leads
    NULL;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
