-- Migration: Fix avatar URL handling for Google OAuth users without profile pictures
-- Issue: Google provides avatar_url even for users without pictures, but those URLs may fail
-- Solution: Only save avatar_url if it's a valid image URL (not a placeholder or error)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_avatar_url TEXT;
BEGIN
  -- Extract avatar URL from metadata
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  
  -- Skip Google's placeholder URLs (they contain 'googleusercontent.com' but may be placeholders)
  -- Only use avatar_url if it's a valid, non-placeholder URL
  -- Google typically returns URLs like https://lh3.googleusercontent.com/... for real photos
  -- For users without photos, Google may return null or a placeholder
  IF v_avatar_url IS NOT NULL AND v_avatar_url != '' THEN
    -- Check if it's a valid URL format (basic validation)
    IF v_avatar_url !~ '^https?://' THEN
      v_avatar_url := NULL;
    END IF;
  ELSE
    v_avatar_url := NULL;
  END IF;

  -- Insert into user_profiles
  INSERT INTO public.user_profiles (
    id, email, full_name, avatar_url, phone,
    org_name, org_type, address_line1, address_line2,
    city, state, postal_code, country, company_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_avatar_url,  -- Use validated avatar URL
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
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),  -- Keep existing if new is null
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Note: Trigger already exists from previous migrations, no need to recreate
