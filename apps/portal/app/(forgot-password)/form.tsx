"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@crypto-pay/db/supabaseClient";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMessage("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/reset-password`,
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to send reset email. Please try again.");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 px-8 py-10 text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Check your email
            </h2>
            <p className="text-slate-600 mb-6">
              We sent a password reset link to{" "}
              <span className="font-medium text-slate-900">{email}</span>
            </p>
            <div className="space-y-3 text-sm text-slate-500">
              <p>The link will expire in 1 hour.</p>
              <p>
                Didn't receive the email?{" "}
                <button
                  onClick={() => {
                    setStatus("idle");
                    setEmail("");
                  }}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
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

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-7 w-7 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder="you@restaurant.com"
                className="mt-1.5 rounded-xl"
              />
            </div>

            {status === "error" && (
              <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Unable to send reset email</p>
                  <p className="text-red-500 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Remember your password?{" "}
          <Link href="/login" className="text-orange-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
