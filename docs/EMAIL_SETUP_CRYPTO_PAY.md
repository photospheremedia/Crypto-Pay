# Crypto Pay — Resend Email Setup

Adapted from Restaurant Hub (`docs/EMAIL_SETUP.md`, `docs/EMAIL_SYSTEM_ARCHITECTURE.md`).

## Architecture (unchanged)

| Layer | Service | Purpose |
|-------|---------|---------|
| Auth emails | Supabase Auth → Resend SMTP | Signup, reset, magic link, invite |
| App emails | `send-email` Edge Function → Resend API | Orders, admin invites, marketing |

## 1. Environment variables

**Local:** `apps/portal/.env.local` (gitignored)

```env
RESEND_API_KEY=re_...
EMAIL_FROM=Crypto Pay <onboarding@resend.dev>
EMAIL_REPLY_TO=support@cryptopay.com
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://hwntncyiqaltzvlidscg.supabase.co/functions/v1
```

| Variable | Where |
|----------|--------|
| `RESEND_API_KEY` | `.env.local`, Vercel, **Supabase Edge Function secret** |
| `EMAIL_FROM` | `.env.local`, Vercel (portal) |
| `EMAIL_REPLY_TO` | Optional; defaults to `support@cryptopay.com` |

**Until your domain is verified in Resend**, use `onboarding@resend.dev` as the from address (Resend’s test sender). After DNS verification, switch to e.g. `Crypto Pay <noreply@cryptopay.com>`.

## 2. Vercel (primary for portal emails)

Project: **`crypto-pay-portal`** (team `skullcandyxxxs-projects`). Repo link: `.vercel/project.json`.

Push local env to Vercel (production + preview + development):

```powershell
cd "C:\Users\FreeBandz\Projects\Crypto Pay"
.\scripts\sync-vercel-env.ps1
```

Portal `sendEmail()` uses **`RESEND_API_KEY` on Vercel** first (direct Resend API). Edge Function is only a fallback.

Pull from Vercel into local:

```bash
cd apps/portal && node ../../node_modules/vercel/dist/index.js env pull .env.local
```

## 3. Supabase Edge Function secret (optional fallback)

Only needed if you rely on `send-email` without `RESEND_API_KEY` on the server:

[Edge Functions → Secrets](https://supabase.com/dashboard/project/hwntncyiqaltzvlidscg/settings/functions) → `RESEND_API_KEY`.

## 4. Auth SMTP (Supabase)

Configured in `supabase/config.toml`:

- Host: `smtp.resend.com`
- Port: `587`
- User: `resend`
- Password: `RESEND_API_KEY` (project secret / dashboard)

Push auth config + templates after HTML changes:

```bash
# Requires SUPABASE_ACCESS_TOKEN
python scripts/update_supabase_templates.py
```

## 5. Auth email HTML templates

Files: `supabase/templates/*.html` (Crypto Pay emerald branding).

## 6. Application emails (portal)

```typescript
import { sendEmail } from "@/lib/email/sender";
import { sendWelcomeEmail } from "@/lib/email/triggers";

await sendWelcomeEmail({ email: "user@example.com", firstName: "Alex" });
```

Defaults: `apps/portal/lib/email/config.ts` → `getEmailFrom()`, `getReplyTo()`.

## 7. Domain verification (production)

1. [Resend → Domains](https://resend.com/domains) → add `cryptopay.com`
2. Add SPF, DKIM, DMARC at your DNS host
3. Update `EMAIL_FROM` and `supabase/config.toml` `admin_email` to `noreply@cryptopay.com`
4. Re-run `scripts/update_supabase_templates.py`

## 8. Testing

| Environment | Auth emails | App emails |
|-------------|-------------|------------|
| Local Supabase | Inbucket `http://localhost:54324` | Needs functions URL + secret |
| Production | Real SMTP via Resend | Edge `send-email` |

Check delivery: [Resend → Emails](https://resend.com/emails).

## Troubleshooting

- **Domain not verified** — use `onboarding@resend.dev` or verify DNS
- **RESEND_API_KEY not configured** (edge function) — run `setup-resend-secrets.ps1`
- **Emails to spam** — complete SPF/DKIM/DMARC
- **Rate limits** — Resend free tier ~100/day; see `docs/EMAIL_SYSTEM_ARCHITECTURE.md`
