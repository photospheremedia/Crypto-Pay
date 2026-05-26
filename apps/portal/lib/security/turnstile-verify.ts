/**
 * Server-side Turnstile verification via Supabase Edge Function.
 */
export async function verifyTurnstileToken(
  token: string,
  ip?: string,
): Promise<boolean> {
  const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;

  if (!functionsUrl) {
    console.warn(
      "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL not set. Skipping Turnstile verification.",
    );
    return true;
  }

  try {
    const response = await fetch(`${functionsUrl}/verify-turnstile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, remoteIp: ip }),
    });

    if (!response.ok) {
      console.error("Turnstile verification error:", response.status);
      return false;
    }

    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
