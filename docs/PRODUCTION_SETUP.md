# Production Setup Guide

This guide covers the critical steps needed before deploying to production.

## 🔴 Required Before Production

### 1. Custom SMTP Configuration

**Why**: The default Supabase email service has a 2 emails/hour limit, which will fail under production load.

**Steps**:
1. Choose an SMTP provider:
   - [SendGrid](https://sendgrid.com/) - Recommended, 100 emails/day free tier
   - [AWS SES](https://aws.amazon.com/ses/) - Pay per use, very cheap
   - [Postmark](https://postmarkapp.com/) - Great deliverability
   - [Mailgun](https://www.mailgun.com/) - Flexible pricing

2. Get SMTP credentials from your provider

3. Configure in Supabase Dashboard:
   - Go to `Authentication > Email Templates`
   - Scroll to `SMTP Settings`
   - Enter your credentials:
     ```
     Host: smtp.sendgrid.net (or your provider)
     Port: 587
     Username: apikey (for SendGrid) or your username
     Password: Your API key or password
     Sender email: noreply@yourdomain.com
     Sender name: Your App Name
     ```

4. Test by sending a password reset email

5. Update environment variables (optional, for additional customization):
```bash
# .env.local
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_api_key_here
SMTP_FROM=noreply@yourdomain.com
```

**References**:
- [Supabase SMTP Guide](https://supabase.com/docs/guides/auth/auth-smtp)
- [SendGrid Setup](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)

---

### 2. CAPTCHA Protection (Cloudflare Turnstile)

**Why**: Prevents bots from spamming signup, login, and password reset endpoints.

**Steps**:

1. **Get Turnstile Credentials**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to `Turnstile` in the sidebar
   - Click `Add Site`
   - Enter your domain (or use `localhost` for testing)
   - Choose `Managed` mode
   - Copy the `Site Key` and `Secret Key`

2. **Configure in Supabase Dashboard**:
   - Go to `Authentication > Settings`
   - Scroll to `Security and Protection`
   - Enable `Enable Captcha protection`
   - Choose `Cloudflare Turnstile`
   - Enter:
     - Site Key: Your Turnstile site key
     - Secret Key: Your Turnstile secret key

3. **Add to Environment Variables**:
```bash
# .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
```

4. **Install Turnstile React Component**:
```bash
npm install @marsidev/react-turnstile
```

5. **Add to Auth Forms**:
```tsx
// components/auth/captcha.tsx
'use client';

import { Turnstile } from '@marsidev/react-turnstile';

export function Captcha({ onVerify }: { onVerify: (token: string) => void }) {
  return (
    <Turnstile
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      onSuccess={onVerify}
    />
  );
}
```

**Protected Endpoints**:
- `/api/auth/signup`
- `/api/auth/signin`
- `/api/account/password-reset`

**References**:
- [Supabase CAPTCHA Guide](https://supabase.com/docs/guides/auth/auth-captcha)
- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Turnstile React Component](https://github.com/marsidev/react-turnstile)

---

### 3. Rate Limiting with Upstash Redis

**Why**: Prevents abuse and ensures fair API usage across all users.

**Steps**:

1. **Create Upstash Redis Instance**:
   - Go to [Upstash Console](https://console.upstash.com/)
   - Click `Create Database`
   - Choose region closest to your Supabase region
   - Select `Free` tier (10,000 commands/day)
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

2. **Install Dependencies**:
```bash
npm install @upstash/redis @upstash/ratelimit
```

3. **Add to Environment Variables**:
```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

4. **Create Rate Limit Utility**:
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different operations
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
  analytics: true,
});

export const passwordResetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 requests per hour
  analytics: true,
});
```

5. **Apply to API Routes**:
```typescript
// app/api/account/password-reset/route.ts
import { passwordResetRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, limit, remaining, reset } = await passwordResetRateLimit.limit(ip);

  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      }
    );
  }

  // Continue with password reset logic...
}
```

**Rate Limit Configuration**:
- Login: 5 attempts per 15 minutes per IP
- Password Reset: 3 attempts per hour per IP
- API Calls: 100 requests per hour per user
- Anonymous API: 30 requests per hour per IP

**References**:
- [Supabase Rate Limiting Guide](https://supabase.com/docs/guides/functions/examples/rate-limiting)
- [Upstash Ratelimit](https://github.com/upstash/ratelimit)

---

### 4. SSL Enforcement & Network Restrictions

**Why**: Prevents unencrypted connections and restricts database access to known IPs.

**Steps**:

1. **Enable SSL Enforcement**:
   - Go to Supabase Dashboard → `Settings > Database`
   - Under `SSL Enforcement`, toggle `Enforce SSL`
   - All database connections will now require SSL

2. **Configure Network Restrictions**:
   - Go to `Settings > Database > Network Restrictions`
   - Add allowed IP addresses:
     - Your office/home IP
     - Your CI/CD server IP (GitHub Actions, Vercel, etc.)
     - Any other trusted IPs
   - Enable `Restrict access to trusted IPs only`

3. **Update Connection Strings** (if using direct DB connections):
```typescript
// Use SSL parameters in connection string
const connectionString = `postgresql://postgres:[password]@[host]:[port]/postgres?sslmode=require`;
```

**References**:
- [Supabase SSL Enforcement](https://supabase.com/docs/guides/platform/ssl-enforcement)
- [Network Restrictions](https://supabase.com/docs/guides/platform/network-restrictions)

---

### 5. Email Confirmations

**Why**: Ensures users own the email addresses they sign up with.

**Steps**:

1. **Enable in Supabase Dashboard**:
   - Go to `Authentication > Settings`
   - Under `Email Auth`, toggle `Enable email confirmations`
   - Set `Email confirmation expiry` to 24 hours

2. **Customize Email Templates**:
   - Go to `Authentication > Email Templates`
   - Edit `Confirm Signup` template:
     ```html
     <h2>Welcome to Restaurant Hub!</h2>
     <p>Click the link below to confirm your email address:</p>
     <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
     <p>This link expires in 24 hours.</p>
     ```

3. **Handle Confirmation in App**:
```typescript
// app/auth/confirm/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error) {
      return NextResponse.redirect('/account?confirmed=true');
    }
  }

  return NextResponse.redirect('/auth/error');
}
```

**References**:
- [Supabase Email Confirmations](https://supabase.com/docs/guides/auth/auth-email)

---

## 🟡 Recommended for Production

### 6. Enable PITR (Point in Time Recovery)

**When**: Database size > 4GB or you need recovery granularity < 24 hours

**Steps**:
1. Go to Supabase Dashboard → `Database > Backups`
2. Enable `Point in Time Recovery`
3. Choose retention period (7 days recommended)
4. Cost: $100/month (Pro Plan addon)

**Benefits**:
- Restore to any point in time (up to seconds granularity)
- More resource-efficient than daily backups
- Continuous backup vs daily snapshots

---

### 7. Storage Buckets for User Avatars

**Steps**:

1. **Create Storage Bucket**:
```typescript
// Run once in Supabase SQL Editor
-- Create avatars bucket
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true);

-- Allow users to upload their own avatar
create policy "Users can upload their avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
create policy "Users can update their avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to view avatars
create policy "Avatars are publicly accessible"
on storage.objects for select
to public
using (bucket_id = 'avatars');
```

2. **Upload Component**:
```typescript
// components/avatar-upload.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export function AvatarUpload({ userId }: { userId: string }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update user profile with avatar URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
      />
    </div>
  );
}
```

---

### 8. Monitoring & Observability

**Setup Sentry**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configure Sentry**:
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

**References**:
- [Sentry Next.js Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Supabase Monitoring Guide](https://supabase.com/docs/guides/functions/examples/sentry-monitoring)

---

## ✅ Production Checklist

Before going live, verify:

- [ ] Custom SMTP configured and tested
- [ ] CAPTCHA enabled on auth endpoints
- [ ] Rate limiting implemented
- [ ] SSL enforcement enabled
- [ ] Network restrictions configured
- [ ] Email confirmations enabled
- [ ] Password reset flow tested
- [ ] 2FA available to users (optional but recommended)
- [ ] Session cleanup cron job running
- [ ] Database indexes created
- [ ] RLS policies applied to all tables
- [ ] Error monitoring (Sentry) configured
- [ ] Storage buckets created
- [ ] Load testing completed
- [ ] Backup strategy in place (PITR or daily backups)
- [ ] Security Advisor checked (Supabase Dashboard)
- [ ] Performance Advisor checked (Supabase Dashboard)
- [ ] Environment variables secured
- [ ] Domain SSL certificate valid
- [ ] CDN configured (if needed)
- [ ] Status page subscription set up

---

## 📊 Environment Variables Reference

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# SMTP (Optional - configured in Supabase Dashboard)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM=noreply@yourdomain.com

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your_auth_token

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 🔗 Useful Links

- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Production Checklist](https://vercel.com/docs/production-checklist)
- [Web Security Best Practices](https://cheatsheetseries.owasp.org/)
