import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { createOrganization } from "./actions";

export default async function AccountSetupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    redirect("/account");
  }

  const metadata = user.user_metadata || {};

  const errorMessage = resolvedSearchParams?.error;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
          Organization setup
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Tell us about your business.
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          We use this to configure integrations, fulfillment, and billing.
        </p>
        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(errorMessage)}
          </div>
        ) : null}

        <form className="mt-8 space-y-6" action={createOrganization}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Organization name
              </label>
              <input
                name="org_name"
                defaultValue={metadata.org_name || ""}
                required
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Organization type
              </label>
              <input
                name="org_type"
                defaultValue={metadata.org_type || ""}
                required
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Legal name (optional)
              </label>
              <input
                name="legal_name"
                defaultValue={metadata.legal_name || ""}
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Trade name (optional)
              </label>
              <input
                name="trade_name"
                defaultValue={metadata.trade_name || ""}
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Address line 1
              </label>
              <input
                name="address_line1"
                defaultValue={metadata.address_line1 || ""}
                required
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Address line 2
              </label>
              <input
                name="address_line2"
                defaultValue={metadata.address_line2 || ""}
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <input
                name="city"
                defaultValue={metadata.city || ""}
                required
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                State / Region
              </label>
              <input
                name="state"
                defaultValue={metadata.state || ""}
                required
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Postal code
              </label>
              <input
                name="postal_code"
                defaultValue={metadata.postal_code || ""}
                required
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                name="country"
                defaultValue={metadata.country || ""}
                required
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                name="phone"
                defaultValue={metadata.phone || ""}
                required
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Website (optional)
              </label>
              <input
                name="website"
                defaultValue={metadata.website || ""}
                className="mt-1 w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 hover:bg-orange-600"
          >
            Finish setup
          </button>
        </form>
      </div>
    </div>
  );
}
