"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Shield, XCircle, Trash2 } from "lucide-react";
import { MFASetupDialog } from "@/components/account/mfa-setup-dialog";
import { AccountLoading } from "@/components/account/account-loading";
import { listMFAFactors, unenrollMFA, type MFAFactor } from "@/lib/mfa";

interface TwoFactorSettingsProps {
  userId: string;
}

export default function TwoFactorSettings({ userId }: TwoFactorSettingsProps) {
  const t = useTranslations("Account.twoFactor");
  const tCommon = useTranslations("Common");
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  const enabled = factors.some((f) => f.status === "verified");

  useEffect(() => {
    void loadFactors();
  }, []);

  async function loadFactors() {
    setLoading(true);
    setError("");
    try {
      const result = await listMFAFactors();
      if (result.success && result.factors) {
        setFactors(result.factors);
      } else {
        setError(result.error || t("loadFailed"));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(factorId: string) {
    setRemoving(factorId);
    setError("");
    try {
      const result = await unenrollMFA(factorId);
      if (result.success) {
        await loadFactors();
      } else {
        setError(result.error || t("removeFailed"));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("removeFailed"));
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return <AccountLoading />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center gap-3">
          <Shield
            className={`w-5 h-5 ${enabled ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {enabled ? t("enabled") : t("disabled")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {enabled ? t("enabledHint") : t("disabledHint")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSetupDialog(true)}
          disabled={enabled}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            enabled
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {t("enableButton")}
        </button>
      </div>

      {factors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("activeAuthenticators")}
          </h4>
          {factors.map((factor) => (
            <div
              key={factor.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{factor.friendly_name}</p>
                  <p className="text-xs text-gray-500">
                    {tCommon("added", {
                      date: new Date(factor.created_at).toLocaleDateString(),
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(factor.id)}
                disabled={removing === factor.id}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title={t("removeAuthenticator")}
              >
                {removing === factor.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-400">{t("info")}</p>
      </div>

      <MFASetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        onSuccess={loadFactors}
      />
    </div>
  );
}
