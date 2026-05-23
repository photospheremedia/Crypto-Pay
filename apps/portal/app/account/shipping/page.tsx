import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { Plus, MapPin, Edit2, Trash2, Check } from "lucide-react";

export default async function ShippingPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile with addresses
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get tenant/customer profile if exists
  const { data: membership } = await supabase
    .from("memberships")
    .select("tenant_id, tenants(id, name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const tenantId = membership?.tenant_id;

  // Get business shipping address if tenant exists
  let businessProfile = null;
  if (tenantId) {
    const { data } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("customer_id", tenantId)
      .maybeSingle();
    businessProfile = data;
  }

  // Build addresses array
  const addresses = [];

  // Add personal address from user_profiles
  if (profile?.address_line1) {
    addresses.push({
      id: "personal",
      type: "Personal",
      name: profile.full_name || user.email?.split("@")[0],
      line1: profile.address_line1,
      line2: profile.address_line2,
      city: profile.city,
      state: profile.state,
      postal_code: profile.postal_code,
      country: profile.country || "United States",
      phone: profile.phone,
      is_default: true,
    });
  }

  // Add business address from customer_profiles
  if (businessProfile?.address_line1) {
    addresses.push({
      id: "business",
      type: "Business",
      name: (membership?.tenants as any)?.name || "Business",
      line1: businessProfile.address_line1,
      line2: businessProfile.address_line2,
      city: businessProfile.city,
      state: businessProfile.state,
      postal_code: businessProfile.postal_code,
      country: businessProfile.country || "United States",
      phone: businessProfile.phone,
      is_default: false,
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-500 font-semibold">
              Shipping
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Delivery Addresses
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage where your orders are delivered
            </p>
          </div>
          <Link
            href="/account/shipping/add"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </Link>
        </div>
      </div>

      {/* Addresses */}
      {addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                address.is_default
                  ? "border-orange-300 ring-1 ring-orange-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      address.type === "Business"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    {address.type}
                  </span>
                  {address.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">
                      <Check className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/account/shipping/edit/${address.id}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <p className="font-semibold text-slate-900">{address.name}</p>
              <p className="text-sm text-slate-600 mt-1">{address.line1}</p>
              {address.line2 && (
                <p className="text-sm text-slate-600">{address.line2}</p>
              )}
              <p className="text-sm text-slate-600">
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p className="text-sm text-slate-600">{address.country}</p>
              {address.phone && (
                <p className="text-sm text-slate-500 mt-2">{address.phone}</p>
              )}

              {!address.is_default && (
                <button className="mt-4 text-sm font-medium text-orange-500 hover:text-orange-600">
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No addresses yet
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Add a shipping address to get started with your orders.
          </p>
          <Link
            href="/account/shipping/add"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </Link>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your default address will be automatically selected at checkout.
          You can add multiple addresses and choose between them when placing orders.
        </p>
      </div>
    </div>
  );
}
