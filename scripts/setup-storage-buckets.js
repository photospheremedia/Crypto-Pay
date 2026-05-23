#!/usr/bin/env node

/**
 * Storage Buckets Setup Script
 * Creates all required storage buckets via Supabase Management API
 */

const fs = require('fs');
const path = require('path');

// Load .env.local from apps/portal
const envPath = path.join(__dirname, '../apps/portal/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
    env[key] = value;
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const buckets = [
  {
    id: 'product-images',
    name: 'product-images',
    public: true,
    file_size_limit: 5242880, // 5MB
    allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  },
  {
    id: 'email-attachments',
    name: 'email-attachments',
    public: false,
    file_size_limit: 10485760, // 10MB
    allowed_mime_types: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp'
    ]
  },
  {
    id: 'import-files',
    name: 'import-files',
    public: false,
    file_size_limit: 20971520, // 20MB
    allowed_mime_types: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  {
    id: 'exports',
    name: 'exports',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'application/json'
    ]
  },
  {
    id: 'vectors',
    name: 'vectors',
    public: false,
    file_size_limit: 52428800, // 50MB (reduced from 100MB)
    allowed_mime_types: [
      'application/json',
      'application/octet-stream',
      'text/plain'
    ]
  },
  {
    id: 'analytics',
    name: 'analytics',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: [
      'application/json',
      'text/csv',
      'text/plain',
      'application/x-ndjson'
    ]
  }
];

async function createBucket(bucket) {
  const url = `${SUPABASE_URL}/storage/v1/bucket`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify(bucket)
    });

    if (response.ok) {
      console.log(`✅ Created bucket: ${bucket.id} (${bucket.public ? 'public' : 'private'})`);
      return true;
    } else {
      const error = await response.text();
      const errorObj = JSON.parse(error);
      
      if (response.status === 409 || errorObj.error === 'Duplicate') {
        console.log(`ℹ️  Bucket already exists: ${bucket.id}`);
        return true;
      } else if (response.status === 413) {
        console.error(`❌ Bucket ${bucket.id} size limit too large:`, errorObj.message);
        return false;
      } else {
        console.error(`❌ Failed to create bucket ${bucket.id}:`, errorObj.message);
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Error creating bucket ${bucket.id}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🗄️  Setting up Supabase Storage buckets...\n');

  let successCount = 0;
  for (const bucket of buckets) {
    const success = await createBucket(bucket);
    if (success) successCount++;
  }

  console.log(`\n📊 Summary: ${successCount}/${buckets.length} buckets ready\n`);
  
  if (successCount === buckets.length) {
    console.log('✅ All buckets created successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: pnpm supabase db push --linked');
    console.log('   2. This will apply RLS policies to all buckets');
    console.log('   3. Configure CORS in Supabase Dashboard if needed\n');
  } else {
    console.error('⚠️  Some buckets failed to create');
    process.exit(1);
  }
}

main();
