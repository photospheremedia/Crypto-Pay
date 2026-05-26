"use client";

import { useEffect } from "react";
import { AppErrorUi } from "@/components/errors/app-error-ui";
import { reportError } from "@/lib/errors";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { source: "error-boundary", digest: error.digest });
  }, [error]);

  return <AppErrorUi error={error} reset={reset} variant="segment" />;
}
