"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { isAdminEmail } from "@/lib/admin-email";
import { sendWelcomeEmail } from "@/lib/email/triggers";

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

    if (membership || isAdminEmail(data.user.email)) {
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
  firstName: z.string().min(2, "First name is required").max(80),
  lastName: z.string().min(2, "Last name is required").max(80),
  phone: z.string().max(30).optional().default(""),
});

export async function signUp(
  _prevState: ActionState,
  formData: FormData,
) {
  const payload = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    firstName: String(formData.get("first_name") || ""),
    lastName: String(formData.get("last_name") || ""),
    phone: String(formData.get("phone") || ""),
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
    firstName,
    lastName,
    phone,
  } = parsed.data;
  const supabase = await getSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  let data: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"] | null = null;
  let error: Awaited<ReturnType<typeof supabase.auth.signUp>>["error"] | null = null;

  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback?next=/account/setup`,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          phone,
        },
      },
    });
    data = result.data;
    error = result.error;
  } catch (err) {
    return {
      error: "Could not create your account right now. Please try again in a moment.",
      email,
    };
  }

  if (error) {
    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.message.includes('already registered')) {
      userMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.message.includes('User already exists')) {
      userMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.message.includes('email rate limit exceeded')) {
      userMessage =
        'Signup emails are temporarily rate-limited. Please wait a bit and try again, or configure custom SMTP/rate limits in Supabase Auth settings.';
    }
    return { error: userMessage, email };
  }

  // Best-effort welcome email; auth flow should not fail if email sending fails.
  try {
    await sendWelcomeEmail(email, {
      firstName,
      dashboardUrl: `${appUrl}/account`,
    });
  } catch (welcomeError) {
    console.error("[Auth] Welcome email failed:", welcomeError);
  }

  if (!data.session) {
    redirect(`/login?created=1&verify=1&email=${encodeURIComponent(email)}`);
  }

  redirect("/account/setup");
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
