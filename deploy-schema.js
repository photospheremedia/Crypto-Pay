const fs = require('fs');
const https = require('https');

// Read environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Read the schema file
const schema = fs.readFileSync('database-schema-supabase.sql', 'utf8');

// Split into individual statements (simple approach)
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))
  .map(s => s + ';');

console.log(`📦 Found ${statements.length} SQL statements to execute`);

// Function to execute SQL via Supabase REST API
async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Execute statements sequentially
async function deploy() {
  console.log('🚀 Starting database deployment...\n');
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');
    
    try {
      process.stdout.write(`[${i + 1}/${statements.length}] Executing: ${preview}... `);
      
      // For CREATE statements with IF NOT EXISTS, we can ignore "already exists" errors
      const isCreateIfNotExists = statement.includes('IF NOT EXISTS');
      
      try {
        await executeSQL(statement);
        process.stdout.write('✅\n');
        successCount++;
      } catch (err) {
        if (isCreateIfNotExists && err.message.includes('already exists')) {
          process.stdout.write('⏭️  (already exists)\n');
          skipCount++;
        } else {
          throw err;
        }
      }
    } catch (error) {
      process.stdout.write(`❌ ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Deployment Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(50));
  
  if (errorCount === 0) {
    console.log('\n🎉 Database schema deployed successfully!');
  } else {
    console.log('\n⚠️  Deployment completed with errors. Check logs above.');
  }
}

deploy().catch(console.error);
