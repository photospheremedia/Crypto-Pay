import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const cleanEnvValue = (value: string | undefined): string | undefined => {
  return value?.replace(/\\n$/, '').replace(/\n$/, '');
};

const SUPABASE_URL = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUser() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('Listing users...');
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total users:', data.users.length);
  const anass = data.users.find(u => u.email === 'prolivdirect@gmail.com');
  if (anass) {
    console.log('\nFound Anass:', JSON.stringify(anass, null, 2));
  } else {
    console.log('\nAnass not found in users');
  }
}

checkUser().catch(console.error);
