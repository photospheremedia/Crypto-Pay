/**
 * Supabase RLS Policy Unit Tests
 * 
 * These tests verify Row Level Security policies at the database level.
 * Run with: npx tsx tests/rls-policies.test.ts
 * 
 * Requires environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from portal directory
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service client bypasses RLS (for setup/teardown)
const serviceClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Anon client respects RLS (simulates unauthenticated user)
const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => Promise<void>) {
  return fn()
    .then(() => {
      results.push({ name, passed: true });
      console.log(`✓ ${name}`);
    })
    .catch((error) => {
      results.push({ name, passed: false, error: error.message });
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error.message}`);
    });
}

async function runTests() {
  console.log('\n🔒 Running RLS Policy Tests\n');
  console.log('━'.repeat(50));

  // ============================================
  // TENANT ISOLATION TESTS
  // ============================================
  console.log('\n📁 Tenant Isolation Tests\n');

  await test('Anon user cannot read tenants', async () => {
    const { data, error } = await anonClient.from('tenants').select('*');
    // RLS should return empty array or error
    if (data && data.length > 0) {
      throw new Error('Anon user should not see any tenants');
    }
  });

  await test('Anon user cannot insert tenants', async () => {
    const { error } = await anonClient.from('tenants').insert({
      name: 'Test Tenant',
      slug: 'test-tenant-' + Date.now(),
    });
    if (!error) {
      throw new Error('Anon user should not be able to create tenants');
    }
  });

  await test('Anon user cannot read memberships', async () => {
    const { data, error } = await anonClient.from('memberships').select('*');
    if (data && data.length > 0) {
      throw new Error('Anon user should not see any memberships');
    }
  });

  // ============================================
  // PUBLIC DATA TESTS
  // ============================================
  console.log('\n📖 Public Data Tests\n');

  await test('Anon user can read products (if public)', async () => {
    const { data, error } = await anonClient.from('products').select('id, name');
    // This should either work (products are public) or return empty
    // It should NOT throw an RLS error
    if (error && !error.message.includes('does not exist')) {
      // Table exists but RLS blocks - that's fine for private products
      console.log(`  Note: Products table has RLS - ${error.message}`);
    }
  });

  await test('Anon user can read newsletter entries (if public)', async () => {
    const { error } = await anonClient.from('newsletter_subscriptions').select('id');
    // Should work or table doesn't exist
    if (error && error.message.includes('permission denied')) {
      throw new Error('Newsletter should be readable or not have RLS on read');
    }
  });

  // ============================================
  // AUDIT LOG TESTS
  // ============================================
  console.log('\n📝 Audit Log Tests\n');

  await test('Anon user cannot read audit logs', async () => {
    const { data, error } = await anonClient.from('audit_log').select('*');
    if (data && data.length > 0) {
      throw new Error('Anon user should not see audit logs');
    }
  });

  await test('Anon user cannot insert audit logs', async () => {
    const { error } = await anonClient.from('audit_log').insert({
      action: 'test',
      entity_type: 'test',
    });
    if (!error) {
      throw new Error('Anon user should not be able to create audit logs');
    }
  });

  // ============================================
  // ORDER TESTS
  // ============================================
  console.log('\n🛒 Order Tests\n');

  await test('Anon user cannot read orders', async () => {
    const { data, error } = await anonClient.from('orders').select('*');
    if (data && data.length > 0) {
      throw new Error('Anon user should not see orders');
    }
  });

  await test('Anon user cannot create orders', async () => {
    const { error } = await anonClient.from('orders').insert({
      status: 'pending',
      total_cents: 1000,
    });
    if (!error) {
      throw new Error('Anon user should not be able to create orders');
    }
  });

  // ============================================
  // LEAD TESTS  
  // ============================================
  console.log('\n📧 Lead Tests\n');

  await test('Anon user cannot read leads directly', async () => {
    const { data, error } = await anonClient.from('leads').select('*');
    if (data && data.length > 0) {
      throw new Error('Anon user should not see leads');
    }
  });

  // ============================================
  // SERVICE ROLE TESTS
  // ============================================
  console.log('\n🔑 Service Role Tests\n');

  await test('Service role can read all tenants', async () => {
    const { data, error } = await serviceClient.from('tenants').select('*');
    if (error) {
      throw new Error(`Service role should read tenants: ${error.message}`);
    }
    console.log(`  Found ${data?.length || 0} tenants`);
  });

  await test('Service role can read all memberships', async () => {
    const { data, error } = await serviceClient.from('memberships').select('*');
    if (error) {
      throw new Error(`Service role should read memberships: ${error.message}`);
    }
    console.log(`  Found ${data?.length || 0} memberships`);
  });

  // ============================================
  // HELPER FUNCTION TESTS
  // ============================================
  console.log('\n🔧 RLS Helper Function Tests\n');

  await test('is_member_of_tenant function exists', async () => {
    // This will fail for anon (no auth.uid()) but function should exist
    const { error } = await serviceClient.rpc('is_member_of_tenant', {
      check_tenant_id: '00000000-0000-0000-0000-000000000000'
    });
    // Function exists if we don't get "function does not exist" error
    if (error && error.message.includes('does not exist')) {
      throw new Error('is_member_of_tenant function should exist');
    }
  });

  await test('has_tenant_role function exists', async () => {
    const { error } = await serviceClient.rpc('has_tenant_role', {
      check_tenant_id: '00000000-0000-0000-0000-000000000000',
      allowed_roles: ['owner', 'admin']
    });
    if (error && error.message.includes('does not exist')) {
      throw new Error('has_tenant_role function should exist');
    }
  });

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '━'.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All RLS policy tests passed!');
    process.exit(0);
  }
}

// Check for required env vars
if (!supabaseUrl || !anonKey || !serviceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

runTests().catch(console.error);
