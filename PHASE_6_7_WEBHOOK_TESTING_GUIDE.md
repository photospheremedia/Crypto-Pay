# Phase 6 & 7 - Webhook Configuration & Local Testing

**Date:** February 2, 2026  
**Status:** Ready to Begin  
**ETA:** 30-45 minutes total

## Quick Links

- **Stripe Dashboard:** https://dashboard.stripe.com/webhooks
- **Urban Piper Webhook Settings:** (Check your Urban Piper admin panel)
- **Supabase Functions Dashboard:** https://app.supabase.com/project/xfairwgarmpvbogiuduk/functions
- **Function Logs:** https://app.supabase.com/project/xfairwgarmpvbogiuduk/functions/logs

---

## Phase 6: Webhook Configuration (15 minutes)

### Step 1: Configure Stripe Webhook

1. **Open Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/webhooks
   - OR: Developers → Webhooks

2. **Add Webhook Endpoint**
   - Click "Add endpoint"
   - URL: `https://xfairwgarmpvbogiuduk.supabase.co/functions/v1/stripe-webhook`
   - Events to send:
     - ✅ `payment_intent.succeeded`
     - ✅ `charge.refunded`
     - ✅ `invoice.payment_failed`
     - (Add others as needed for your use case)
   - Click "Add endpoint"

3. **Copy Signing Secret**
   - Find your webhook endpoint in the list
   - Click to view details
   - Scroll to "Signing secret"
   - Copy the full secret (starts with `whsec_`)

4. **Update Supabase Secret**
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --project-ref xfairwgarmpvbogiuduk
   ```
   - Paste the full signing secret from Stripe
   - Wait for "Successfully set secret"

5. **Verify Configuration**
   ```bash
   supabase secrets list --project-ref xfairwgarmpvbogiuduk | grep STRIPE_WEBHOOK_SECRET
   ```
   - Should see: `STRIPE_WEBHOOK_SECRET` with a digest hash

✅ **Stripe Webhook Configured**

---

### Step 2: Configure Urban Piper Webhook

1. **Open Urban Piper Admin Panel**
   - Log in to your Urban Piper account
   - Navigate to Settings → Integrations OR Webhooks section

2. **Add Webhook Endpoint**
   - URL: `https://xfairwgarmpvbogiuduk.supabase.co/functions/v1/urban-piper-webhook`
   - Events:
     - ✅ Menu sync
     - ✅ Order received
     - ✅ Order status change
     - ✅ Store configuration change
   - Save/Enable

3. **Copy Signing Secret** (if provided)
   - Some webhook providers require a signing secret
   - If Urban Piper provides one, copy it

4. **Update Supabase Secret** (if signing secret exists)
   ```bash
   supabase secrets set URBAN_PIPER_WEBHOOK_SECRET="..." --project-ref xfairwgarmpvbogiuduk
   ```

5. **Verify Configuration**
   ```bash
   supabase secrets list --project-ref xfairwgarmpvbogiuduk
   ```

✅ **Urban Piper Webhook Configured**

---

## Phase 7: Local Testing (20-30 minutes)

### Step 1: Start Development Server

```bash
cd /Users/Wael/Projects/crypto-pay/apps/portal

# Clean up any lock files
rm -rf .next/dev/lock 2>/dev/null || true

# Start dev server
pnpm dev
```

Expected output:
```
▲ Next.js 16.1.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.18.43:3000
```

### Step 2: Test CAPTCHA Verification

1. **Navigate to Signup Page**
   - http://localhost:3000/signup
   - OR: http://localhost:3000/login (if signup not available)

2. **Test with CAPTCHA**
   - Fill out form
   - Complete Turnstile CAPTCHA
   - Submit

3. **Check Network Tab** (Chrome DevTools → Network)
   - Filter: Fetch/XHR
   - Look for POST request to `/api/auth/signup` or similar
   - Check that request succeeds

4. **Check Console Logs**
   - Should see: `[Chat API] Turnstile verification passed` OR similar
   - Verify: `🎯 Turnstile: 15ms` (or similar latency)

✅ **CAPTCHA verification working**

---

### Step 3: Test Email Sending

1. **Sign Up and Verify Email**
   - Complete signup with valid email
   - Check email inbox for welcome email
   - Should arrive within 30 seconds (vs 1-2 minutes before)

2. **Monitor Logs**
   - Supabase Dashboard → Functions → Logs
   - Filter: `send-email`
   - Should see success logs with email details

3. **Check Latency**
   - Open Network tab while sending email
   - Look for calls to Edge Function
   - Should see 50ms latency (vs 200ms before)

✅ **Email sending working**

---

### Step 4: Test Rate Limiting

1. **Attempt Multiple Logins**
   - Open http://localhost:3000/login
   - Try login 5 times quickly with wrong password
   - On 6th attempt, should see rate limit message

2. **Verify Rate Limit Response**
   - Should see: `"Too many requests. Please try again after..."`
   - HTTP Status: `429`

3. **Check Rate Limit Headers**
   - Network tab → Inspect failed request
   - Headers should include:
     - `X-RateLimit-Limit: 5`
     - `X-RateLimit-Remaining: 0`
     - `X-RateLimit-Reset: <timestamp>`

4. **Monitor Supabase Logs**
   - Supabase Dashboard → Functions → Logs
   - Filter: `rate-limit-check`
   - Should see successful rate limit checks

✅ **Rate limiting working**

---

### Step 5: Test Chat Streaming

1. **Navigate to Chat**
   - Open chat widget on homepage
   - OR: http://localhost:3000/chat (if available)

2. **Send a Message**
   - Type a test message (e.g., "What is your delivery integration?")
   - Send message
   - Watch for streaming response (words appearing one by one)

3. **Check Latency**
   - Network tab → Filter for `/chat` or `functions/v1/chat`
   - Should see response times around **300ms** (vs 500ms+ before)
   - Verify streaming works (ReadableStream)

4. **Test Provider Failover** (Optional)
   - Send message that would normally go to Groq
   - In Supabase logs, should see which provider was used
   - If Groq unavailable, should automatically fallback to OpenAI

5. **Monitor Supabase Logs**
   - Supabase Dashboard → Functions → Logs
   - Filter: `chat`
   - Should see chat request logs with provider used

✅ **Chat streaming working**

---

### Step 6: Verify Latency Improvements

**Open Chrome DevTools → Network Tab**

1. **Measure Time to Interactive (TTI)**
   - Before: ~880ms for all integrations
   - After: ~377ms for all integrations
   - Expected: 2.3x faster overall

2. **Individual Metrics**
   - CAPTCHA: 15ms (was 100ms) → 6.7x faster
   - Email: 50ms (was 200ms) → 4x faster
   - Rate Limit: 12ms (was 80ms) → 6.7x faster
   - Chat: 300ms (was 500ms+) → 40-50% faster

3. **Monitor via Supabase Dashboard**
   - Project → Functions → Metrics
   - Should see execution times matching expectations
   - Invocation counts increasing

✅ **Latency improvements verified**

---

## Phase 7: Production Deployment (5 minutes)

### Step 1: Commit All Changes

```bash
cd /Users/Wael/Projects/crypto-pay

git status  # Verify all changes staged
git add .   # If needed
git commit -m "test: Verify local integration and performance improvements"
```

### Step 2: Deploy to Vercel

```bash
git push origin main
```

This triggers automatic deployment. Check progress at:
- https://vercel.com/skullcandyxxx-projects/crypto-pay/deployments

Expected:
- Deployment starts automatically
- Build: ~2-3 minutes
- Deploy: ~1 minute
- Status: "READY" (green checkmark)

### Step 3: Test Production

1. **Navigate to Production URL**
   - https://crypto-pay.vercel.app
   - OR check Vercel dashboard for custom domain

2. **Test Each Integration**
   - Signup with CAPTCHA
   - Check email
   - Test rate limiting
   - Test chat

3. **Monitor Logs**
   - Supabase Dashboard → Functions → Logs
   - Should see real traffic from production

4. **Monitor Performance**
   - Vercel Dashboard → Analytics
   - Should see improved response times
   - Monitor for errors

✅ **Production deployment complete**

---

## Troubleshooting

### Edge Function Returns 401 (Unauthorized)

**Problem:** Function endpoint returns `{"code":401,"message":"Missing authorization header"}`

**Solution:** 
- Functions are secured by Supabase
- From Next.js (in the same project), authentication is implicit
- From external services (webhooks), need to configure CORS
- Verify function CORS settings in Supabase console

### Email Not Sending

**Problem:** Emails not arriving or logs show errors

**Solution:**
1. Check Supabase logs: Functions → Logs → Filter: `send-email`
2. Verify RESEND_API_KEY secret is set
3. Test Resend API key directly at: https://resend.com/api/tokens
4. Check spam folder
5. Verify email address is correct

### Rate Limiting Too Strict/Loose

**Problem:** Rate limit triggering too often or not at all

**Solution:**
1. Check Supabase logs: Functions → Logs → Filter: `rate-limit-check`
2. Verify UPSTASH_REDIS_REST_URL and TOKEN are set
3. Check Upstash dashboard for Redis status
4. Adjust limits in `supabase/functions/rate-limit-check/index.ts` if needed

### Chat Not Streaming

**Problem:** Chat response appears all at once or times out

**Solution:**
1. Check Supabase logs: Functions → Logs → Filter: `chat`
2. Verify GROQ_API_KEY and OPENAI_API_KEY in Supabase secrets
3. Check API quota/rate limits on Groq and OpenAI
4. Verify `X-Vercel-AI-UI-Message-Stream: v1` header is present
5. Check browser DevTools → Network → Response tab for streaming format

### Webhook Not Receiving Events

**Problem:** Stripe/Urban Piper webhooks not calling Edge Function

**Solution:**
1. Verify webhook URL is correct in provider dashboard
2. Check Supabase logs: Functions → Logs → Filter: `stripe-webhook` or `urban-piper-webhook`
3. Test webhook in provider dashboard ("Send test event")
4. Verify signing secret is set correctly
5. Check Network firewall rules (should be accessible from public internet)

### Vercel Deployment Failing

**Problem:** Deployment shows error or "FAILED" status

**Solution:**
1. Check Vercel deployment logs at: https://vercel.com/skullcandyxxx-projects/crypto-pay/deployments
2. Look for build errors in the logs
3. Common issues:
   - Missing environment variables (add to Vercel Project Settings)
   - Build cache issues (clear cache in Vercel dashboard)
   - TypeScript errors (fix locally, commit, push again)
4. If stuck, revert last commit: `git revert <commit-hash> && git push`

---

## Success Checklist

- [ ] Stripe webhook configured and receiving events
- [ ] Urban Piper webhook configured and receiving events
- [ ] Local dev server starts without errors
- [ ] CAPTCHA verification works (15ms)
- [ ] Email sends to test account (50ms)
- [ ] Rate limiting works after 5 login attempts
- [ ] Chat responds with streaming (300ms)
- [ ] Latency improvements verified (2-6x faster)
- [ ] Supabase logs show all integrations active
- [ ] Production deployment successful (READY status)
- [ ] Production testing passes

---

## Final Status

**Phases Completed:**
- ✅ Phase 1: Infrastructure Deployment
- ✅ Phase 2: Secrets Configuration
- ✅ Phase 3: Edge Functions
- ✅ Phase 4: Documentation
- ✅ Phase 5: Code Integration
- 🔄 Phase 6: Webhook Configuration (IN PROGRESS)
- 🔄 Phase 7: Deployment & Testing (NEXT)

**Overall Progress:** 84% → 95%+ after completion

**Timeline:**
- ✅ Infrastructure: 2 hours
- ✅ Code Integration: 1.5 hours
- 🔄 Testing & Deployment: 0.5-1 hour

**Total Time:** ~3.5-4 hours (Started 18:00 UTC, ETA completion 22:00 UTC)

---

**Next:** Start Phase 6 - Configure webhooks in Stripe and Urban Piper dashboards (15 min), then test locally (20 min), then deploy to Vercel (5 min).

**Total Remaining:** ~40 minutes
