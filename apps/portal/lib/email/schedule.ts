/**
 * Schedule email side effects after the HTTP response (Next.js `after`).
 * @see https://nextjs.org/docs/app/api-reference/functions/after
 */

import { after } from "next/server";
import { logEmailWorkflow, type EmailTaskResult } from "./workflows";

/**
 * Run email delivery without blocking redirects or form responses.
 * Failures are logged; they never throw to the caller.
 */
export function scheduleEmailWork(
  context: string,
  work: () => Promise<EmailTaskResult>,
): void {
  after(async () => {
    try {
      const result = await work();
      logEmailWorkflow(context, result);
    } catch (error) {
      console.error(`[Email] ${context} threw:`, error);
    }
  });
}
