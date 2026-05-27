---
name: auth-signup-flow
description: >-
  Merchant signup with Supabase Auth (email/password, OAuth, PKCE) and Resend
  transactional email. Use when implementing or debugging /signup, email
  confirmation, /auth/confirm, /auth/callback, welcome email, resend
  confirmation, Auth SMTP, or onboarding redirects.
---

# Auth signup flow (Supabase + Resend)

End-to-end best practices for Crypto Pay merchant registration. Sourced from **Context7** (`/supabase/ssr`, `/websites/supabase`, `/websites/resend`) and aligned with this repo.

**Also read:** `.agents/skills/supabase/SKILL.md`, `.agents/skills/resend/SKILL.md`, `docs/ACCOUNT_SETUP_WORKFLOW.md`.

## Context7 library IDs

| Topic | Library ID | Use for |
|-------|------------|---------|
| SSR / cookies / middleware | `/supabase/ssr` | `createServerClient`, per-request client, `getUser()` vs `getSession()` |
| Auth API | `/websites/supabase` | `signUp`, `resend`, `verifyOtp`, redirect URLs, confirm email |
| Resend send / deliverability | `/websites/resend` | `emails.send`, idempotency, verified domain, Supabase SMTP |
| Examples | `/resend/resend-examples` | React Email + Next.js patterns |

Refresh with Context7 `query-docs` before changing auth or email behavior — do not rely on training data.

---

## Two email systems (do not conflate)

| Email | Sender | Purpose |
|-------|--------|---------|
| **Auth** (confirm signup, reset password, magic link) | Supabase Auth → **Resend SMTP** (`pnpm resend:sync`) | User must click link to verify identity |
| **Product** (welcome, wallet submitted, admin review) | Portal `RESEND_API_KEY` via `lib/email/sender.ts` | Onboarding and ops after account exists |

**Resend best practice (Context7 / Resend KB):** Use a **dedicated subdomain** for auth SMTP; align `from` domain with link domains in templates. Verify domain in Resend before production. See `docs/EMAIL_SETUP_CRYPTO_PAY.md`.

---

## Recommended signup flow (email + password)

### 1. Client form → server action

- Route: `/signup` → `Login` (`mode="signup"`) in `app/[locale]/(login)/login.tsx`
- Action: `signUp()` in `app/[locale]/(login)/actions.ts`
- **Bot protection:** rate limit + honeypot (`assertBotProtectionForForm`) — Turnstile optional via `lib/security/turnstile-config.ts`

### 2. `auth.signUp` (server, SSR client)

```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: accountWalletSetupConfirmUrl(appUrl), // final destination after confirm
    data: { first_name, last_name, full_name, phone },
  },
});
```

**Supabase best practices:**

- Set **`emailRedirectTo`** to the post-confirm destination; it must appear in **Redirect URLs** (dashboard) and match `NEXT_PUBLIC_APP_URL` in each environment.
- Store profile fields in `options.data` (`user_metadata`), not a separate signup table, unless you have a migration for it.
- If **Confirm email** is enabled and no session is returned → do **not** treat the user as logged in; redirect to login with verify messaging (this repo: `/login?created=1&verify=1&email=...`).
- If a **session is returned** (confirm disabled) → redirect to wallet onboarding and schedule welcome email immediately.

**Existing user:** Map Supabase errors (`already registered`, `User already exists`) to a single friendly message — avoid account enumeration on resend.

### 3. Email confirmation link (PKCE / SSR)

Supabase auth templates in this repo point to **`/auth/confirm`**, not `/auth/callback`:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
```

Template source: `apps/portal/lib/email/supabase-auth-template.ts`  
Handler: `apps/portal/app/auth/confirm/route.ts`

**Handler must:**

1. Read `token_hash` + `type` (normalize `signup` → `email` via `normalizeEmailOtpType`)
2. Call `supabase.auth.verifyOtp({ type, token_hash })` with **server** `createServerClient` (cookies `getAll` / `setAll`)
3. `revalidatePath("/", "layout")` after session is set
4. Redirect to sanitized `next` or default onboarding (`merchantOnboardingPath()` / admin home)
5. Use `x-forwarded-host` in production redirects (same pattern as `/auth/callback`)

**Do not** use `exchangeCodeForSession` on this route — that is for `?code=` (OAuth / PKCE code flow).

### 4. OAuth signup / sign-in

- Start: server-initiated OAuth with `@supabase/ssr` (PKCE verifier in cookies)
- Callback: `apps/portal/app/auth/callback/route.ts` — `exchangeCodeForSession(code)`
- `mode=signup` → wallet onboarding; schedule welcome email when appropriate
- Exclude `/auth/callback` and `/auth/confirm` from locale middleware rewrites (`apps/portal/proxy.ts`)

### 5. Resend welcome email (product)

**When to send** (schedule, do not block redirect):

| Trigger | Idempotency key pattern | Code |
|---------|-------------------------|------|
| `signUp` returns session | `user.welcome.{email}` | `actions.ts` → `scheduleEmailWork` |
| Email confirmed (`verifyOtp` type `email`) | `user.welcome.confirm.{userId}` | `app/auth/confirm/route.ts` |
| OAuth signup | workflow in callback | `app/auth/callback/route.ts` |

**Resend best practices:**

- Send via `runWelcomeEmailWorkflow` → `sendWelcomeEmail` (existing templates)
- Use **`scheduleEmailWork`** + Next.js `after()` so SMTP/API failures never block auth redirects
- Use **idempotency** keys on `emails.send` where the sender supports it (`signup/<userId>` style — see Resend docs)
- `from` must use **verified** domain (`EMAIL_FROM` in `.env.local`)
- Failures: log only; never fail signup because welcome email failed

### 6. Resend confirmation (no enumeration)

```typescript
await supabase.auth.resend({
  type: "signup",
  email,
  options: { emailRedirectTo: accountWalletSetupConfirmUrl(appUrl) },
});
```

Always return the same success copy whether or not the account exists (`resendSignupConfirmation` in `actions.ts`).

---

## SSR / middleware checklist (Supabase)

From `/supabase/ssr` docs — required for signup to work in production:

| Rule | Crypto Pay |
|------|------------|
| New `createServerClient` **per request** | `getSupabaseServerClient()` in actions/routes |
| Middleware refreshes session; `setAll` writes cookies | `apps/portal/proxy.ts` |
| Protected routes use **`getUser()`**, not cookie-only session | Account layout, proxy |
| `emailRedirectTo` / Site URL / Redirect URLs aligned per env | `NEXT_PUBLIC_APP_URL`, Supabase dashboard |
| Auth routes without locale prefix | `/auth/confirm`, `/auth/callback` |

---

## Configuration checklist

| Item | Where |
|------|--------|
| Confirm email on/off | Supabase Dashboard → Auth |
| Site URL + Redirect URLs | Supabase Dashboard (include `/auth/confirm`, app origin) |
| Auth email templates | `pnpm email:sync-auth` / `lib/email/supabase-auth-template.ts` |
| Resend SMTP for Auth | `pnpm resend:sync` |
| Product email env | `RESEND_API_KEY`, `EMAIL_FROM` in `apps/portal/.env.local` |
| Post-confirm destination | `accountWalletSetupConfirmUrl()` → `/account?tab=wallets` |

---

## Anti-patterns

| Avoid | Prefer |
|-------|--------|
| `getSession()` alone on protected pages | `getUser()` (validates JWT with Auth server) |
| `emailRedirectTo` pointing at `/auth/callback` for email OTP | `/auth/confirm` + `verifyOtp` |
| Blocking redirect on `resend.emails.send` | `scheduleEmailWork` |
| Duplicate welcome on confirm **and** immediate session signup | One welcome per user idempotency key |
| Account enumeration on resend / forgot-password | Generic success messages |
| `NEXT_PUBLIC_*` for Resend or Turnstile secrets | Server env only |

---

## Verification (agents)

1. **Sign up** with confirm enabled → lands on `/login?created=1&verify=1`; inbox has Supabase/Resend auth mail.
2. Click link → `/auth/confirm` → session cookie → `/account?tab=wallets`.
3. **Sign up** with confirm disabled → direct redirect to wallets; one welcome in logs.
4. **Resend** on login page → generic success; no email leak for unknown addresses.
5. Supabase MCP: auth logs if confirm or SMTP fails.

Playwright: `apps/portal/tests/auth.spec.ts` (`completeSignupForm`).

---

## Related docs in repo

| Doc | Content |
|-----|---------|
| `docs/ACCOUNT_SETUP_WORKFLOW.md` | Sequence diagrams, email budget |
| `docs/EMAIL_SETUP_CRYPTO_PAY.md` | Resend + SMTP setup |
| `docs/LOCAL_DEV.md` | Local auth URLs |
| `docs/MERCHANT_VS_ADMIN_UI.md` | Route map |
