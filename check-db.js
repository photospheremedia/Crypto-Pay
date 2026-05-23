const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');
  
  const tables = [
    'user_profiles',
    'user_settings',
    'organizations',
    'organization_members',
    'locations',
    'orders',
    'order_items',
    'quotes',
    'delivery_integrations',
    'support_tickets',
    'support_ticket_messages',
    'activity_log'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: Not found or error - ${error.message}`);
      } else {
        console.log(`✅ ${table}: Exists`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }
  
  console.log('\n📊 Database check complete!');
  console.log('\nNext steps:');
  console.log('1. Visit: http://localhost:3000');
  console.log('2. Sign in or create an account');
  console.log('3. Go to: http://localhost:3000/account/settings');
  console.log('4. Update your profile and settings\n');
}

checkTables();
