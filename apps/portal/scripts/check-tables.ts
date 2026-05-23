import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const cleanEnvValue = (value: string | undefined): string | undefined => {
  return value?.replace(/\\n$/, '').replace(/\n$/, '');
};

const SUPABASE_URL = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Check user_profiles
  console.log('Checking user_profiles table...');
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);
  console.log('user_profiles:', profilesError ? `Error: ${profilesError.message}` : 'OK');

  // Check user_settings
  console.log('\nChecking user_settings table...');
  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1);
  console.log('user_settings:', settingsError ? `Error: ${settingsError.message}` : 'OK');

  // Check leads
  console.log('\nChecking leads table...');
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);
  console.log('leads:', leadsError ? `Error: ${leadsError.message}` : 'OK');
}

checkTables().catch(console.error);
