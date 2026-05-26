"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@crypto-pay/db/supabaseClient";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "invalid">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let isMounted = true;

    const checkSession = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) return;
      if (!user || error) {
        setStatus("invalid");
      }
      setCheckingSession(false);
    };

    checkSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      if (!isMounted) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setStatus("idle");
      }
      setCheckingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong) {
      setStatus("error");
      setErrorMessage("Password does not meet the requirements.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to reset password. Please try again.");
      } else {
        setStatus("success");
        // Sign out after password reset so user has to login with new password
        await supabase.auth.signOut();
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
        <LoadingIndicator message="verifyingResetLink" size="lg" />
      </div>
    );
  }

  // Invalid/expired link state
  if (status === "invalid") {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 px-8 py-10 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Invalid or expired link
            </h2>
            <p className="text-slate-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/forgot-password"
                className="flex-1 inline-flex justify-center items-center px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 transition"
              >
                Request new link
              </Link>
              <Link
                href="/login"
                className="flex-1 inline-flex justify-center items-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 px-8 py-10 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Password reset successful!
            </h2>
            <p className="text-slate-600 mb-6">
              Your password has been updated. Redirecting you to sign in...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {tCommon("redirecting")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Create new password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your new password must be different from your previous password.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                New password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            {password.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-medium text-slate-700 mb-2">Password requirements:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    8+ characters
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Lowercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Number
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm new password"
                  className={`rounded-xl pr-10 ${
                    confirmPassword.length > 0 && !passwordsMatch
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {status === "error" && (
              <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Password reset failed</p>
                  <p className="text-red-500 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !isPasswordStrong || !passwordsMatch}
              className="w-full rounded-xl bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  {tCommon("resettingPassword")}
                </>
              ) : (
                t("resetPassword")
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
