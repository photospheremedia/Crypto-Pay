# Next Steps - Production Setup Completion

## Overview
The production security infrastructure is now in place. This document outlines the remaining steps to fully activate all security features.

## ✅ Completed
- [x] Database security migration deployed
- [x] pg_cron extension enabled for session cleanup
- [x] Performance indexes created
- [x] Security monitoring functions implemented
- [x] Rate limiting infrastructure built
- [x] CAPTCHA component created
- [x] API credentials stored securely
- [x] Documentation complete

## 🔄 Remaining Steps

### 1. Get Cloudflare Turnstile Site Key (10 minutes)

**Why:** Required for CAPTCHA to function in the browser

**Steps:**
1. Go to https://dash.cloudflare.com/
2. Navigate to "Turnstile" in the sidebar
3. Click "Add Site"
4. Fill in:
   - Site name: "Restaurant Hub Portal"
   - Domain: Your production domain (e.g., restaurant-hub.com) OR `localhost` for testing
   - Widget mode: Managed (Recommended)
5. Click "Create"
6. Copy the **Site Key** (starts with `0x...`)
7. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
   ```

**Documentation:** See [docs/ENV_SETUP.md](./ENV_SETUP.md) for detailed walkthrough

---

### 2. Get Upstash Redis REST URL (10 minutes)

**Why:** Required for rate limiting to work

**Steps:**
1. Go to https://console.upstash.com/
2. Click "Create Database"
3. Fill in:
   - Name: "restaurant-hub-ratelimit"
   - Type: Redis
   - Region: `us-east-1` (closest to Supabase)
   - Plan: Free (25MB, 10k commands/day)
4. Click "Create"
5. Go to "REST API" tab
6. Copy the **UPSTASH_REDIS_REST_URL** (starts with `https://...`)
7. Update `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-db-name-12345.upstash.io
   ```

**Documentation:** See [docs/ENV_SETUP.md](./ENV_SETUP.md) for detailed walkthrough

---

### 3. Configure SendGrid in Supabase Dashboard (15 minutes)

**Why:** Enable email sending for password resets, confirmations, etc.

**Steps:**
1. Go to https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk
2. Navigate to **Authentication** → **Email Templates**
3. Scroll to **SMTP Settings**
4. Click "Enable Custom SMTP"
5. Fill in:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: SENDGRID_API_KEY_REDACTED
   Sender email: noreply@your-domain.com
   Sender name: Restaurant Hub
   ```
6. Click "Save"
7. Test by sending a password reset email

**Documentation:** See [docs/PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) Section 1.2

---

### 4. Test Rate Limiting (10 minutes)

**Why:** Verify rate limiting works correctly

**Steps:**
1. Start dev server: `pnpm dev:portal`
2. Test password reset endpoint:
   ```bash
   # Should succeed for first 3 attempts
   for i in {1..4}; do
     curl -X POST http://localhost:3000/api/account/password-reset \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com"}' \
       -i
     sleep 1
   done
   ```
3. Verify:
   - First 3 requests return `200 OK`
   - 4th request returns `429 Too Many Requests`
   - Response includes headers:
     - `X-RateLimit-Limit: 3`
     - `X-RateLimit-Remaining: 0`
     - `X-RateLimit-Reset: <timestamp>`

---

### 5. Add CAPTCHA to Auth Forms (30 minutes)

**Why:** Prevent automated attacks on authentication endpoints

**Steps:**

1. **Update Sign-Up Page** (`app/(auth)/sign-up/page.tsx`):
   ```typescript
   import { TurnstileWidget } from '@/components/auth/turnstile';
   
   // Add state
   const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
   
   // Add widget before submit button
   <TurnstileWidget onVerify={setTurnstileToken} />
   
   // Include token in form submission
   body: JSON.stringify({ email, password, turnstileToken })
   ```

2. **Update Login Page** (`app/(auth)/login/page.tsx`):
   - Same pattern as sign-up

3. **Update Password Reset Page** (`app/(auth)/forgot-password/page.tsx`):
   - Same pattern as sign-up

4. **Update API Endpoints** to verify token:
   ```typescript
   import { verifyTurnstileToken } from '@/components/auth/turnstile';
   
   const { turnstileToken } = await request.json();
   const isValid = await verifyTurnstileToken(turnstileToken);
   if (!isValid) {
     return Response.json({ error: 'CAPTCHA verification failed' }, { status: 400 });
   }
   ```

**Files to update:**
- `app/api/auth/sign-up/route.ts`
- `app/api/auth/sign-in/route.ts`
- `app/api/account/password-reset/route.ts`

---

### 6. Deploy to Vercel (20 minutes)

**Why:** Make security features available in production

**Steps:**

1. **Add Environment Variables to Vercel:**
   ```bash
   vercel env add SENDGRID_API_KEY
   vercel env add SMTP_PASSWORD
   vercel env add TURNSTILE_SECRET_KEY
   vercel env add UPSTASH_REDIS_REST_URL
   vercel env add UPSTASH_REDIS_REST_TOKEN
   vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY
   ```

2. **Deploy:**
   ```bash
   pnpm vercel:deploy
   ```

3. **Verify:**
   - Test password reset with rate limiting
   - Test CAPTCHA on login page
   - Check logs for any errors

---

## 📊 Verification Checklist

After completing all steps, verify:

- [ ] Password reset endpoint returns 429 after 3 attempts
- [ ] CAPTCHA appears on login/signup pages
- [ ] CAPTCHA blocks submission if not completed
- [ ] SendGrid sends emails successfully
- [ ] Rate limit headers appear in API responses
- [ ] Redis commands dashboard shows activity in Upstash
- [ ] No errors in Vercel logs

---

## 🔒 Security Notes

### Current State (With Placeholders)
- **Rate limiting:** Disabled (allows all requests through with warning)
- **CAPTCHA:** Optional (skips verification if not configured)
- **Emails:** Won't be sent until SendGrid configured in Supabase

### After Configuration
- **Rate limiting:** Enforced (blocks excessive requests)
- **CAPTCHA:** Required (blocks bots)
- **Emails:** Fully functional via SendGrid

---

## 📚 Additional Resources

- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Complete production checklist
- [ENV_SETUP.md](./ENV_SETUP.md) - Detailed credential setup guide
- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [SendGrid SMTP Docs](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)

---

## ⚡ Quick Start (For Testing)

If you just want to test locally without full setup:

```bash
# 1. Start Upstash Redis (free tier)
# Get REST_URL from dashboard

# 2. Create Turnstile site for localhost
# Get Site Key from Cloudflare

# 3. Update .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...
UPSTASH_REDIS_REST_URL=https://...

# 4. Start dev server
pnpm dev:portal

# 5. Test rate limiting
# Make 4+ requests to /api/account/password-reset
```

---

## 🆘 Troubleshooting

### Build Errors
- Ensure all placeholder values start with `__GET_FROM`
- Redis client will skip initialization if URL is invalid
- Rate limiters will be null and allow all requests through

### Runtime Errors
- Check environment variables are set correctly
- Verify Redis URL starts with `https://`
- Confirm Turnstile secret matches site key domain
- Check Supabase dashboard for SMTP errors

### Rate Limiting Not Working
- Check Upstash dashboard for command activity
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Check browser console for rate limit headers
- Confirm rate limiter is not null (check logs for warning)

### CAPTCHA Not Showing
- Verify `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is public (starts with `0x`)
- Check domain matches what's configured in Cloudflare
- For localhost testing, add `localhost` as allowed domain in Cloudflare
- Check browser console for Turnstile errors

---

**Ready to begin? Start with Step 1: Get Cloudflare Turnstile Site Key**
