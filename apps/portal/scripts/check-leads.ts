import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const cleanEnvValue = (value: string | undefined): string | undefined => {
  return value?.replace(/\\n$/, '').replace(/\n$/, '');
};

const SUPABASE_URL = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLeads() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Check if there's already a lead with this email
  console.log('Checking for existing lead with prolivdirect@gmail.com...');
  const { data: existingLead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('email', 'prolivdirect@gmail.com')
    .single();

  if (existingLead) {
    console.log('Found existing lead:', existingLead);
  } else {
    console.log('No existing lead found');
    console.log('Lead error:', leadError?.message);
  }

  // Check all leads
  console.log('\nAll leads:');
  const { data: allLeads } = await supabase
    .from('leads')
    .select('id, email, status')
    .limit(10);
  
  console.log(allLeads);

  // Check user_settings table structure
  console.log('\nChecking user_settings table...');
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1);
  
  if (settings && settings.length > 0) {
    console.log('user_settings columns:', Object.keys(settings[0]));
  } else {
    console.log('user_settings is empty, trying to see structure...');
    // Try inserting with a test UUID
    const testId = '00000000-0000-0000-0000-000000000001';
    const { error: insertError } = await supabase
      .from('user_settings')
      .insert({ user_id: testId });
    
    console.log('Insert test error:', insertError?.message || 'Success');
    
    // Clean up
    await supabase.from('user_settings').delete().eq('user_id', testId);
  }
}

checkLeads().catch(console.error);
