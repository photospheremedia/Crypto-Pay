'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { getSupabaseBrowserClientOptional } from '@crypto-pay/db/supabaseClient';
import { signIn, signUp, type ActionState } from './actions';
import { HoneypotField } from '@/components/auth/honeypot-field';
import { ResendConfirmationButton } from '@/components/auth/resend-confirmation-button';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' },
  );

  const title = useMemo(() => {
    if (mode === 'signin') return existingUser ? t('welcomeBack') : t('signInTitle');
    return t('createAccountTitle');
  }, [existingUser, mode, t]);

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

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] items-center justify-center bg-linear-to-br from-slate-50 via-white to-emerald-50/30 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="border-slate-200/80 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl tracking-tight sm:text-3xl">{title}</CardTitle>
            <CardDescription>
              {mode === 'signin' ? (
                <>
                  {t('newToBrand')}{' '}
                  <Link href={buildAuthHref('/signup')} className="font-medium text-emerald-700 hover:text-emerald-600">
                    {t('createAccountLink')}
                  </Link>
                </>
              ) : (
                <>
                  {t('alreadyHaveAccount')}{' '}
                  <Link href={buildAuthHref('/login')} className="font-medium text-emerald-700 hover:text-emerald-600">
                    {t('signInLink')}
                  </Link>
                </>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {mode === 'signin' && accountCreated ? (
              <Alert className="border-emerald-200/70 bg-emerald-50/60 text-emerald-950">
                <CheckCircle2 />
                <AlertTitle>{t('accountCreated')}</AlertTitle>
                <AlertDescription className="text-emerald-900/80">
                  <p>
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
                  {verificationPending && pendingEmail ? (
                    <div className="pt-2">
                      <ResendConfirmationButton email={pendingEmail} />
                    </div>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}

            {existingUser && mode === 'signin' ? (
              <Alert className="border-emerald-200/70 bg-emerald-50/60 text-emerald-950">
                <CheckCircle2 />
                <AlertTitle>{t('alreadySignedIn')}</AlertTitle>
                <AlertDescription className="text-emerald-900/80">
                  <p>{t('signedInHint')}</p>
                  <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                    <Button asChild className="rounded-full">
                      <Link href="/account">{t('continueToDashboard')}</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={async () => {
                        const supabase = getSupabaseBrowserClientOptional();
                        if (supabase) await supabase.auth.signOut();
                        setExistingUser(false);
                      }}
                    >
                      <LogOut data-icon="inline-start" />
                      {t('signOut')}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : null}

            {existingUser && mode === 'signup' ? (
              <Alert className="border-amber-200/70 bg-amber-50/60 text-amber-950">
                <AlertCircle />
                <AlertTitle>{t('alreadyLoggedInSignup')}</AlertTitle>
                <AlertDescription className="text-amber-900/80">
                  <p>
                    {t('signedInCreateNew')}{' '}
                    <button
                      type="button"
                      onClick={async () => {
                        const supabase = getSupabaseBrowserClientOptional();
                        if (supabase) await supabase.auth.signOut();
                        setExistingUser(false);
                      }}
                      className="font-medium underline underline-offset-2"
                    >
                      {t('signOutFirst')}
                    </button>
                    .
                  </p>
                </AlertDescription>
              </Alert>
            ) : null}

            {mode === 'signup' && !existingUser ? (
              <Alert className="border-cyan-200/70 bg-cyan-50/60 text-cyan-950">
                <CheckCircle2 />
                <AlertTitle>{t('newHere')}</AlertTitle>
                <AlertDescription className="text-cyan-900/80">{t('newHereHint')}</AlertDescription>
              </Alert>
            ) : null}

            <form className="flex flex-col gap-4" action={formAction}>
              <HoneypotField />
              <input type="hidden" name="redirect" value={redirect || ''} />
              <input type="hidden" name="priceId" value={priceId || ''} />

              {mode === 'signup' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="first_name">{t('firstName')}</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      required
                      maxLength={80}
                      placeholder={t('firstName')}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="last_name">{t('lastName')}</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      autoComplete="family-name"
                      required
                      maxLength={80}
                      placeholder={t('lastName')}
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state.email}
                  required
                  maxLength={50}
                  placeholder={t('emailPlaceholder')}
                />
              </div>

              {mode === 'signup' ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">{t('phoneOptional')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={30}
                    placeholder={t('phonePlaceholder')}
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  maxLength={100}
                  placeholder={t('passwordPlaceholder')}
                />
                {mode === 'signin' ? (
                  <Link href="/forgot-password" className="text-sm font-medium text-emerald-700 hover:text-emerald-600">
                    {t('forgotPassword')}
                  </Link>
                ) : null}
              </div>

              {state?.error ? (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>{tCommon('error')}</AlertTitle>
                  <AlertDescription>
                    <p>{state.error}</p>
                    {mode === 'signin' && state.needsEmailConfirmation && state.email ? (
                      <div className="pt-2">
                        <ResendConfirmationButton email={state.email} />
                      </div>
                    ) : null}
                  </AlertDescription>
                </Alert>
              ) : null}

              {state?.success ? (
                <Alert className="border-emerald-200/70 bg-emerald-50/60 text-emerald-950">
                  <CheckCircle2 />
                  <AlertTitle>{tCommon('success')}</AlertTitle>
                  <AlertDescription>{state.success}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className={cn("rounded-full")} disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : mode === 'signin' ? (
                  t('signIn')
                ) : (
                  t('signUp')
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-2 border-t text-center">
            <p className="text-xs text-muted-foreground">
              {t('termsFooter')}{' '}
              <Link href="/terms-of-service" className="font-medium text-emerald-700 hover:text-emerald-600">
                {t('termsOfService')}
              </Link>{' '}
              {t('and')}{' '}
              <Link href="/privacy-policy" className="font-medium text-emerald-700 hover:text-emerald-600">
                {t('privacyPolicy')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
