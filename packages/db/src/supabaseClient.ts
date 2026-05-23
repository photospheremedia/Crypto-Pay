import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton instance to preserve PKCE code_verifier across re-renders.
 * 
 * CRITICAL: Supabase's @supabase/ssr automatically handles PKCE via cookies.
 * The singleton pattern is essential because:
 * 1. signInWithOAuth() generates code_verifier and stores it in cookies
 * 2. exchangeCodeForSession() retrieves code_verifier from cookies
 * 3. Both methods need access to the SAME instance to access the same cookie storage
 * 4. Creating a new instance on each call breaks the PKCE flow
 * 
 * The library automatically uses browser cookies for storage (no custom implementation needed).
 */
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Returns null when Supabase env vars are missing (e.g. local marketing-only dev). */
export function getSupabaseBrowserClientOptional() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return getSupabaseBrowserClient();
}

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are not set");
  }

  // Return singleton to preserve PKCE code_verifier across re-renders
  // CRITICAL: The same instance MUST be returned every time
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create browser client with default PKCE support (automatic in @supabase/ssr)
  // DO NOT add custom cookies object - use library defaults which handle PKCE correctly
  supabaseInstance = createBrowserClient(url, anonKey);

  return supabaseInstance;
}
