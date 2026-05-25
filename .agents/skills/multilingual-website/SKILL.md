---
name: multilingual-website
description: >-
  Implements and extends internationalization (i18n) for the Crypto Pay portal
  (Next.js App Router + next-intl). Use when adding locales, translating UI copy,
  locale routing, RTL, language switchers, migrating pages to useTranslations,
  or fixing broken locale-aware links and middleware.
---

# Multilingual website (Crypto Pay portal)

## Stack (do not swap without explicit approval)

| Piece | Choice | Location |
|-------|--------|----------|
| Framework | Next.js 16 App Router | `apps/portal` |
| i18n library | **next-intl** | `apps/portal/i18n/` |
| Messages | JSON per locale | `apps/portal/messages/{locale}.json` |
| Routing | `[locale]` segment + `localePrefix: 'as-needed'` | `apps/portal/app/[locale]/` |
| Request hook | `proxy.ts` (Next.js 16; not `middleware.ts`) | `apps/portal/proxy.ts` |

**Supported locales:** `en` (default), `ar`, `es`, `fr`, `de`

## File map

```
apps/portal/
├── i18n/
│   ├── routing.ts      # locales, defaultLocale, localePrefix
│   ├── request.ts      # getRequestConfig → load messages
│   └── navigation.ts   # Link, redirect, useRouter, usePathname
├── messages/
│   ├── en.json
│   ├── ar.json
│   ├── es.json
│   ├── fr.json
│   └── de.json
├── proxy.ts            # next-intl middleware + Supabase auth (strip locale for path checks)
└── app/
    ├── layout.tsx      # <html lang dir> only
    ├── [locale]/       # ALL user-facing routes live here
    │   └── layout.tsx  # NextIntlClientProvider, setRequestLocale
    ├── api/            # NO locale prefix
    └── auth/           # NO locale prefix (OAuth callbacks)
```

## Rules

1. **User-facing routes** → under `app/[locale]/`. **API and auth callbacks** → stay at `app/api`, `app/auth`.
2. **Navigation** → import `Link`, `redirect`, `useRouter`, `usePathname` from `@/i18n/navigation`, not `next/link` or `next/navigation` (except rare cases).
3. **Copy** → never hardcode UI strings in components; add keys to `messages/en.json` first, then mirror structure in `ar`, `es`, `fr`, `de`.
4. **Namespaces** → group by feature: `Navigation`, `Footer`, `HomePage`, `Auth`, `Account`, `Admin`, `Common`.
5. **Server Components** → `getTranslations('Namespace')` from `next-intl/server`.
6. **Client Components** → `useTranslations('Namespace')` from `next-intl`; file must have `'use client'`.
7. **Metadata** → `generateMetadata` with `getTranslations({ locale, namespace: 'Metadata' })`.
8. **Arabic** → set `dir="rtl"` on `<html>` when `locale === 'ar'` (handled in root layout via `[locale]`).
9. **Auth paths in proxy** → use `stripLocale(pathname)` before comparing to `/login`, `/account`, `/admin`.
10. **Incremental migration** → one page/section per PR; ship `en` keys first, translate other locales (machine translate OK for first pass, human review for marketing/legal).

## Adding a new string

1. Add key to `messages/en.json` under the right namespace.
2. Add the same key path to `ar.json`, `es.json`, `fr.json`, `de.json`.
3. Replace literal in component with `t('key')` or `t('nested.key')`.
4. Run `pnpm --filter @crypto-pay/portal typecheck`.

## Adding a new locale

1. Add code to `routing.locales` in `i18n/routing.ts`.
2. Create `messages/{code}.json` (copy `en.json` structure).
3. Add label in `LocaleSwitcher` / `Common.locales.{code}`.
4. If RTL, add to `rtlLocales` in root layout.
5. Run build; fix any missing keys.

## Migrating a page (checklist)

```
- [ ] Page lives under app/[locale]/...
- [ ] All Link → @/i18n/navigation
- [ ] Strings in messages/*.json
- [ ] generateMetadata uses getTranslations (if page has metadata)
- [ ] setRequestLocale(locale) in page/layout if static rendering needed
- [ ] Manual test: /page (en), /es/page, switcher, RTL if ar
```

## Proxy composition pattern

```typescript
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleIntl = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const intlResponse = handleIntl(request);
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }
  const pathname = stripLocale(request.nextUrl.pathname);
  // ... existing Supabase auth using pathname without locale
  return intlResponse;
}
```

## Translation quality

| Area | Guidance |
|------|----------|
| Marketing | Natural, benefit-led; keep brand name "Crypto Pay" |
| Legal | Prefer professional human review |
| Admin | Short, consistent terminology |
| `ar` | Modern Standard Arabic; test RTL layout |

## Additional resources

- [next-intl App Router setup](https://next-intl.dev/docs/getting-started/app-router)
- [Locale-based routing](https://next-intl.dev/docs/routing/setup)
- Project example: `apps/portal/messages/en.json`, `components/locale-switcher.tsx`
