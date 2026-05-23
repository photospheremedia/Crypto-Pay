# Environment Configuration Guide

## 🔑 API Keys and Credentials

This file contains instructions for setting up your `.env.local` file with all required API keys.

### Required Services

1. **Supabase** (Database & Auth) - Already configured ✅
2. **SendGrid** (Email SMTP) - Configured ✅
3. **Cloudflare Turnstile** (CAPTCHA) - Needs setup ⚠️
4. **Upstash Redis** (Rate Limiting) - Needs setup ⚠️

---

## 📧 SendGrid SMTP (Email) - Already Configured

**Status**: ✅ **API Key Added**

Your SendGrid API key has been added to `.env.local`:
```
SENDGRID_API_KEY=SG.your_key_here
```

### Next Steps for SendGrid:

1. **Configure in Supabase Dashboard**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Authentication → Email Templates
   - Scroll to **SMTP Settings**
   - Enter these values:
     ```
     Host: smtp.sendgrid.net
     Port: 587 (or 465 for SSL)
     Username: apikey
   Password: SG.your_key_here
     Sender Email: noreply@restaurant-hub.com (or your domain)
     Sender Name: Restaurant Hub
     ```
   - Click **Save**

2. **Test Email Sending**:
   - Try password reset flow
   - Send test email from dashboard
   - Check SendGrid dashboard for delivery stats

3. **Verify Sender Domain** (Optional but recommended):
   - Go to SendGrid → Settings → Sender Authentication
   - Verify your domain (restaurant-hub.com)
   - Improves deliverability and removes "via sendgrid.net"

---

## 🛡️ Cloudflare Turnstile (CAPTCHA) - Needs Setup

**Status**: ⚠️ **Secret Key Added, Site Key Needed**

Your Cloudflare API key has been added:
```
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

### Setup Instructions:

1. **Get Site Key from Cloudflare**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Turnstile** in the sidebar
   - If you haven't created a site yet:
     - Click **Add Site**
     - Domain: `restaurant-hub.com` (or `localhost` for testing)
     - Mode: **Managed** (recommended)
     - Click **Create**
   - Copy the **Site Key** (starts with `0x...`)

2. **Add Site Key to .env.local**:
   Replace this line in your `.env.local`:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=__GET_FROM_CLOUDFLARE_DASHBOARD__
   ```
   With your actual site key:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAA...
   ```

3. **Enable in Supabase (Optional)**:
   - Dashboard → Authentication → Settings → Security
   - Enable **Captcha Protection**
   - Choose **Cloudflare Turnstile**
   - Enter both keys

4. **Add to Auth Forms**:
   The Turnstile component is ready to use:
   ```tsx
   import { TurnstileWidget } from '@/components/auth/turnstile';
   
   // In your signup/login form:
   <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
   ```

---

## ⚡ Upstash Redis (Rate Limiting) - Configured

**Status**: ✅ **Configured in Supabase Secrets**

Rate limiting uses Upstash Redis via Supabase Edge Functions.

### Setup Instructions:

1. **Get REST Credentials from Upstash**:
   - Go to [Upstash Console](https://console.upstash.com/)
   - Select your Redis database (or create one if needed)
   - On the database page, find **REST API** section
   - Copy **two different values**:
     - **UPSTASH_REDIS_REST_URL** (e.g., `https://safe-rodent-10901.upstash.io`)
     - **UPSTASH_REDIS_REST_TOKEN** (starts with `ASqVAAInc...`, NOT the Redis CLI password)

2. **⚠️ Important: REST Token vs Redis Password**:
   - **REST Token**: Used by edge functions (what you need)
   - **Redis Password**: Used by `redis-cli` (different credential)
   - Make sure you copy the **REST Token**, not the password!

3. **Add to Supabase Secrets** (NOT Vercel):
   ```bash
   supabase secrets set \
     UPSTASH_REDIS_REST_URL="https://your-db.upstash.io" \
     UPSTASH_REDIS_REST_TOKEN="ASqVAAInc..." \
     --project-ref YOUR_PROJECT_REF
   ```

4. **Add to Local .env.local** (for development):
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=ASqVAAInc...
   ```

5. **Deploy Edge Function**:
   ```bash
   supabase functions deploy rate-limit-check --project-ref YOUR_PROJECT_REF --no-verify-jwt
   ```

6. **Verify It Works**:
   ```bash
   curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/rate-limit-check" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -d '{"limitType":"api","identifier":"test"}'
   ```
   Should return: `{"success":true,"limit":100,"remaining":99,"reset":...}`

### Why Secrets Go in Supabase (Not Vercel):

Rate limiting runs in **Supabase Edge Functions**, not on Vercel. The flow is:
```
User → Vercel (Next.js) → Supabase Edge Function → Upstash Redis
                            ↑
                     Secrets live here
```

Vercel only calls the edge function endpoint; it doesn't need Redis credentials.

### Troubleshooting:

**"WRONGPASS invalid or missing auth token"**:
- You used the Redis password instead of REST token
- Go back to Upstash Console → REST API section
- Copy the token that starts with `ASqVAAInc...`

**"Rate limit check failed"**:
- Secrets not deployed to edge function
- Run: `supabase functions deploy rate-limit-check --project-ref YOUR_PROJECT_REF --no-verify-jwt`

### Monitor Usage:
- Upstash Dashboard shows command count
- Free tier: 10,000 commands/day
- Each rate limit check = 2 commands (INCR + EXPIRE)

---

## 🔐 Complete .env.local File

After completing all steps above, your `.env.local` should look like:

```bash
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SendGrid SMTP (Already configured)
SENDGRID_API_KEY=SG.your_key_here
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_key_here
SMTP_FROM=noreply@restaurant-hub.com

# Cloudflare Turnstile (Add site key from dashboard)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAA... # ⚠️ ADD THIS
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Upstash Redis (Add REST URL from dashboard)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io # ⚠️ ADD THIS
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Groq AI
GROQ_API_KEY=gsk_your_key_here
```

---

## ✅ Verification Checklist

Before deployment, verify:

- [ ] SendGrid SMTP configured in Supabase Dashboard
- [ ] SendGrid test email sent successfully
- [ ] Turnstile Site Key added to `.env.local`
- [ ] CAPTCHA widget appears on auth forms
- [ ] Upstash Redis REST URL added to `.env.local`
- [ ] Rate limiting working (test by attempting 4+ password resets)
- [ ] All environment variables added to Vercel
- [ ] Sender domain verified in SendGrid (optional but recommended)

---

## 🚨 Security Notes

1. **Never commit `.env.local` to git** - It contains sensitive credentials
2. **Rotate API keys if exposed** - All services allow key regeneration
3. **Use separate keys for production/staging** - Create separate Upstash/Turnstile instances
4. **Monitor usage** - Check SendGrid, Upstash, and Cloudflare dashboards for abuse

---

## 📞 Support

If you encounter issues:

- **SendGrid**: [SendGrid Support](https://support.sendgrid.com/)
- **Cloudflare Turnstile**: [Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- **Upstash Redis**: [Upstash Docs](https://docs.upstash.com/redis)
- **Supabase**: [Supabase Support](https://supabase.com/support)
