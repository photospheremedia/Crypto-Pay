"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

interface PasswordChangeFormProps {
  hasPassword: boolean;
  userEmail: string;
}

export default function PasswordChangeForm({ hasPassword, userEmail }: PasswordChangeFormProps) {
  const t = useTranslations("Account.password");
  const tCommon = useTranslations("Common");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: t("strengthWeak"), color: "text-red-600 dark:text-red-400" };
    if (strength <= 3) return { strength, label: t("strengthFair"), color: "text-yellow-600 dark:text-yellow-400" };
    if (strength <= 4) return { strength, label: t("strengthGood"), color: "text-blue-600 dark:text-blue-400" };
    return { strength, label: t("strengthStrong"), color: "text-green-600 dark:text-green-400" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (hasPassword && !currentPassword) {
      setError(t("currentRequired"));
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError(t("minLength"));
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("mismatch"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("updateFailed"));
      }

      setSuccessMessage(hasPassword ? t("updatedSuccess") : t("setSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/account/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("resetEmailFailed"));
      }

      setSuccessMessage(data.message || t("resetEmailSent"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("resetEmailFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {hasPassword && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("currentPassword")}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                aria-label={t("currentPassword")}
                placeholder={t("currentPasswordPlaceholder")}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("newPassword")}
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
              aria-label={t("newPassword")}
              placeholder={t("newPasswordPlaceholder")}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {newPassword && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength.strength <= 2 ? "bg-red-500" :
                      passwordStrength.strength <= 3 ? "bg-yellow-500" :
                      passwordStrength.strength <= 4 ? "bg-blue-500" : "bg-green-500"
                    }`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={passwordStrength.strength}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label={t("strengthLabel")}
                  />
                </div>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("strengthHint")}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("confirmPassword")}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
              aria-label={t("confirmPassword")}
              placeholder={t("confirmPasswordPlaceholder")}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {hasPassword ? t("updateButton") : t("setButton")}
          </button>

          {hasPassword && (
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              {tCommon("sendResetEmail")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
