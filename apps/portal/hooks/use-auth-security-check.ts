"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { isTurnstileEnabled } from "@/lib/security/turnstile-config";

export type SecurityCheckStatus = "idle" | "verified" | "error";

export function useAuthSecurityCheck(resetTrigger?: unknown) {
  const captchaEnabled = isTurnstileEnabled();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<SecurityCheckStatus>("idle");

  const reset = useCallback(() => {
    setToken("");
    setStatus("idle");
    turnstileRef.current?.reset();
  }, []);

  useEffect(() => {
    if (resetTrigger) {
      reset();
    }
  }, [resetTrigger, reset]);

  const onVerify = useCallback((value: string) => {
    setToken(value);
    setStatus("verified");
  }, []);

  const onError = useCallback(() => {
    setToken("");
    setStatus("error");
  }, []);

  const onExpire = useCallback(() => {
    setToken("");
    setStatus("idle");
    turnstileRef.current?.reset();
  }, []);

  const canSubmit = !captchaEnabled || status === "verified";

  return {
    captchaEnabled,
    turnstileRef,
    token,
    status,
    canSubmit,
    reset,
    onVerify,
    onError,
    onExpire,
  };
}
