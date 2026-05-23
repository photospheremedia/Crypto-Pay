# Supabase Production Verification Checklist

**Project:** crypto-pay  
**Supabase Project ID:** xfairwgarmpvbogiuduk  
**Region:** us-east-1

## ✅ Completed Implementation

### 1. Database Security (Migration: 20260201083910)
- ✅ Row Level Security (RLS) policies with session_id validation
- ✅ Database indexes for performance
- ✅ pg_cron job for session cleanup (runs hourly)
- ✅ Audit logging tables
- ✅ Secure session management

### 2. Rate Limiting & CAPTCHA
- ✅ Multi-tier rate limiting (5 levels)
- ✅ Cloudflare Turnstile CAPTCHA integration
- ✅ Upstash Redis for distributed limits
- ✅ Per-route rate limits (login, signup, password reset, etc.)

### 3. Avatar Upload (Migration: 20260201090057)
- ✅ Supabase Storage bucket: `avatars`
- ✅ RLS policies for upload/update/delete
- ✅ Auto-sync with user_profiles.avatar_url
- ✅ Automatic cleanup of old avatars
- ✅ 5MB size limit, image types only
- ✅ UI component integrated in profile page

### 4. Two-Factor Authentication (2FA/TOTP)
- ✅ Supabase native MFA integration
- ✅ QR code generation for authenticator apps
- ✅ Support for Google Authenticator, Authy, 1Password
- ✅ List and remove MFA factors
- ✅ Setup dialog with multi-step flow
- ✅ UI integrated in security page

---

## 🔍 Manual Verification Required

### Dashboard Checks (5 minutes)

#### 1. Multi-Factor Authentication
**URL:** https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/settings/auth

**Steps:**
1. Navigate to Authentication → Multi-Factor Authentication
2. Confirm "Enable Multi-Factor Authentication" is **ON** (should be enabled by default)
3. If disabled, toggle the switch to enable

**Expected:** MFA should be enabled for your project

---

#### 2. Storage Buckets
**URL:** https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/storage/buckets

**Steps:**
1. Navigate to Storage → Buckets
2. Confirm `avatars` bucket exists
3. Click on `avatars` bucket → Configuration
4. Verify settings:
   - Public bucket: **Yes**
   - File size limit: **5242880 bytes (5MB)**
   - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif

**Expected:** `avatars` bucket with public access and 5MB limit

**If Missing:**
```bash
# Re-apply storage migration
cd /Users/Wael/Projects/crypto-pay
supabase db push
```

---

#### 3. Database Migrations
**URL:** https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/database/migrations

**Steps:**
1. Navigate to Database → Migrations
2. Confirm these migrations are applied:
   - `20260201083910_security_enhancements_production_ready` 
   - `20260201090057_storage_buckets_setup`

**Expected:** Both migrations show as "Applied"

---

#### 4. pg_cron Job (Optional Check)
**URL:** https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/database/extensions

**Steps:**
1. Navigate to Database → Extensions
2. Search for "pg_cron"
3. Confirm it's **Enabled**
4. Go to SQL Editor and run:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-sessions';
   ```
5. Verify job exists and runs every hour

**Expected:** pg_cron enabled with hourly session cleanup job

---

## 🔧 Environment Configuration Still Needed

### 1. Cloudflare Turnstile Site Key
**Current Status:** Placeholder value in `.env.local`

**Steps:**
1. Go to https://dash.cloudflare.com/
2. Navigate to Turnstile (left sidebar)
3. Click "Add site"
4. Configure:
   - **Site name:** Restaurant Hub Solution
   - **Domain:** 
     - `localhost` (for development)
     - `restauranthubsolution.com` (for production)
   - **Widget mode:** Managed (Recommended)
5. Click "Add site"
6. Copy the **Site Key** (starts with `0x4AAAA...`)
7. Update `.env.local`:
   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA... # Replace with your key
   ```

**Docs:** See `docs/NEXT_STEPS.md` section 1

---

### 2. Upstash Redis REST URL
**Current Status:** Placeholder value in `.env.local`

**Steps:**
1. Go to https://console.upstash.com/
2. Sign up/login (free tier available)
3. Click "Create Database"
4. Configure:
   - **Name:** restaurant-hub-ratelimit
   - **Type:** Regional
   - **Region:** us-east-1 (same as Supabase)
   - **Primary region only:** Yes
5. Click "Create"
6. Copy **REST URL** (starts with `https://...upstash.io`)
7. Copy **REST Token**
8. Update `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL=https://... # Replace with your URL
   UPSTASH_REDIS_REST_TOKEN=A... # Replace with your token
   ```

**Docs:** See `docs/NEXT_STEPS.md` section 2

---

### 3. SendGrid SMTP Configuration
**Current Status:** API key in `.env.local`, needs Dashboard config

**Steps:**
1. Go to https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/settings/auth
2. Scroll to "SMTP Settings"
3. Toggle "Enable Custom SMTP"
4. Configure:
   - **Host:** smtp.sendgrid.net
   - **Port:** 587
   - **Username:** apikey
   - **Password:** (paste your SendGrid API key from `.env.local`)
   - **Sender email:** (e.g., noreply@restauranthubsolution.com)
   - **Sender name:** Restaurant Hub Solution
5. Click "Save"
6. Test by clicking "Send Test Email"

**Docs:** See `docs/NEXT_STEPS.md` section 3

---

## 🧪 Testing Checklist

### Avatar Upload Test
**URL:** http://localhost:3000/account/profile

**Steps:**
1. Start dev server: `pnpm dev:portal`
2. Sign in to your account
3. Navigate to Account → Profile
4. Click "Upload Avatar"
5. Select an image (< 5MB, JPG/PNG/WebP/GIF)
6. Verify preview shows before upload
7. Click "Upload"
8. Verify avatar appears
9. Click "Remove Avatar"
10. Verify avatar is deleted

**Expected:** Upload, preview, and delete work without errors

---

### 2FA Enrollment Test
**URL:** http://localhost:3000/account/security

**Steps:**
1. Navigate to Account → Security
2. Click "Enable 2FA"
3. QR code dialog appears
4. Scan QR code with authenticator app:
   - Google Authenticator (iOS/Android)
   - Authy (iOS/Android/Desktop)
   - 1Password
   - Microsoft Authenticator
5. Enter 6-digit code from app
6. Click "Verify and Enable"
7. Verify "2FA Enabled" status shows
8. Verify authenticator appears in list
9. Click "Remove" button
10. Confirm removal

**Expected:** Enrollment, verification, and removal work without errors

---

### 2FA Login Test
**Steps:**
1. Enable 2FA (follow above)
2. Log out
3. Log back in with email/password
4. Enter 6-digit code from authenticator app
5. Verify login succeeds

**Expected:** MFA challenge appears and login succeeds with valid code

---

### Rate Limiting Test
**Steps:**
1. Enable rate limiting by configuring Upstash (see above)
2. Attempt to login with wrong password 6+ times rapidly
3. Verify CAPTCHA appears after 5 failed attempts
4. Wait 60 seconds
5. Attempt login again
6. Verify CAPTCHA no longer required

**Expected:** CAPTCHA protects after rate limit exceeded

---

## 📊 Verification Summary

| Feature | Implementation | Dashboard Check | Testing |
|---------|---------------|-----------------|---------|
| Database Security | ✅ Complete | ⏳ Verify pg_cron | ⏳ Test sessions |
| Rate Limiting | ✅ Complete | ⏳ Configure Upstash | ⏳ Test limits |
| CAPTCHA | ✅ Complete | ⏳ Configure Turnstile | ⏳ Test CAPTCHA |
| Avatar Upload | ✅ Complete | ⏳ Verify bucket | ⏳ Test upload |
| 2FA/TOTP | ✅ Complete | ⏳ Verify MFA enabled | ⏳ Test enrollment |
| Session Management | ✅ Complete | ✅ N/A | ⏳ Test logout |
| Audit Logging | ✅ Complete | ✅ N/A | ⏳ Check logs |

---

## 📝 Notes

### Migration History Mismatch
If you see migration mismatch errors, run:
```bash
cd /Users/Wael/Projects/crypto-pay
supabase migration repair --status applied 20260201
supabase migration list  # Verify
```

### Direct Database Connection
If `psql` connection fails with "Tenant or user not found", it's likely an IP restriction or credential format issue. This doesn't affect the application since it uses the Supabase SDK with proper authentication.

### MFA Configuration
Supabase MFA is built-in and doesn't require explicit configuration in `config.toml`. The MFA settings are managed through the Dashboard (Authentication → Multi-Factor Authentication).

### Storage Buckets
The `avatars` bucket is created via migration. If it doesn't exist in the Dashboard, the migration may not have applied. Re-run `supabase db push` to apply.

---

## 🎯 Quick Start

**To verify everything:**
```bash
# 1. Check Supabase Dashboard
open "https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/settings/auth"

# 2. Start dev server
cd /Users/Wael/Projects/crypto-pay
pnpm dev:portal

# 3. Test features
# - Avatar upload: http://localhost:3000/account/profile
# - 2FA: http://localhost:3000/account/security
```

**To configure remaining services:**
1. Get Turnstile Site Key: https://dash.cloudflare.com/
2. Get Upstash Redis: https://console.upstash.com/
3. Configure SendGrid SMTP in Supabase Dashboard

**Full documentation:** See `docs/NEXT_STEPS.md`

---

## ✅ When Complete

All features will be production-ready when:
- ✅ MFA enabled in Supabase Dashboard
- ✅ `avatars` bucket exists in Storage
- ✅ Turnstile Site Key configured
- ✅ Upstash Redis configured
- ✅ SendGrid SMTP configured in Dashboard
- ✅ All tests passing

You can then deploy to production with confidence! 🚀
