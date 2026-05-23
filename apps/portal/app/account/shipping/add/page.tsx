"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@crypto-pay/db/supabaseClient";

export default function AddAddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = getSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Update user_profiles with the address
      const { error: updateError } = await supabase
        .from("user_profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: formData.get("name") as string,
          phone: formData.get("phone") as string,
          address_line1: formData.get("address_line1") as string,
          address_line2: formData.get("address_line2") as string || null,
          city: formData.get("city") as string,
          state: formData.get("state") as string,
          postal_code: formData.get("postal_code") as string,
          country: formData.get("country") as string,
        });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/account/shipping");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/account/shipping"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Addresses
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-100 p-2">
            <MapPin className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add New Address</h1>
            <p className="text-sm text-slate-600">
              Enter your delivery address details
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="John Doe"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Address Line 1
              </label>
              <input
                name="address_line1"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="123 Main Street"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Address Line 2 <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                name="address_line2"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Apt, Suite, Unit, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                City
              </label>
              <input
                name="city"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                State / Province
              </label>
              <input
                name="state"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Postal Code
              </label>
              <input
                name="postal_code"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="10001"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1.5">
                Country
              </label>
              <select
                id="country"
                name="country"
                required
                defaultValue="United States"
                aria-label="Select country"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              name="is_default"
              id="is_default"
              className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="is_default" className="text-sm text-slate-700">
              Set as default shipping address
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/account/shipping"
              className="flex-1 rounded-xl border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
