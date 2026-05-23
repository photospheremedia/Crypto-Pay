'use client';

import Link from 'next/link';
import { useActionState, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { getSupabaseBrowserClientOptional } from '@crypto-pay/db/supabaseClient';
import { signIn, signUp, type ActionState } from './actions';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? searchParams.get('redirectTo');
  const priceId = searchParams.get('priceId');
  const accountCreated = searchParams.get('created') === '1';
  const verificationPending = searchParams.get('verify') === '1';
  const pendingEmail = searchParams.get('email');
  const [existingUser, setExistingUser] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );
  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseBrowserClientOptional();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      setExistingUser(!!data.user);
    };
    checkUser();
  }, []);

  const buildAuthHref = (target: '/login' | '/signup') => {
    const params = new URLSearchParams();
    if (redirect) params.set('redirect', redirect);
    if (priceId) params.set('priceId', priceId);
    const query = params.toString();
    return query ? `${target}?${query}` : target;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Main Heading */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {mode === 'signin'
              ? (existingUser ? 'Welcome back' : 'Sign in to your account')
              : 'Create your account'}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            {mode === 'signin' ? (
              <>
                New to Crypto Pay?{' '}
                <Link
                  href={buildAuthHref('/signup')}
                  className="font-semibold text-emerald-600 hover:text-cyan-600 transition"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  href={buildAuthHref('/login')}
                  className="font-semibold text-emerald-600 hover:text-cyan-600 transition"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 px-6 py-8 sm:px-10 sm:py-12">
          {mode === 'signin' && accountCreated && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm text-emerald-800">
                <strong>Account created.</strong>{" "}
                {verificationPending ? (
                  pendingEmail ? (
                    <>We sent a confirmation link to <strong>{pendingEmail}</strong>. Please verify your email, then sign in.</>
                  ) : (
                    <>We sent a confirmation email. Please verify your email, then sign in.</>
                  )
                ) : pendingEmail ? (
                  `Sign in with ${pendingEmail} to continue.`
                ) : (
                  "Sign in to continue to your dashboard."
                )}
              </p>
            </div>
          )}
          {existingUser && mode === 'signin' && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm text-emerald-800">
                <strong>You are already signed in.</strong>{' '}
                Go to your dashboard or sign out to switch accounts.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Continue to dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = getSupabaseBrowserClientOptional();
                    if (supabase) await supabase.auth.signOut();
                    setExistingUser(false);
                  }}
                  className="inline-flex items-center rounded-full border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
          {existingUser && mode === 'signup' && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800">
                <strong>Already logged in?</strong> You're currently signed in. If you want to create a new account with a different email, please{' '}
                <button
                  onClick={async () => {
                    const supabase = getSupabaseBrowserClientOptional();
                    if (supabase) await supabase.auth.signOut();
                    setExistingUser(false);
                  }}
                  className="font-semibold underline hover:text-amber-900"
                >
                  sign out first
                </button>.
              </p>
            </div>
          )}
          {mode === 'signup' && !existingUser && (
            <div className="mb-4 rounded-lg bg-cyan-50 border border-cyan-200 p-4">
              <p className="text-sm text-blue-800">
                <strong>New here?</strong> Create your account with your email and password to get started.
              </p>
            </div>
          )}

          {/* Email/Password Form - Only show if not using OAuth signup */}
          <form className="space-y-6 mt-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            {mode === "signup" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      required
                      maxLength={80}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      autoComplete="family-name"
                      required
                      maxLength={80}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state.email}
                  required
                  maxLength={50}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            {mode === "signup" && (
              <div>
                <Label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone (optional)
                </Label>
                <div className="mt-1">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            )}

            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  required
                  minLength={8}
                  maxLength={100}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
              {mode === 'signin' && (
                <Link
                  href="/forgot-password"
                  className="mt-2 text-sm text-emerald-600 hover:text-cyan-600"
                >
                  Forgot your password?
                </Link>
              )}
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <span>⚠️</span>
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
                <span>✓</span>
                {state.success}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-slate-500">
          By continuing, you agree to our{' '}
          <Link href="/terms-of-service" className="text-emerald-600 hover:text-cyan-600">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="text-emerald-600 hover:text-cyan-600">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
