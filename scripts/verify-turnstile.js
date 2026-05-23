#!/usr/bin/env node

/**
 * Verify Cloudflare Turnstile Configuration
 * Checks if Turnstile site key is properly configured
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
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

console.log('🔐 Cloudflare Turnstile Configuration Check\n');

// Check NEXT_PUBLIC_TURNSTILE_SITE_KEY
const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
console.log('1. NEXT_PUBLIC_TURNSTILE_SITE_KEY:');
if (!siteKey || siteKey.includes('PLACEHOLDER')) {
  console.log('   ❌ NOT CONFIGURED (placeholder detected)');
  console.log('   📝 Action: Get site key from Cloudflare Dashboard');
  console.log('   🔗 https://dash.cloudflare.com/?to=/:account/turnstile\n');
} else {
  console.log(`   ✅ Configured: ${siteKey.substring(0, 20)}...`);
  console.log('   🔗 Site key is publicly visible in frontend code\n');
}

// Check TURNSTILE_SECRET_KEY (should be in Supabase vault)
const secretKey = env.TURNSTILE_SECRET_KEY;
console.log('2. TURNSTILE_SECRET_KEY:');
if (!secretKey || secretKey.includes('PLACEHOLDER')) {
  console.log('   ❌ NOT CONFIGURED in .env.local');
  console.log('   ⚠️  This key should be in Supabase Edge Function secrets');
} else {
  console.log(`   ✅ Configured in .env.local: ${secretKey.substring(0, 20)}...`);
  console.log('   ⚠️  Should also be in Supabase secrets for Edge Function');
}

// Check Supabase vault status
console.log('\n3. Supabase Secrets Vault:');
console.log('   Run: supabase secrets list --project-ref xfairwgarmpvbogiuduk');
console.log('   Expected: TURNSTILE_SECRET_KEY should be listed\n');

// Check Cloudflare API credentials
console.log('4. Cloudflare API Access:');
const apiKey = env.CLOUDFLARE_API_KEY;
const accountId = env.CLOUDFLARE_ACCOUNT_ID;

if (apiKey && !apiKey.includes('PLACEHOLDER')) {
  console.log(`   ✅ API Key: ${apiKey.substring(0, 12)}...`);
} else {
  console.log('   ❌ API Key: NOT CONFIGURED');
}

if (accountId && !accountId.includes('PLACEHOLDER')) {
  console.log(`   ✅ Account ID: ${accountId}`);
} else {
  console.log('   ❌ Account ID: NOT CONFIGURED');
}

console.log('\n📋 Summary:');
console.log('   - Turnstile site key is PUBLIC (frontend needs it in .env.local)');
console.log('   - Turnstile secret key is PRIVATE (Edge Function uses it from Supabase vault)');
console.log('   - Rate limiting is handled by Edge Function (no UPSTASH vars needed in Next.js)\n');

// Test Turnstile component
console.log('🧪 Testing Turnstile Component:');
console.log('   File: apps/portal/components/auth/turnstile.tsx');

const turnstilePath = path.join(__dirname, '../apps/portal/components/auth/turnstile.tsx');
const turnstileContent = fs.readFileSync(turnstilePath, 'utf8');

if (turnstileContent.includes('NEXT_PUBLIC_TURNSTILE_SITE_KEY')) {
  console.log('   ✅ Component correctly references NEXT_PUBLIC_TURNSTILE_SITE_KEY');
  
  if (!siteKey || siteKey.includes('PLACEHOLDER')) {
    console.log('   ⚠️  WARNING: Component will skip CAPTCHA (site key not configured)');
  } else {
    console.log('   ✅ Site key is configured, CAPTCHA will be rendered');
  }
} else {
  console.log('   ❌ Component does not reference site key properly');
}

console.log('\n✅ Next Steps:');
if (!siteKey || siteKey.includes('PLACEHOLDER')) {
  console.log('   1. Visit Cloudflare Dashboard: https://dash.cloudflare.com');
  console.log('   2. Navigate to Turnstile section');
  console.log('   3. Copy the Site Key (starts with 0x...)');
  console.log('   4. Update .env.local: NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x..."');
  console.log('   5. Restart dev server: pnpm dev:portal');
} else {
  console.log('   ✅ Turnstile is fully configured!');
  console.log('   🧪 Test CAPTCHA on: http://localhost:3001/login');
}

console.log('');
