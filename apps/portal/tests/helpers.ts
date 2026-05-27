import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { expect, type Cookie, type Page } from "@playwright/test";

const portalRoot = resolve(__dirname, "..");
loadEnv({ path: resolve(portalRoot, ".env.local") });

/** Defaults match `scripts/setup-local-dev-user.ts` / `pnpm dev:setup`. */
export const DEV_USER_EMAIL = (
  process.env.PLAYWRIGHT_USER_EMAIL ??
  process.env.LOCAL_DEV_EMAIL ??
  "photospheremedia00@gmail.com"
).toLowerCase();

export const DEV_USER_PASSWORD =
  process.env.PLAYWRIGHT_USER_PASSWORD ??
  process.env.LOCAL_DEV_PASSWORD ??
  process.env.PLAYWRIGHT_PROD_PASSWORD ??
  "CryptoPayDev!2026";

/** Production smoke defaults (override via env; never commit passwords). */
export const PROD_BASE_URL =
  process.env.PLAYWRIGHT_PROD_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://cryptopay.sale";

export const PROD_ADMIN_EMAIL = (
  process.env.PLAYWRIGHT_ADMIN_EMAIL ?? "photospheremedia00@gmail.com"
).toLowerCase();

export const PROD_MERCHANT_EMAIL = (
  process.env.PLAYWRIGHT_MERCHANT_EMAIL ??
  process.env.PLAYWRIGHT_MERCHANT_EMAIL ??
  "merchant@example.com"
).toLowerCase();

export function prodPasswordFor(email: string): string {
  const normalized = email.toLowerCase();
  if (
    normalized === PROD_MERCHANT_EMAIL &&
    process.env.PLAYWRIGHT_MERCHANT_PASSWORD?.trim()
  ) {
    return process.env.PLAYWRIGHT_MERCHANT_PASSWORD.trim();
  }
  if (
    normalized === PROD_ADMIN_EMAIL &&
    process.env.PLAYWRIGHT_ADMIN_PASSWORD?.trim()
  ) {
    return process.env.PLAYWRIGHT_ADMIN_PASSWORD.trim();
  }
  return DEV_USER_PASSWORD;
}

export const AUTH_STORAGE_PATH = "playwright/.auth/user.json";

export function cookieDomainForBaseUrl(baseUrl: string): string {
  const host = new URL(baseUrl).hostname;
  return host === "localhost" ? "localhost" : host;
}

type StoredAuthCookie = {
  value: string;
  options?: CookieOptions;
};

/** Captures cookies from @supabase/ssr setAll (see Context7 /supabase/ssr docs). */
function createSupabasePlaywrightCookieStore() {
  const jar = new Map<string, StoredAuthCookie>();

  return {
    getAll: () =>
      Array.from(jar.entries()).map(([name, { value }]) => ({ name, value })),
    setAll: (cookies: { name: string; value: string; options?: CookieOptions }[]) => {
      for (const { name, value, options } of cookies) {
        if (value) {
          jar.set(name, { value, options });
        } else {
          jar.delete(name);
        }
      }
    },
    toPlaywrightCookies: (domain = "localhost"): Cookie[] =>
      Array.from(jar.entries()).map(([name, { value, options }]) => {
        const sameSite = options?.sameSite;
        const playwrightSameSite: Cookie["sameSite"] =
          sameSite === "strict"
            ? "Strict"
            : sameSite === "none"
              ? "None"
              : "Lax";

        const cookie: Cookie = {
          name,
          value,
          domain,
          path: options?.path ?? "/",
          httpOnly: options?.httpOnly ?? false,
          secure: options?.secure ?? false,
          sameSite: playwrightSameSite,
          // Playwright's Cookie type requires `expires` (seconds since epoch).
          // Use -1 for a session cookie, unless maxAge is provided.
          expires: -1,
        };

        if (options?.maxAge != null) {
          cookie.expires = Math.floor(Date.now() / 1000) + options.maxAge;
        }

        return cookie;
      }),
  };
}

/** Dismiss cookie banner when present (blocks clicks on marketing pages). */
export async function dismissCookieConsent(page: Page) {
  const dialog = page.locator('[aria-labelledby="cookie-consent-title"]');
  if (await dialog.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /accept all/i }).click({ force: true });
    await page.waitForTimeout(300);
  }
}

/** Fill the /signup form (Login component, mode=signup). */
export async function completeSignupForm(
  page: Page,
  email: string,
  password: string,
) {
  await page.getByLabel(/first name/i).fill("QA");
  await page.getByLabel(/last name/i).fill("User");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /sign up/i }).click();
}

/**
 * Sign in with the local dev user (`pnpm dev:setup`).
 * Default: Supabase SSR session cookies via createServerClient (Context7 /supabase/ssr).
 * Set PLAYWRIGHT_LOGIN_UI=1 to exercise the /login server-action form.
 */
export async function loginAsDevUser(
  page: Page,
  options?: { redirectPath?: string },
) {
  if (process.env.PLAYWRIGHT_LOGIN_UI === "1") {
    await loginAsDevUserViaForm(page, options);
    return;
  }
  await loginAsDevUserViaSupabase(page, options);
}

/**
 * Sign in with createServerClient + inject cookies into Playwright.
 * @see https://github.com/supabase/ssr — setAll must persist path/sameSite/maxAge
 * @see https://github.com/microsoft/playwright/blob/main/docs/src/auth.md — wait for final URL
 */
export async function loginWithSupabaseSession(
  page: Page,
  params: {
    email: string;
    password: string;
    redirectPath?: string;
    baseURL?: string;
  },
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/portal/.env.local",
    );
  }

  const baseURL = params.baseURL ?? PROD_BASE_URL;
  const cookieDomain = cookieDomainForBaseUrl(baseURL);

  const cookieStore = createSupabasePlaywrightCookieStore();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => cookieStore.setAll(cookies),
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });
  if (error) {
    throw new Error(
      `Supabase sign-in failed for ${params.email}: ${error.message}`,
    );
  }

  const cookies = cookieStore.toPlaywrightCookies(cookieDomain);
  if (cookies.length === 0) {
    throw new Error("Supabase sign-in succeeded but no auth cookies were set.");
  }

  await page.context().clearCookies();
  await page.context().addCookies(cookies);

  const destination = params.redirectPath ?? "/account";
  const isProd =
    !baseURL.includes("localhost") && !baseURL.includes("127.0.0.1");

  await page.goto(destination, {
    waitUntil: isProd ? "commit" : "domcontentloaded",
    timeout: isProd ? 90_000 : 45_000,
  });

  await dismissCookieConsent(page);

  await page.waitForURL(
    (href) => {
      const path = new URL(href.toString()).pathname;
      return !path.includes("/login") && !href.toString().includes("error=");
    },
    { timeout: isProd ? 90_000 : 45_000 },
  );
}

export async function loginAsDevUserViaSupabase(
  page: Page,
  options?: { redirectPath?: string },
) {
  await loginWithSupabaseSession(page, {
    email: DEV_USER_EMAIL,
    password: DEV_USER_PASSWORD,
    redirectPath: options?.redirectPath,
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001",
  });
}

/** Sign in through the /login form (PLAYWRIGHT_LOGIN_UI=1). */
export async function loginAsDevUserViaForm(
  page: Page,
  options?: { redirectPath?: string },
) {
  const loginPath = options?.redirectPath
    ? `/login?redirect=${encodeURIComponent(options.redirectPath)}`
    : "/login";

  await page.context().clearCookies();
  await page.goto(loginPath);
  await dismissCookieConsent(page);

  await page.locator("#email").fill(DEV_USER_EMAIL);
  await page.locator("#password").fill(DEV_USER_PASSWORD);

  const signInButton = page.getByRole("button", {
    name: "Sign in",
    exact: true,
  });
  await expect(signInButton).toBeEnabled({ timeout: 20_000 });

  await signInButton.click();

  await page.waitForURL(
    (url) => {
      const path = new URL(url.toString()).pathname;
      return (
        path.includes("/account") ||
        path.includes("/admin") ||
        (!path.includes("/login") && path !== "/")
      );
    },
    { timeout: 30_000 },
  ).catch(async () => {
    const errorText = await page.locator(".text-red-600").first().textContent();
    throw new Error(
      `Login failed for ${DEV_USER_EMAIL}. ${errorText?.trim() ?? "Still on /login."} Run \`pnpm dev:setup\` first.`,
    );
  });
}
