function cleanEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === '""' || trimmed === "''") {
    return undefined;
  }
  return trimmed.replace(/^["']|["']$/g, "");
}

export function getSupabaseUrl(): string | undefined {
  return cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string | undefined {
  return cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * API key for server-side Supabase clients (SSR cookies, middleware).
 * Uses anon key when set; in development only, falls back to service role so
 * local login works when NEXT_PUBLIC_SUPABASE_ANON_KEY was never configured.
 */
export function getSupabaseServerApiKey(): string | undefined {
  const anonKey = getSupabaseAnonKey();
  if (anonKey) {
    return anonKey;
  }

  if (process.env.NODE_ENV === "development") {
    return cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

  return undefined;
}

export function isSupabasePublicConfigured(): boolean {
  return !!(getSupabaseUrl() && getSupabaseAnonKey());
}

export function requireSupabaseServerConfig(): { url: string; apiKey: string } {
  const url = getSupabaseUrl();
  const apiKey = getSupabaseServerApiKey();

  if (!url || !apiKey) {
    throw new Error(
      "Supabase environment variables are not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to apps/portal/.env.local (Supabase Dashboard → Project Settings → API).",
    );
  }

  return { url, apiKey };
}
