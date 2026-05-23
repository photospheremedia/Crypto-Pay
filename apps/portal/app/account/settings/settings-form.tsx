"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface SettingsFormProps {
  user: User;
  profile: any;
  settings: any;
}

export function SettingsForm({ user, profile, settings }: SettingsFormProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profileData, setProfileData] = useState({
    company_name: profile?.company_name || "",
    phone: profile?.phone || "",
    business_type: profile?.business_type || "restaurant",
    number_of_locations: profile?.number_of_locations || 1,
  });

  const [settingsData, setSettingsData] = useState({
    theme: settings?.theme || "light",
    language: settings?.language || "en",
    currency: settings?.currency || "USD",
    email_notifications: settings?.email_notifications ?? true,
    sms_notifications: settings?.sms_notifications ?? false,
    order_updates: settings?.order_updates ?? true,
    marketing_emails: settings?.marketing_emails ?? true,
    delivery_auto_accept: settings?.delivery_auto_accept ?? false,
    auto_reorder_enabled: settings?.auto_reorder_enabled ?? false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from("user_settings")
        .update(settingsData)
        .eq("user_id", user.id);

      if (settingsError) throw settingsError;

      setMessage({ type: "success", text: "Settings saved successfully!" });
      router.refresh();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-orange-50 text-orange-800 border border-orange-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-500"
            />
          </div>

          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-slate-700">
              Company Name
            </label>
            <input
              type="text"
              id="company_name"
              value={profileData.company_name}
              onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="business_type" className="block text-sm font-medium text-slate-700">
              Business Type
            </label>
            <select
              id="business_type"
              value={profileData.business_type}
              onChange={(e) => setProfileData({ ...profileData, business_type: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Café</option>
              <option value="bakery">Bakery</option>
              <option value="catering">Catering</option>
              <option value="food_truck">Food Truck</option>
              <option value="hotel">Hotel</option>
              <option value="bar">Bar</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="number_of_locations" className="block text-sm font-medium text-slate-700">
              Number of Locations
            </label>
            <input
              type="number"
              id="number_of_locations"
              min="1"
              value={profileData.number_of_locations}
              onChange={(e) =>
                setProfileData({ ...profileData, number_of_locations: parseInt(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-slate-700">
              Theme
            </label>
            <select
              id="theme"
              value={settingsData.theme}
              onChange={(e) => setSettingsData({ ...settingsData, theme: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-slate-700">
              Language
            </label>
            <select
              id="language"
              value={settingsData.language}
              onChange={(e) => setSettingsData({ ...settingsData, language: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-700">
              Currency
            </label>
            <select
              id="currency"
              value={settingsData.currency}
              onChange={(e) => setSettingsData({ ...settingsData, currency: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="email_notifications" className="font-medium text-slate-900">
                Email Notifications
              </label>
              <p className="text-sm text-slate-600">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              id="email_notifications"
              checked={settingsData.email_notifications}
              onChange={(e) =>
                setSettingsData({ ...settingsData, email_notifications: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="sms_notifications" className="font-medium text-slate-900">
                SMS Notifications
              </label>
              <p className="text-sm text-slate-600">Receive notifications via SMS</p>
            </div>
            <input
              type="checkbox"
              id="sms_notifications"
              checked={settingsData.sms_notifications}
              onChange={(e) =>
                setSettingsData({ ...settingsData, sms_notifications: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="order_updates" className="font-medium text-slate-900">
                Order Updates
              </label>
              <p className="text-sm text-slate-600">Get notified about order status changes</p>
            </div>
            <input
              type="checkbox"
              id="order_updates"
              checked={settingsData.order_updates}
              onChange={(e) =>
                setSettingsData({ ...settingsData, order_updates: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="marketing_emails" className="font-medium text-slate-900">
                Marketing Emails
              </label>
              <p className="text-sm text-slate-600">Receive promotional content and offers</p>
            </div>
            <input
              type="checkbox"
              id="marketing_emails"
              checked={settingsData.marketing_emails}
              onChange={(e) =>
                setSettingsData({ ...settingsData, marketing_emails: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>
      </section>

      {/* Automation */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Automation</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="delivery_auto_accept" className="font-medium text-slate-900">
                Auto-Accept Delivery Orders
              </label>
              <p className="text-sm text-slate-600">Automatically accept orders from delivery platforms</p>
            </div>
            <input
              type="checkbox"
              id="delivery_auto_accept"
              checked={settingsData.delivery_auto_accept}
              onChange={(e) =>
                setSettingsData({ ...settingsData, delivery_auto_accept: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="auto_reorder_enabled" className="font-medium text-slate-900">
                Enable Auto-Reordering
              </label>
              <p className="text-sm text-slate-600">Automatically reorder supplies when stock is low</p>
            </div>
            <input
              type="checkbox"
              id="auto_reorder_enabled"
              checked={settingsData.auto_reorder_enabled}
              onChange={(e) =>
                setSettingsData({ ...settingsData, auto_reorder_enabled: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
