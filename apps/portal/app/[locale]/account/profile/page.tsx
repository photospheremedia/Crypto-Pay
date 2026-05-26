import { ProfileForm } from "./profile-form";
import { Mail } from "lucide-react";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { getMerchantProfileBundle } from "@/lib/account/merchant-data";

export const metadata = {
  title: "Profile - Account Settings",
  description: "Manage your profile information and personal details",
};

export default async function ProfilePage() {
  const { user, profile } = await getMerchantProfileBundle();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="mt-2 text-slate-600 leading-relaxed">
          Manage your profile information and customize how you appear to others on the platform
        </p>
      </div>

      <div className="rounded-xl border border-slate-200/60 bg-linear-to-br from-white to-slate-50/50 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <AvatarUpload
            currentAvatarUrl={profile?.avatar_url}
            userName={profile?.full_name || user.email || undefined}
          />
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Profile Photo</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload a profile photo to personalize your account. Recommended size is at least 400x400 pixels.
              Supported formats: JPG, PNG, WebP, GIF (max 5MB).
            </p>
          </div>
        </div>
      </div>

      <ProfileForm user={user} profile={profile} />

      <div className="rounded-xl border border-slate-200/60 bg-linear-to-br from-white to-slate-50/50 p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Mail className="h-5 w-5 text-slate-600" />
          Account Information
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="email"
                value={user.email}
                disabled
                title="Email address (cannot be changed here)"
                aria-label="Email address"
                className="flex-1 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-slate-600 text-sm font-medium"
              />
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">
                ✓ Verified
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              To update your email address, please visit the Security settings page
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Member Since
            </label>
            <input
              type="text"
              value={new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              disabled
              title="Account creation date"
              aria-label="Member since date"
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-slate-600 text-sm font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
