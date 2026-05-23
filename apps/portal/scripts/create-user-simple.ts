import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const cleanEnvValue = (value: string | undefined): string | undefined => {
  return value?.replace(/\\n$/, '').replace(/\n$/, '');
};

const SUPABASE_URL = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createUserSimple() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('Creating user with minimal options...');
  
  // Try creating with minimal options first
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'prolivdirect@gmail.com',
    password: 'Welcome2RHS!24',
    email_confirm: true,
  });

  if (error) {
    console.error('Create user error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Try to get more info
    const { data: logs } = await supabase
      .from('auth.audit_log_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logs) {
      console.log('\nRecent audit logs:', JSON.stringify(logs, null, 2));
    }
    return;
  }

  console.log('User created successfully:', data.user?.id);
}

createUserSimple().catch(console.error);
