'use client';

import { useActionState, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { getSupabaseBrowserClientOptional } from '@crypto-pay/db/supabaseClient';
import { signIn, signUp, type ActionState } from './actions';
import { SecurityCheckField } from '@/components/auth/security-check-field';
import { isTurnstileEnabled } from '@/lib/security/turnstile-config';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const t = useTranslations('Auth');
  const tCommon = useTranslations('Common');
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? searchParams.get('redirectTo');
  const priceId = searchParams.get('priceId');
  const accountCreated = searchParams.get('created') === '1';
  const verificationPending = searchParams.get('verify') === '1';
  const pendingEmail = searchParams.get('email');
  const [existingUser, setExistingUser] = useState(false);
  const [securityCheckPassed, setSecurityCheckPassed] = useState(
    () => !isTurnstileEnabled(),
  );
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' },
  );

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseBrowserClientOptional();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      setExistingUser(!!data.user);
    };
    void checkUser();
  }, []);

  const buildAuthHref = (target: '/login' | '/signup') => {
    const params = new URLSearchParams();
    if (redirect) params.set('redirect', redirect);
    if (priceId) params.set('priceId', priceId);
    const query = params.toString();
    return query ? `${target}?${query}` : target;
  };

  const signInTitle =
    mode === 'signin'
      ? existingUser
        ? t('welcomeBack')
        : t('signInTitle')
      : t('createAccountTitle');

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {signInTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            {mode === 'signin' ? (
              <>
                {t('newToBrand')}{' '}
                <Link
                  href={buildAuthHref('/signup')}
                  className="font-semibold text-emerald-600 hover:text-emerald-600 transition"
                >
                  {t('createAccountLink')}
                </Link>
              </>
            ) : (
              <>
                {t('alreadyHaveAccount')}{' '}
                <Link
                  href={buildAuthHref('/login')}
                  className="font-semibold text-emerald-600 hover:text-emerald-600 transition"
                >
                  {t('signInLink')}
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 px-6 py-8 sm:px-10 sm:py-12">
          {mode === 'signin' && accountCreated && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm text-emerald-800">
                <strong>{t('accountCreated')}</strong>{' '}
                {verificationPending ? (
                  pendingEmail ? (
                    t('verifyEmailWith', { email: pendingEmail })
                  ) : (
                    t('verifyEmailGeneric')
                  )
                ) : pendingEmail ? (
                  t('signInWithEmail', { email: pendingEmail })
                ) : (
                  t('signInToDashboard')
                )}
              </p>
            </div>
          )}
          {existingUser && mode === 'signin' && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm text-emerald-800">
                <strong>{t('alreadySignedIn')}</strong> {t('signedInHint')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  {t('continueToDashboard')}
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
                  {t('signOut')}
                </button>
              </div>
            </div>
          )}
          {existingUser && mode === 'signup' && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800">
                <strong>{t('alreadyLoggedInSignup')}</strong> {t('signedInCreateNew')}{' '}
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = getSupabaseBrowserClientOptional();
                    if (supabase) await supabase.auth.signOut();
                    setExistingUser(false);
                  }}
                  className="font-semibold underline hover:text-amber-900"
                >
                  {t('signOutFirst')}
                </button>
                .
              </p>
            </div>
          )}
          {mode === 'signup' && !existingUser && (
            <div className="mb-4 rounded-lg bg-cyan-50 border border-cyan-200 p-4">
              <p className="text-sm text-blue-800">
                <strong>{t('newHere')}</strong> {t('newHereHint')}
              </p>
            </div>
          )}

          <form className="relative space-y-6 mt-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    {t('firstName')}
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
                      placeholder={t('firstName')}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    {t('lastName')}
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
                      placeholder={t('lastName')}
                    />
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
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
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t('phoneOptional')}
                </Label>
                <div className="mt-1">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                    placeholder={t('phonePlaceholder')}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  maxLength={100}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
              {mode === 'signin' && (
                <Link
                  href="/forgot-password"
                  className="mt-2 text-sm text-emerald-600 hover:text-emerald-600"
                >
                  {t('forgotPassword')}
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

            <SecurityCheckField
              resetTrigger={state?.error}
              onCanSubmitChange={setSecurityCheckPassed}
            />

            <div className="pt-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-transparent bg-linear-to-r from-emerald-500 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                disabled={pending || !securityCheckPassed}
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : mode === 'signin' ? (
                  t('signIn')
                ) : (
                  t('signUp')
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          {t('termsFooter')}{' '}
          <Link href="/terms-of-service" className="text-emerald-600 hover:text-emerald-600">
            {t('termsOfService')}
          </Link>{' '}
          {t('and')}{' '}
          <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-600">
            {t('privacyPolicy')}
          </Link>
        </p>
      </div>
    </div>
  );
}
