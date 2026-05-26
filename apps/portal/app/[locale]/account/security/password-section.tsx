"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { Eye, EyeOff, Loader2, Check, X, AlertCircle } from "lucide-react";

function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface PasswordSectionProps {
  user: User;
  hasPassword: boolean;
  providers: string[];
}

export function PasswordSection({ user, hasPassword, providers }: PasswordSectionProps) {
  const t = useTranslations("Account.password");
  const tCommon = useTranslations("Common");
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const strength = calculatePasswordStrength(formData.newPassword);
  const getStrengthColor = () => {
    if (strength < 40) return "bg-red-500";
    if (strength < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };
  const getStrengthLabel = () => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Good";
    return "Strong";
  };

  // Password requirements check
  const requirements = [
    { label: "At least 8 characters", met: formData.newPassword.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.newPassword) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(formData.newPassword) },
    { label: "Contains number", met: /[0-9]/.test(formData.newPassword) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(formData.newPassword) },
  ];

  const isOAuthOnly = providers.length > 0 && !hasPassword;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (strength < 70) {
      setMessage({ type: "error", text: "Please choose a stronger password" });
      setLoading(false);
      return;
    }

    try {
      if (hasPassword) {
        // User has existing password, verify current password first
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: formData.currentPassword,
        });

        if (signInError) {
          throw new Error("Current password is incorrect");
        }
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: "success", text: hasPassword ? "Password changed successfully!" : "Password set successfully! You can now sign in with email and password." });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update password" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {isOAuthOnly && (
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900">OAuth Sign-In Only</h4>
              <p className="mt-1 text-sm text-blue-700">
                You're currently signing in with {providers.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ")}. 
                Set a password below to enable email/password sign-in as an additional option.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-6">
        {message && (
          <div
            className={`rounded-lg p-4 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {hasPassword && (
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                required
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
            {hasPassword ? "New Password" : "Set Password"}
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {formData.newPassword && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strength}%` }}
                    role="progressbar"
                    aria-valuenow={strength}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Password strength"
                  ></div>
                </div>
                <span className="text-xs font-medium text-slate-700">{getStrengthLabel()}</span>
              </div>

              <div className="space-y-1">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {req.met ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-slate-300" />
                    )}
                    <span className={req.met ? "text-slate-700" : "text-slate-400"}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <X className="h-3.5 w-3.5" />
              Passwords do not match
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? tCommon("updating") : hasPassword ? t("updateButton") : t("setButton")}
          </button>
        </div>
      </form>
    </div>
  );
}
