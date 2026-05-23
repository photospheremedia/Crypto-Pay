import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const cleanEnvValue = (value: string | undefined): string | undefined => {
  return value?.replace(/\\n$/, '').replace(/\n$/, '');
};

const SUPABASE_URL = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixTrigger() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('Updating handle_new_user trigger function...');

  const sql = `
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
`;

  const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
  
  if (error) {
    console.error('Error updating trigger via RPC:', error);
    console.log('\nNote: You may need to run this SQL directly in the Supabase SQL editor.');
    console.log('Copy the SQL from: supabase/migrations/20260129000001_fix_user_trigger.sql');
  } else {
    console.log('Trigger function updated successfully!');
  }
}

fixTrigger().catch(console.error);
