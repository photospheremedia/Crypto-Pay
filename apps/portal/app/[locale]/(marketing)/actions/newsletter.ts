"use server";

import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export type NewsletterState = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function subscribeToNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const firstName = String(formData.get("first_name") || "").trim();
  const companyName = String(formData.get("company_name") || "").trim();
  const listType = String(formData.get("list_type") || "weekly_ops_brief");
  const source = String(formData.get("source") || "website");

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await getSupabaseServerClient();

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email)
    .eq("list_type", listType)
    .single();

  if (existing) {
    if (existing.status === "active") {
      return { success: true, message: "You're already subscribed!" };
    }
    // Reactivate if previously unsubscribed
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ 
        status: "active", 
        unsubscribed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Newsletter resubscribe error:", error);
      return { error: "Something went wrong. Please try again." };
    }
    return { success: true, message: "Welcome back! You've been resubscribed." };
  }

  // Insert new subscriber
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    first_name: firstName || null,
    company_name: companyName || null,
    list_type: listType,
    source,
    status: "active",
    confirmed: false, // Will be confirmed via email
  });

  if (error) {
    console.error("Newsletter subscribe error:", error);
    if (error.code === "23505") {
      return { success: true, message: "You're already subscribed!" };
    }
    return { error: "Something went wrong. Please try again." };
  }

  // TODO: Send confirmation email via Resend/SendGrid
  // await sendConfirmationEmail(email, firstName);

  return {
    success: true,
    message: "Thanks for subscribing! Check your inbox for a confirmation email.",
  };
}

export async function unsubscribeFromNewsletter(
  email: string,
  listType: string = "weekly_ops_brief",
  reason?: string
): Promise<NewsletterState> {
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
      unsubscribe_reason: reason || null,
    })
    .eq("email", email.toLowerCase())
    .eq("list_type", listType);

  if (error) {
    console.error("Newsletter unsubscribe error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true, message: "You've been unsubscribed successfully." };
}
