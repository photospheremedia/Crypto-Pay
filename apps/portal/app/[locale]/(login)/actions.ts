"use server";

import { z } from "zod";
import { hasLocale } from "next-intl";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { routing } from "@/i18n/routing";
import {
  ACCOUNT_WALLET_SETUP_PATH,
  accountWalletSetupConfirmUrl,
} from "@/lib/account/paths";
import { resolveRealmForUserEdge } from "@/lib/auth/resolve-realm-edge";
import {
  getHomePathForRealm,
  merchantOnboardingPath,
  sanitizePostAuthRedirect,
} from "@/lib/auth/user-realm";
import { scheduleEmailWork } from "@/lib/email/schedule";
import { runWelcomeEmailWorkflow } from "@/lib/email/workflows";
import { listUserMerchantWallets } from "@/lib/wallets/db";
import { getUserPreferredLocale } from "@/lib/i18n/locale-actions";
import {
  persistLocaleCookie,
  redirectAuthenticatedUser,
  resolveLocaleForAuthenticatedRedirect,
} from "@/lib/i18n/account-locale";
import { signOutForRealm } from "@/lib/auth/sign-out";
import { assertBotProtectionForForm } from "@/lib/security/bot-protection";

export type ActionState = {
  error?: string;
  success?: string;
  email?: string;
  needsEmailConfirmation?: boolean;
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

  const botCheck = await assertBotProtectionForForm({
    formData,
    limitType: "login",
    email: parsed.data.email,
  });
  if (!botCheck.ok) {
    return { error: botCheck.error, email: parsed.data.email };
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
      userMessage =
        'Please verify your email first. Check your inbox or request a new confirmation link below.';
      return { error: userMessage, email, needsEmailConfirmation: true };
    }
    return { error: userMessage, email };
  }

  if (!data.user) {
    redirect("/login");
  }

  const realm = await resolveRealmForUserEdge(supabase, data.user);

  revalidatePath("/", "layout");

  const preferredLocale = await getUserPreferredLocale(data.user.id);

  const target = redirectPath
    ? sanitizePostAuthRedirect(redirectPath, realm)
    : realm === "admin"
      ? getHomePathForRealm("admin")
      : (await listUserMerchantWallets(supabase, data.user.id)).length === 0
        ? merchantOnboardingPath()
        : getHomePathForRealm("merchant");

  const { href, locale } = resolveLocaleForAuthenticatedRedirect(
    target,
    preferredLocale,
  );
  await persistLocaleCookie(locale);
  redirectAuthenticatedUser(href, locale);
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

  const botCheck = await assertBotProtectionForForm({
    formData,
    limitType: "signup",
    email: parsed.data.email,
  });
  if (!botCheck.ok) {
    return { error: botCheck.error, email: parsed.data.email };
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
        emailRedirectTo: accountWalletSetupConfirmUrl(appUrl),
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

  const preferredLocale = String(formData.get("locale") || "");
  const communicationLocale = hasLocale(routing.locales, preferredLocale)
    ? preferredLocale
    : routing.defaultLocale;

  if (data.user) {
    const service = getSupabaseServiceClient();
    await service.from("user_settings").upsert(
      { user_id: data.user.id, language: communicationLocale },
      { onConflict: "user_id" },
    );
  }

  if (!data.session) {
    redirect(`/check-email?verify=1&email=${encodeURIComponent(email)}`);
  }

  const realm = await resolveRealmForUserEdge(supabase, data.session.user);
  const dashboardUrl =
    realm === "admin"
      ? `${appUrl}${getHomePathForRealm("admin")}`
      : `${appUrl}${merchantOnboardingPath()}`;

  scheduleEmailWork(`user.welcome.${email}`, () =>
    runWelcomeEmailWorkflow({
      email,
      firstName,
      dashboardUrl,
      locale: communicationLocale,
    }),
  );

  const target =
    realm === "admin" ? getHomePathForRealm("admin") : merchantOnboardingPath();
  await persistLocaleCookie(communicationLocale);
  redirectAuthenticatedUser(target, communicationLocale);
}

const resendConfirmationSchema = z.object({
  email: z.string().email().min(3).max(255),
});

/** Resend signup confirmation email (no account enumeration). */
export async function resendSignupConfirmation(
  email: string,
): Promise<ActionState> {
  const parsed = resendConfirmationSchema.safeParse({ email: email.trim() });
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await getSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: {
      emailRedirectTo: accountWalletSetupConfirmUrl(appUrl),
    },
  });

  if (error) {
    console.error("[resendSignupConfirmation]", error.message);
    if (error.message.includes("rate limit")) {
      return {
        error: "Too many emails sent. Please wait a few minutes and try again.",
      };
    }
  }

  return {
    success:
      "If an account exists for this email, we sent a new confirmation link.",
  };
}

/** Merchant account / app — requires merchant realm. */
export async function signOutMerchant() {
  return signOutForRealm("merchant");
}

/** Admin console — requires admin realm; writes audit log. */
export async function signOutAdmin() {
  return signOutForRealm("admin");
}

/** Login / signup pages — resolves realm from session. */
export async function signOut() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const realm = await resolveRealmForUserEdge(supabase, user);
  return signOutForRealm(realm);
}
