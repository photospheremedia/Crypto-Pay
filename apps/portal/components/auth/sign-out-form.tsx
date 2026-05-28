"use client";

import type { ComponentProps, ReactNode } from "react";
import { markPendingSignOut } from "@/lib/auth/pending-sign-out";

type SignOutFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  action: NonNullable<ComponentProps<"form">["action"]>;
  children: ReactNode;
};

/** Server-action sign-out form; marks session so login can sync browser state once. */
export function SignOutForm({ action, children, ...props }: SignOutFormProps) {
  return (
    <form
      {...props}
      action={action}
      onSubmit={() => {
        markPendingSignOut();
      }}
    >
      {children}
    </form>
  );
}
