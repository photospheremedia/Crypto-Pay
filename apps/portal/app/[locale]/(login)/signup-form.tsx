'use client';

import Link from 'next/link';
import { useActionState, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft, Check, Building2, MapPin, Mail } from 'lucide-react';
import { getSupabaseBrowserClient } from '@crypto-pay/db/supabaseClient';
import { Logo } from '@/components/logo';
import { signUp, type ActionState } from './actions';
import { SecurityCheckField } from '@/components/auth/security-check-field';
import { isTurnstileEnabled } from '@/lib/security/turnstile-config';

const STEPS = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Account', icon: Mail },
];

const ORG_TYPES = [
  { value: 'exchange', label: 'Crypto exchange', description: 'Custodial platform' },
  { value: 'merchant', label: 'Online merchant', description: 'Accepts payments' },
  { value: 'saas', label: 'SaaS / Platform', description: 'Subscription billing' },
  { value: 'fintech', label: 'Fintech / Wallet app', description: 'Consumer payments' },
  { value: 'agency', label: 'Agency / Integrator', description: 'Client implementations' },
  { value: 'other', label: 'Other', description: 'Tell us more' },
];

const LOCATION_COUNTS = [
  { value: '1', label: '1 project' },
  { value: '2-5', label: '2-5 projects' },
  { value: '6-10', label: '6-10 projects' },
  { value: '11-25', label: '11-25 projects' },
  { value: '25+', label: '25+ projects' },
];

const HOW_HEARD_OPTIONS = [
  { value: 'google', label: 'Google search' },
  { value: 'social', label: 'Social media' },
  { value: 'referral', label: 'Friend / Colleague referral' },
  { value: 'industry_event', label: 'Industry event / Trade show' },
  { value: 'blog_article', label: 'Blog / Article' },
  { value: 'other', label: 'Other' },
];

export function SignupForm() {
  const tCommon = useTranslations('Common');
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');

  const [step, setStep] = useState(1);
  const [existingUser, setExistingUser] = useState(false);
  const [securityCheckPassed, setSecurityCheckPassed] = useState(
    () => !isTurnstileEnabled(),
  );

  // Form data
  const [formData, setFormData] = useState({
    org_name: '',
    org_type: '',
    org_type_other: '',
    estimated_locations: '1',
    how_heard: '',
    how_heard_other: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: '',
    email: '',
    password: '',
    newsletter_consent: true,
  });

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signUp,
    { error: '' }
  );

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      setExistingUser(!!data.user);
    };
    checkUser();
  }, []);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = formData.org_name.length >= 2 && formData.org_type &&
    (formData.org_type !== 'other' || formData.org_type_other.length >= 2);
  const canProceedStep2 = formData.city && formData.state && formData.phone.length >= 6;
  const canSubmit =
    formData.email &&
    formData.password.length >= 8 &&
    securityCheckPassed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    // Add all form data
    Object.entries(formData).forEach(([key, value]) => {
      fd.set(key, String(value));
    });
    formAction(fd);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-linear-to-br from-slate-50 via-white to-cyan-50/40 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Logo and Branding */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex items-center justify-center">
            <Logo size="md" showText={true} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Crypto Pay</h1>
            <p className="mt-1 text-xs tracking-wide text-slate-500 uppercase font-semibold">Merchant Onboarding</p>
          </div>
        </div>

        {/* Main Heading */}
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 mt-4">
          Create your account
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-600">
            Sign in
          </Link>
        </p>

        {/* Progress Steps */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id > step}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${s.id === step
                    ? 'bg-linear-to-r from-emerald-500 to-cyan-600 text-white'
                    : s.id < step
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
              >
                {s.id < step ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <s.icon className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`mx-2 h-px w-6 ${s.id < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 px-8 py-10">
          {existingUser && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800">
                <strong>Already logged in?</strong>{' '}
                <button
                  onClick={async () => {
                    const supabase = getSupabaseBrowserClient();
                    await supabase.auth.signOut();
                    setExistingUser(false);
                  }}
                  className="font-semibold underline hover:text-amber-900"
                >
                  Sign out first
                </button>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />

            {/* Step 1: Business Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="org_name" className="text-sm font-medium text-slate-700">
                    Company / project name *
                  </Label>
                  <Input
                    id="org_name"
                    value={formData.org_name}
                    onChange={(e) => updateField('org_name', e.target.value)}
                    placeholder="e.g., BlockPay Labs, Atlas Exchange"
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">
                    What type of business? *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ORG_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateField('org_type', type.value)}
                        className={`p-3 rounded-xl border text-left transition ${formData.org_type === type.value
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                            : 'border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <p className="text-sm font-medium text-slate-900">{type.label}</p>
                        <p className="text-xs text-slate-500">{type.description}</p>
                      </button>
                    ))}
                  </div>
                  {formData.org_type === 'other' && (
                    <div className="mt-3">
                      <Input
                        id="org_type_other"
                        value={formData.org_type_other}
                        onChange={(e) => updateField('org_type_other', e.target.value)}
                        placeholder="Please describe your business type..."
                        className="rounded-xl"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimated_locations" className="text-sm font-medium text-slate-700">
                    How many products or merchant deployments?
                  </Label>
                  <select
                    id="estimated_locations"
                    aria-label="Number of locations"
                    value={formData.estimated_locations}
                    onChange={(e) => updateField('estimated_locations', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    {LOCATION_COUNTS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="how_heard" className="text-sm font-medium text-slate-700">
                    How did you discover Crypto Pay?
                  </Label>
                  <select
                    id="how_heard"
                    aria-label="How did you discover Crypto Pay"
                    value={formData.how_heard}
                    onChange={(e) => updateField('how_heard', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Select one (optional)</option>
                    {HOW_HEARD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {formData.how_heard === 'other' && (
                    <div className="mt-2">
                      <Input
                        id="how_heard_other"
                        value={formData.how_heard_other}
                        onChange={(e) => updateField('how_heard_other', e.target.value)}
                        placeholder="Please specify..."
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full rounded-xl bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 mt-4"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Location & Contact */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Where's your primary location? This helps us customize your experience.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="address_line1" className="text-sm font-medium text-slate-700">
                      Street address (optional)
                    </Label>
                    <Input
                      id="address_line1"
                      value={formData.address_line1}
                      onChange={(e) => updateField('address_line1', e.target.value)}
                      placeholder="123 Main St"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="City"
                      className="mt-1 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-slate-700">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="CA"
                      className="mt-1 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code" className="text-sm font-medium text-slate-700">
                      Postal code
                    </Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => updateField('postal_code', e.target.value)}
                      placeholder="90210"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="US"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                    Phone number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1 rounded-xl"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">We'll only call for onboarding help</p>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Account */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="At least 8 characters"
                    className="mt-1 rounded-xl"
                    minLength={8}
                    required
                  />
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                  <input
                    type="checkbox"
                    id="newsletter_consent"
                    name="newsletter_consent"
                    checked={formData.newsletter_consent}
                    onChange={(e) => updateField('newsletter_consent', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="newsletter_consent" className="text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Send me the weekly ops brief</span>
                    <br />
                    Get supply deals, rollout playbooks, and industry insights. Unsubscribe anytime.
                  </label>
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
                  className="mt-2"
                />

                <div className="flex gap-3 mt-4 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={pending || !canSubmit}
                    className="flex-1 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        {tCommon('creatingAccount')}
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            By signing up, you agree to our{' '}
            <Link href="/terms-of-service" className="text-emerald-600 hover:text-emerald-600">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
