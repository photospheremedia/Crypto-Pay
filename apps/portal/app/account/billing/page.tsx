import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { CreditCard, Plus, Check, Building2, AlertCircle } from "lucide-react";

export default async function BillingPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get membership/tenant info
  const { data: membership } = await supabase
    .from("memberships")
    .select("tenant_id, role, tenants(id, name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const tenantId = membership?.tenant_id;
  const tenantName = (membership?.tenants as any)?.name;

  // Get subscription info if tenant exists
  let subscription = null;
  let paymentMethods: any[] = [];

  if (tenantId) {
    const { data: subData } = await supabase
      .from("billing_subscriptions")
      .select("status, current_period_end, cancel_at_period_end, plan_id")
      .eq("customer_id", tenantId)
      .maybeSingle();
    subscription = subData;

    const { data: pmData } = await supabase
      .from("billing_payment_methods")
      .select("id, brand, last4, exp_month, exp_year, is_default")
      .eq("customer_id", tenantId)
      .order("is_default", { ascending: false });
    paymentMethods = pmData || [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold">
          Billing
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Subscription & Payments
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your plan, payment methods, and billing history
        </p>
      </div>

      {/* No Organization Warning */}
      {!tenantId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">
                Organization Required
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Set up your organization to access billing features and subscription options.
              </p>
              <Link
                href="/account/setup"
                className="inline-flex items-center gap-2 mt-3 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition"
              >
                <Building2 className="h-4 w-4" />
                Set Up Organization
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Subscription
            </h2>
            {subscription?.status && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  subscription.status === "active"
                    ? "bg-orange-100 text-orange-600"
                    : subscription.status === "trialing"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    subscription.status === "active"
                      ? "bg-orange-500"
                      : subscription.status === "trialing"
                      ? "bg-blue-500"
                      : "bg-slate-500"
                  }`}
                />
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            )}
          </div>

          {subscription ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Current Plan</p>
                <p className="text-2xl font-bold text-orange-500 mt-1">
                  {subscription.plan_id || "Standard"}
                </p>
              </div>
              {subscription.current_period_end && (
                <p className="text-sm text-slate-600">
                  {subscription.cancel_at_period_end
                    ? "Cancels on "
                    : "Renews on "}
                  {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <CreditCard className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">No active subscription</p>
              <p className="text-xs text-slate-500 mt-1">
                Choose a plan to unlock premium features
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            <Link
              href="/pricing"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              {subscription ? "Change Plan" : "View Plans"}
            </Link>
            <Link
              href="/account/support"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Billing Support
            </Link>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Payment Methods
            </h2>
            {tenantId && (
              <button className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600">
                <Plus className="h-4 w-4" />
                Add New
              </button>
            )}
          </div>

          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    method.is_default
                      ? "border-orange-200 bg-orange-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {method.brand || "Card"} •••• {method.last4 || "0000"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Expires {method.exp_month || "--"}/{method.exp_year || "----"}
                      </p>
                    </div>
                  </div>
                  {method.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-600">
                      <Check className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <CreditCard className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">No payment methods</p>
              <p className="text-xs text-slate-500 mt-1">
                Add a card to enable subscriptions
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
            Payment methods are securely stored by our payment partner.
          </p>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Billing History
        </h2>
        <div className="text-center py-8">
          <p className="text-sm text-slate-600">No billing history yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Your invoices and receipts will appear here
          </p>
        </div>
      </div>
    </div>
  );
}