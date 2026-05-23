"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export type ActionState = {
  error?: string;
  success?: string;
  email?: string;
};

const signInSchema = z.object({
  email: z.string().email('Invalid email address').min(3).max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  redirect: z.string().optional(),
});

export async function signIn(
  _prevState: ActionState,
  formData: FormData,
) {
  const payload = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    redirect: String(formData.get("redirect") || "").trim() || undefined,
  };

  const parsed = signInSchema.safeParse(payload);
  if (!parsed.success) {
    return { 
      error: "Please enter a valid email and password.", 
      email: payload.email 
    };
  }

  const { email, password, redirect: redirectPath } = parsed.data;
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.message.includes('Invalid login credentials')) {
      userMessage = 'Email or password is incorrect.';
    } else if (error.message.includes('Email not confirmed')) {
      userMessage = 'Please verify your email first.';
    }
    return { error: userMessage, email };
  }

  // If explicit redirect path provided, use it
  if (redirectPath && redirectPath.startsWith("/")) {
    redirect(redirectPath);
  }

  // Check if user has admin/staff role in memberships table (authoritative source)
  if (data.user) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("status", "active")
      .in("role", ["rhs_admin", "admin", "owner", "manager", "staff"])
      .maybeSingle();

    if (membership) {
      // Staff/Admin user → admin dashboard
      redirect("/admin/dashboard");
    }
  }

  // Regular customer user → account dashboard
  redirect("/account");
}

const signUpSchema = z.object({
  email: z.string().email('Invalid email address').min(3).max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  orgName: z.string().min(2, 'Business name is required').max(120),
  orgType: z.string().min(2, 'Business type is required').max(80),
  orgTypeOther: z.string().max(120).optional().default(''),
  // Location fields - city and state required, others optional
  addressLine1: z.string().max(160).optional().default(''),
  addressLine2: z.string().max(160).optional(),
  city: z.string().min(2, 'City is required').max(80),
  state: z.string().min(2, 'State is required').max(80),
  postalCode: z.string().max(20).optional().default(''),
  country: z.string().max(80).optional().default('US'),
  phone: z.string().min(6, 'Phone number is required').max(30),
  // New fields for analytics
  estimatedLocations: z.string().optional().default('1'),
  howHeard: z.string().optional().default(''),
  howHeardOther: z.string().max(120).optional().default(''),
  newsletterConsent: z.string().optional().default('true').transform(v => v === 'true'),
});

export async function signUp(
  _prevState: ActionState,
  formData: FormData,
) {
  const payload = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    orgName: String(formData.get("org_name") || ""),
    orgType: String(formData.get("org_type") || ""),
    orgTypeOther: String(formData.get("org_type_other") || "") || undefined,
    addressLine1: String(formData.get("address_line1") || "") || undefined,
    addressLine2: String(formData.get("address_line2") || "") || undefined,
    city: String(formData.get("city") || ""),
    state: String(formData.get("state") || ""),
    postalCode: String(formData.get("postal_code") || "") || undefined,
    country: String(formData.get("country") || "US"),
    phone: String(formData.get("phone") || ""),
    // New analytics fields
    estimatedLocations: String(formData.get("estimated_locations") || "1"),
    howHeard: String(formData.get("how_heard") || "") || undefined,
    howHeardOther: String(formData.get("how_heard_other") || "") || undefined,
    newsletterConsent: String(formData.get("newsletter_consent") || "true"),
  };

  const parsed = signUpSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { 
      error: firstError.message || 'Please check your information and try again.', 
      email: payload.email 
    };
  }

  const {
    email,
    password,
    orgName,
    orgType,
    orgTypeOther,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phone,
    estimatedLocations,
    howHeard,
    howHeardOther,
    newsletterConsent,
  } = parsed.data;
  const supabase = await getSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/account/setup`,
      data: {
        org_name: orgName,
        org_type: orgType,
        org_type_other: orgTypeOther || "",
        address_line1: addressLine1 || "",
        address_line2: addressLine2 || "",
        city,
        state,
        postal_code: postalCode || "",
        country: country || "US",
        phone,
        estimated_locations: estimatedLocations,
        how_heard_about_us: howHeard || "",
        how_heard_other: howHeardOther || "",
        newsletter_consent: newsletterConsent,
      },
    },
  });

  if (error) {
    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.message.includes('already registered')) {
      userMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.message.includes('User already exists')) {
      userMessage = 'This email is already registered. Please sign in instead.';
    }
    return { error: userMessage, email };
  }

  if (!data.session) {
    return {
      success: "Account created! Check your email to verify your account.",
      email,
    };
  }

  redirect("/account/setup");
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithOAuth(
  provider: 'google',
  mode: 'signin' | 'signup' = 'signin',
  redirectPath?: string,
  priceId?: string,
): Promise<{ error?: string; url?: string }> {
  const supabase = await getSupabaseServerClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  // Build callback URL with mode and other parameters
  const callbackUrl = new URL('/auth/callback', baseUrl);
  callbackUrl.searchParams.set('mode', mode);
  if (redirectPath) {
    callbackUrl.searchParams.set('next', redirectPath);
  }
  if (priceId) {
    callbackUrl.searchParams.set('priceId', priceId);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: 'offline',
        prompt: mode === 'signup' ? 'consent' : 'select_account',
      },
    },
  });

  if (error) {
    return {
      error: `Failed to ${mode === 'signup' ? 'sign up' : 'sign in'} with ${provider}. ${error.message}`,
    };
  }

  // Return the OAuth URL for the client to handle the redirect
  // This ensures cookies are properly set before the redirect happens
  if (data?.url) {
    return { url: data.url };
  }

  return { error: 'OAuth initialization failed' };
}
