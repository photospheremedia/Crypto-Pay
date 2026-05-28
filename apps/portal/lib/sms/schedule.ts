import { after } from "next/server";
import { isSmsWorkflowSkipped, logSmsWorkflow, type SmsTaskResult, type SmsWorkflowSkip } from "./workflows";

export function scheduleSmsWork(
  context: string,
  work: () => Promise<SmsTaskResult | SmsWorkflowSkip>,
): void {
  after(async () => {
    try {
      const result = await work();
      if (isSmsWorkflowSkipped(result)) {
        console.info(`[SMS] ${context} skipped: ${result.reason}`);
        return;
      }
      logSmsWorkflow(context, result);
    } catch (error) {
      console.error(`[SMS] ${context} threw:`, error);
    }
  });
}
