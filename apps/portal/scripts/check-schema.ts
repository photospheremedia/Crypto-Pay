import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const cleanEnvValue = (value: string | undefined): string | undefined => {
  return value?.replace(/\\n$/, '').replace(/\n$/, '');
};

const SUPABASE_URL = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTableSchema() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Check user_profiles columns
  console.log('Checking user_profiles schema...');
  const { data: profileCols, error: profileError } = await supabase.rpc('get_table_columns', {
    table_name: 'user_profiles'
  });
  
  if (profileError) {
    // Try direct query
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(0);
    
    console.log('user_profiles select error:', error?.message || 'None');
    
    // Get column info from existing row
    const { data: row } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
      .single();
    
    if (row) {
      console.log('user_profiles columns:', Object.keys(row));
    }
  } else {
    console.log('Profile columns:', profileCols);
  }

  // Check leads columns
  console.log('\nChecking leads schema...');
  const { data: leadRow } = await supabase
    .from('leads')
    .select('*')
    .limit(1)
    .single();
  
  if (leadRow) {
    console.log('leads columns:', Object.keys(leadRow));
  } else {
    // Try to see the schema
    const { error: insertError } = await supabase
      .from('leads')
      .insert({ email: 'test@test.com' })
      .select()
      .single();
    console.log('leads insert test error:', insertError?.message || 'None');
  }

  // Check user_settings columns
  console.log('\nChecking user_settings schema...');
  const { data: settingsRow } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1)
    .single();
  
  if (settingsRow) {
    console.log('user_settings columns:', Object.keys(settingsRow));
  }
}

checkTableSchema().catch(console.error);
