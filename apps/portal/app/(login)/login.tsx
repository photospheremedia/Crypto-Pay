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
                  href="/signup"
                  className="font-semibold text-emerald-600 hover:text-cyan-600 transition"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  href="/login"
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
                <strong>New here?</strong> Create your account with your business details and email below.
              </p>
            </div>
          )}

          {/* Email/Password Form - Only show if not using OAuth signup */}
          <form className="space-y-6 mt-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            {mode === 'signup' ? (
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="org_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organization name
                  </Label>
                  <div className="mt-1">
                    <Input
                      id="org_name"
                      name="org_name"
                      type="text"
                      required
                      maxLength={120}
                      className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                      placeholder="Your business name"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="org_type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organization type
                  </Label>
                  <div className="mt-1">
                    <select
                      id="org_type"
                      name="org_type"
                      required
                      aria-label="Organization type"
                      className="w-full rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select one
                      </option>
                      <option>Online merchant</option>
                      <option>SaaS / Platform</option>
                      <option>Crypto exchange</option>
                      <option>Agency / Integrator</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="address_line1"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address line 1
                    </Label>
                    <Input
                      id="address_line1"
                      name="address_line1"
                      type="text"
                      required
                      maxLength={160}
                      className="mt-1 rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="address_line2"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address line 2
                    </Label>
                    <Input
                      id="address_line2"
                      name="address_line2"
                      type="text"
                      maxLength={160}
                      className="mt-1 rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Suite, unit, floor (optional)"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required
                      maxLength={80}
                      className="mt-1 rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700"
                    >
                      State / Region
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      required
                      maxLength={80}
                      className="mt-1 rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="postal_code"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Postal code
                    </Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      required
                      maxLength={20}
                      className="mt-1 rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      required
                      maxLength={80}
                      className="mt-1 rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      maxLength={30}
                      className="mt-1 rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                </div>
              </div>
            ) : null}
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
