"use client";

import type { RefObject } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { cn } from "@/lib/utils";
import { isTurnstileEnabled } from "@/lib/security/turnstile-config";

export { isTurnstileEnabled };
export { verifyTurnstileToken } from "@/lib/security/turnstile-verify";

type TurnstileFieldProps = {
  turnstileRef: RefObject<TurnstileInstance | null>;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
};

/**
 * Low-level Turnstile embed — prefer SecurityCheckField for auth forms.
 */
export function TurnstileField({
  turnstileRef,
  onVerify,
  onError,
  onExpire,
  className,
}: TurnstileFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  if (!siteKey) return null;

  return (
    <div className={cn("w-full [&_iframe]:mx-auto", className)}>
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={() => onError?.()}
        onExpire={() => onExpire?.()}
        options={{
          theme: "light",
          size: "flexible",
          appearance: "always",
          retry: "auto",
          refreshExpired: "auto",
        }}
      />
    </div>
  );
}

/** @deprecated Use TurnstileField or SecurityCheckField */
export function TurnstileWidget({
  onVerify,
  onError,
  className,
}: {
  onVerify: (token: string) => void;
  onError?: () => void;
  className?: string;
}) {
  const ref = { current: null } as React.RefObject<TurnstileInstance | null>;
  return (
    <TurnstileField
      turnstileRef={ref}
      onVerify={onVerify}
      onError={onError}
      className={className}
    />
  );
}
