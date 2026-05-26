"use client";

import { useEffect } from "react";
import { AppErrorUi } from "@/components/errors/app-error-ui";
import { reportError } from "@/lib/errors";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { source: "global-error", digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <AppErrorUi
          error={error}
          reset={reset}
          variant="global"
          title="Critical error"
          description="A critical error occurred. Try again or return to the home page."
        />
      </body>
    </html>
  );
}
