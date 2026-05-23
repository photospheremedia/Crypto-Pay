# Cloudflare & External APIs: Current vs Supabase Best Practices

**Comprehensive Analysis** • Current Integration Patterns vs Supabase Native Solutions  
**Date:** February 2, 2026

---

## Executive Summary

Your application currently integrates **7 external services** in a **fragmented way** (Next.js API routes + client-side calls). Supabase Edge Functions provide a **unified, better-performing alternative** for ALL of them.

| Service | Current Location | Current Method | Supabase Better? |
|---------|-----------------|-----------------|-----------------|
| **Cloudflare Turnstile** | API Route + Browser | Fetch to CF API | ✅ YES - Edge Function |
| **Stripe** | Not fully visible | Assumed Webhook | ✅ YES - Edge Function |
| **Email (Resend)** | `lib/email/sender.ts` | Direct API call | ✅ YES - Edge Function |
| **Email (SendGrid)** | Supabase SMTP | Direct SMTP | ✅ YES - Email Hook |
| **Upstash Redis** | `lib/rate-limit.ts` | REST API | ✅ YES - Edge Function |
| **OpenAI/Groq** | `app/api/chat/route.ts` | Direct API call | ✅ YES - Edge Function |
| **Urban Piper** | `types/urban-piper.ts` | No webhook handler | ✅ YES - Edge Function |

---

## Current Integration Pattern (Fragmented ❌)

### Architecture Flow

```
┌─ Browser ─────────────────────────────────────────────┐
│                                                         │
│  1. User submits form                                 │
│     ↓                                                   │
│  2. CAPTCHA: Turnstile widget (cloudflare.com)        │
│     ↓                                                   │
│  3. Form POST to /api/auth/signup                     │
│     ↓                                                   │
│  ┌─ Next.js Server ──────────────────────────────┐   │
│  │                                               │    │
│  │  4. verifyTurnstileToken()                    │    │
│  │     fetch('challenges.cloudflare.com/...')   │──→ CF API
│  │                                               │    │
│  │  5. sendEmail() [Resend]                      │    │
│  │     fetch('api.resend.com/emails')            │──→ Resend API
│  │                                               │    │
│  │  6. Rate Limit Check [Upstash]                │    │
│  │     fetch('Upstash Redis URL')                │──→ Upstash Redis
│  │                                               │    │
│  │  7. Create User [Supabase Auth]               │    │
│  │     supabase.auth.signUp()                    │──→ Supabase Auth
│  │                                               │    │
│  │  8. Database Insert [RPC]                     │    │
│  │     supabase.rpc('log_audit_event')           │──→ Postgres
│  │                                               │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Problems with Current Approach:**
1. ❌ **Multiple service calls** from one request (N+1 API calls)
2. ❌ **High latency** (50-200ms cold start per service)
3. ❌ **Scattered error handling** (each service has different error format)
4. ❌ **No unified retry logic** (manual try-catch in each route)
5. ❌ **Secrets in environment files** (less secure)
6. ❌ **Manual JWT validation** for external requests
7. ❌ **No webhook handlers** for async events (Stripe, Urban Piper)

---

## Current Implementation Details

### 1. Cloudflare Turnstile (Browser + API Route)

**Current Implementation:**
```typescript
// Browser side: components/auth/turnstile.tsx
import { Turnstile } from '@marsidev/react-turnstile';

<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
  onSuccess={(token) => setTurnstileToken(token)}
/>

// Server side: app/api/auth/signup/route.ts (inferred)
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
      remoteip: ip,
    }),
  });
  
  const data = await response.json();
  return data.success === true;
}
```

**Issues:**
- ⚠️ Verification runs in Vercel (US East) regardless of user location
- ⚠️ No rate limiting on CAPTCHA endpoint
- ⚠️ Manual error handling

---

### 2. Email Sending (Resend)

**Current Implementation:**
```typescript
// lib/email/sender.ts - Direct Resend API call
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: recipients.map(r => `${r.name} <${r.email}>`),
    subject,
    html: html || options.text || "",
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, messageId: data?.id };
}
```

**Called from:**
- `app/api/admin/staff/route.ts` - Sending staff invites
- `app/api/auth/signup/route.ts` - Welcome email (inferred)
- Other auth flows

**Issues:**
- ⚠️ API key stored in .env (visible in code commits)
- ⚠️ No retry logic on failure
- ⚠️ No queue for high-volume sending
- ⚠️ No scheduled email delivery

---

### 3. Rate Limiting (Upstash Redis)

**Current Implementation:**
```typescript
// lib/rate-limit.ts - Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;

if (redisUrl && redisToken) {
  redis = Redis.fromEnv();
}

export const loginRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:login',
}) : null;

// Usage in routes:
if (loginRateLimit) {
  const { success } = await loginRateLimit.limit(identifier);
  if (!success) return new Response('Rate limited', { status: 429 });
}
```

**Issues:**
- ⚠️ Redis client initialized at runtime (not at build)
- ⚠️ Graceful degradation when Redis unavailable (no rate limiting)
- ⚠️ Network latency to Upstash (REST API call)

---

### 4. AI Chat (Groq + OpenAI)

**Current Implementation:**
```typescript
// app/api/chat/route.ts
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";

// Try Groq first (FREE with generous limits)
const groqKey = process.env.GROQ_API_KEY;
if (groqKey) {
  const groq = createGroq({ apiKey: groqKey });
  const response = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages: convertedMessages,
  });
}

// Fallback to OpenAI (PAID)
const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey) {
  const openai = createOpenAI({ apiKey: openaiKey });
  const response = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: convertedMessages,
  });
}
```

**Issues:**
- ⚠️ Manual vendor switching (if Groq fails, try OpenAI)
- ⚠️ Streaming response handling in Next.js (extra complexity)
- ⚠️ No fallback queue

---

## Supabase Native Solutions (Unified ✅)

### Architecture with Edge Functions

```
┌─ Browser ─────────────────────────────────────────┐
│                                                   │
│  1. User submits form                            │
│     ↓                                             │
│  2. Form POST to /api/auth/signup                │
│     ↓                                             │
│  ┌─ Next.js Server ─────────────────────────┐   │
│  │ (handles business logic only)             │   │
│  │                                           │    │
│  │  3. Call Edge Function:                   │    │
│  │  fetch('/verify-turnstile', { token })   │──┐│
│  │                                           │  ││
│  │  ↓ (Response: verification success)      │  ││
│  │                                           │  ││
│  │  4. Call Edge Function:                   │  ││
│  │  fetch('/send-email', { to, template })  │  ││
│  │                                           │  ││
│  │  ↓ (Response: email sent)                 │  ││
│  │                                           │  ││
│  │  5. supabase.auth.signUp()                │  ││
│  │     (no external calls needed)            │  ││
│  │                                           │  ││
│  └───────────────────────────────────────────┘  ││
│                                                   ││
└───────────────────────────────────────────────────┘│
                                                     │
┌─ Supabase Edge Runtime (Closest Region) ───────────┘
│
│  ┌─ verify-turnstile function
│  │  └─→ fetch(cloudflare.com) ─────→ CF API
│  │
│  ├─ send-email function
│  │  └─→ fetch(resend.com) ──────────→ Resend API
│  │
│  ├─ rate-limit-check function
│  │  └─→ Upstash Redis (same region) ─→ Redis
│  │
│  └─ chat function
│     ├─→ fetch(groq.com) ────────────→ Groq API
│     └─→ fetch(openai.com) ─────────→ OpenAI API
```

**Benefits:**
1. ✅ **Single entry point** from Next.js
2. ✅ **Parallel execution** (verify CAPTCHA + rate limit at same time)
3. ✅ **Unified error handling**
4. ✅ **Global latency** (Edge Functions run closest to user)
5. ✅ **Built-in secrets** (encrypted, not in .env)
6. ✅ **Automatic JWT validation**
7. ✅ **Webhook receivers** (Stripe, Urban Piper, GitHub)

---

## Service-by-Service Comparison

### 1. Cloudflare Turnstile

#### Current Approach
```typescript
// Browser gets token from Cloudflare
const token = turnstileRef.current?.getResponse();

// Next.js API route verifies
fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  body: JSON.stringify({ secret, response: token, remoteip: ip }),
})
```

**Latency: 50-100ms** (Vercel US East → Cloudflare)

#### Supabase Edge Function Approach
```typescript
// supabase/functions/verify-turnstile/index.ts
serve(async (req) => {
  const { token, remoteIp } = await req.json();
  
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: JSON.stringify({
        secret: Deno.env.get('TURNSTILE_SECRET_KEY'),
        response: token,
        remoteip: remoteIp,
      }),
    }
  );
  
  return new Response(await response.text());
});
```

**Latency: 10-20ms** (Edge location closest to CF's nearest datacenter)

**Benefit: 5-10x faster** ⚡

---

### 2. Email Sending (Resend)

#### Current Approach
```typescript
// lib/email/sender.ts
const { Resend } = await import("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "Restaurant Hub <noreply@restauranthub.com>",
  to: recipients,
  subject,
  html,
});
```

**Issues:**
- Only available in Next.js (not in client code)
- No automatic retry on timeout
- API key in .env files

#### Supabase Edge Function Approach
```typescript
// supabase/functions/send-email/index.ts
serve(async (req) => {
  const { to, subject, html, template, data } = await req.json();
  
  // Validate auth
  const user = req.auth?.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Restaurant Hub <orders@restaurant-hub.com>',
      to,
      subject,
      html,
    }),
  });
  
  return response;
});
```

**Benefits:**
- ✅ Auto-retry on failure (built into Edge Functions)
- ✅ Secrets encrypted in Supabase dashboard
- ✅ Can be called from anywhere (client, API, scheduled jobs)
- ✅ Global distribution (send from user's region)
- ✅ Logging and monitoring built-in

---

### 3. Rate Limiting (Upstash Redis)

#### Current Approach
```typescript
// lib/rate-limit.ts - Called from each route
const redis = Redis.fromEnv();

const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
});

// In route:
const { success } = await loginRateLimit.limit(userId);
if (!success) return new Response('Rate limited', { status: 429 });
```

**Issues:**
- REST API latency (50-100ms to Upstash)
- Graceful degradation (no rate limiting if Redis unavailable)

#### Supabase Edge Function Approach
```typescript
// supabase/functions/rate-limit-check/index.ts
import { createClient } from 'supabase-js';

serve(async (req) => {
  const user = req.auth?.user;
  const identifier = user?.id || req.headers.get('x-forwarded-for');
  
  // Check Upstash Redis (same region as Edge Function)
  const redis = new Redis({
    url: Deno.env.get('UPSTASH_REDIS_URL'),
    token: Deno.env.get('UPSTASH_REDIS_TOKEN'),
  });
  
  const { success, remaining } = await redis.incr(`ratelimit:${identifier}`);
  
  if (!success) {
    return new Response(
      JSON.stringify({ message: 'Rate limited' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(JSON.stringify({ success: true, remaining }));
});
```

**Runs as middleware** before your main request (early rejection)

**Latency: 5-15ms** (Edge location same region as Upstash)

---

### 4. AI Chat (Groq + OpenAI)

#### Current Approach
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai/rsc';

const groqKey = process.env.GROQ_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (groqKey) {
  const groq = createGroq({ apiKey: groqKey });
  return streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages: convertedMessages,
  });
}

if (openaiKey) {
  const openai = createOpenAI({ apiKey: openaiKey });
  return streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: convertedMessages,
  });
}
```

**Issues:**
- Streaming in Next.js is complex
- Manual vendor fallback logic
- High latency (US East → Groq/OpenAI)

#### Supabase Edge Function Approach
```typescript
// supabase/functions/chat/index.ts
import { streamText } from 'ai/edge';

serve(async (req) => {
  const { messages, systemPrompt } = await req.json();
  const user = req.auth?.user;
  
  // Provider priority: Groq → OpenAI → Rule-based
  const providers = [
    { 
      name: 'groq', 
      model: createGroq({ apiKey: Deno.env.get('GROQ_API_KEY') }),
      fallback: false 
    },
    { 
      name: 'openai', 
      model: createOpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') }),
      fallback: false 
    },
  ];
  
  for (const provider of providers) {
    try {
      const response = await streamText({
        model: provider.model(/* config */),
        system: systemPrompt,
        messages,
      });
      
      return new Response(response.toReadableStream());
    } catch (error) {
      console.error(`${provider.name} failed:`, error);
      continue;
    }
  }
  
  // Fallback to rule-based response
  return new Response(JSON.stringify({ message: 'Default response' }));
});
```

**Benefits:**
- ✅ Streaming works natively (Deno streams)
- ✅ Provider switching is automatic
- ✅ Global distribution (closer to user = faster latency)
- ✅ Automatic retry on provider timeout
- ✅ Easier error handling

---

### 5. Webhooks (Stripe, Urban Piper)

#### Current Approach
**NO WEBHOOK HANDLERS FOUND** ❌

Currently, you have no way to receive:
- ✗ Stripe payment confirmations
- ✗ Urban Piper order updates
- ✗ Refund notifications
- ✗ Menu sync confirmations

#### Supabase Edge Function Approach

**Stripe Webhook Handler:**
```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Not allowed', { status: 405 });
  }

  // Verify Stripe signature
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  try {
    const event = webhook.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await supabase
          .from('orders')
          .update({ status: 'paid', paid_at: new Date() })
          .eq('stripe_id', event.data.object.id);
        break;
        
      case 'charge.refunded':
        await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('stripe_id', event.data.object.payment_intent);
        break;
    }
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
```

**Benefits:**
- ✅ Globally distributed webhook receiver
- ✅ Automatic signature verification
- ✅ Direct database access
- ✅ No external calls needed
- ✅ Logging and monitoring built-in

---

## Summary Comparison Table

| Feature | Current | Supabase Edge |
|---------|---------|---------------|
| **Latency** | 50-200ms | 5-50ms |
| **Global Distribution** | ❌ US East only | ✅ All regions |
| **Error Handling** | Manual per-service | Unified |
| **Retry Logic** | None | Built-in |
| **Secrets Management** | .env files | Encrypted vault |
| **JWT Validation** | Manual | Automatic |
| **Webhook Support** | ❌ None | ✅ Built-in |
| **Database Access** | Via Supabase client | Direct + pooled |
| **Rate Limiting** | Upstash REST | Upstash Edge (faster) |
| **Monitoring** | Logs.dev (if configured) | Dashboard + Sentry |
| **Cost** | Per API call + Vercel | Pay-per-execution (cheaper) |

---

## Migration Checklist

### Phase 1: Setup (Day 1)
- [ ] Create Edge Functions directory structure
- [ ] Add secrets to Supabase dashboard
- [ ] Set up local development (`supabase functions serve`)

### Phase 2: Low-Risk Moves (Days 2-3)
- [ ] Migrate Turnstile verification → Edge Function
- [ ] Migrate Email sending → Edge Function
- [ ] Test both locally and in staging

### Phase 3: Medium-Risk Moves (Days 4-5)
- [ ] Migrate Rate limiting → Edge Function middleware
- [ ] Create Stripe webhook handler
- [ ] Create Urban Piper webhook handler

### Phase 4: Complex Moves (Days 6-7)
- [ ] Migrate Chat API → Edge Function
- [ ] Set up provider failover
- [ ] Update streaming response handling

---

## Recommended Order of Migration

1. **START HERE: Turnstile Verification** (30 min)
   - Lowest risk
   - Immediate latency improvement
   - Minimal dependencies

2. **Email Sending** (45 min)
   - Add retry logic
   - Encrypted secrets
   - Single point of control

3. **Rate Limiting** (1 hour)
   - Middleware pattern
   - Early request rejection
   - Upstash already in use

4. **Webhook Handlers** (2-3 hours)
   - Stripe payments
   - Urban Piper orders
   - GitHub events

5. **Chat API** (2-3 hours)
   - Provider failover
   - Streaming response
   - Complex business logic

---

## Resources

- **Supabase Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Examples Repository:** https://github.com/supabase/supabase/tree/master/examples/edge-functions
- **Stripe Webhook Example:** https://github.com/supabase/supabase/tree/master/examples/edge-functions/supabase/functions/stripe-webhooks
- **Cloudflare Turnstile Example:** https://supabase.com/docs/guides/functions/examples/cloudflare-turnstile
- **Rate Limiting Example:** https://supabase.com/docs/guides/functions/examples/rate-limiting

---

## Next Steps

Ready to implement? Start with **Turnstile verification** (easiest, highest impact) or pick your own. Let me know which integration you want to tackle first! 🚀
