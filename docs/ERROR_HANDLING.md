# Error handling (Crypto Pay portal)

Patterns aligned with [next-intl error handling](https://next-intl.dev/docs/usage/configuration#error-handling) and [Next.js App Router error boundaries](https://nextjs.org/docs/app/getting-started/error-handling).

## Context7 / official checklist

| Requirement | Status |
|-------------|--------|
| `onError` / `getMessageFallback` **only** in `IntlProvider` (`'use client'`) | `intl-provider.tsx` |
| **Not** in `getRequestConfig` (next-intl 4 inherits them → RSC crash) | `i18n/request.ts` has locale + messages only |
| Metadata routes bypass proxy (`/icon`, `/apple-icon`, …) | `lib/routing/metadata-routes.ts` |
| `IntlErrorCode.MISSING_MESSAGE` → warn only; other codes → `reportError` | `intl-error-handlers.ts` |
| `error.tsx` + `global-error.tsx` as Client Components with `reset` | Done |
| `global-error` includes `<html>` and `<body>` | Done |
| No functions passed Server → Client (Next.js serialization) | Done |
| Safe `JSON.parse` for browser storage | `lib/errors/safe-json.ts` |

## Libraries

| Layer | Location | Use |
|-------|----------|-----|
| Safe JSON | `apps/portal/lib/errors/safe-json.ts` | `localStorage`, user input — never raw `JSON.parse` in UI |
| Report | `apps/portal/lib/errors/report.ts` | `reportError(error, { source })` — swap for Sentry later |
| Messages | `apps/portal/lib/i18n/load-messages.ts` | Validates locale JSON; falls back to `en` then emergency copy |
| next-intl server | `i18n/request.ts` | `loadMessages`, `locale` only (serializable) |
| next-intl client | `intl-provider.tsx` | `onError`, `getMessageFallback`, `locale`, `messages` |
| API routes | `apps/portal/lib/api/route-error.ts` | `routeError`, `routeUnauthorized`, `routeBadRequest` |
| UI | `components/errors/app-error-ui.tsx` | Shared `error.tsx` / `global-error.tsx` |

## next-intl provider (next-intl 4)

```tsx
// app/layout.tsx — Server passes serializable props only
<IntlProvider locale={locale} messages={messages}>{children}</IntlProvider>
```

Do **not** add `onError` / `getMessageFallback` to `getRequestConfig` — the plugin forwards them to `NextIntlClientProvider` and triggers serialization errors.

## API route example

```ts
import { routeError, routeUnauthorized } from "@/lib/api/route-error";

export async function GET() {
  try {
    if (!session) return routeUnauthorized();
    return NextResponse.json({ data });
  } catch (error) {
    return routeError(error, { logContext: "my-route GET" });
  }
}
```

## Local dev: JSON / 500 on every page

1. `pnpm dev:portal:clean` — clears corrupted `.next` cache  
2. In the error UI (dev only): **Clear site data** — fixes bad `localStorage` consent JSON  

## Boundaries

- `app/error.tsx` — segment errors (marketing, account, admin children)
- `app/global-error.tsx` — root layout failures (must include `<html>` / `<body>`)
- `app/[locale]/error.tsx` — re-exports segment error for localized routes
