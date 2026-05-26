import type { Page, TestInfo } from "@playwright/test";

export type SupabaseTraceEntry = {
  kind: "http" | "console";
  method?: string;
  url?: string;
  status?: number;
  message: string;
  at: string;
};

/** Collects failed Supabase HTTP responses and related console errors during a test. */
export class SupabaseMonitor {
  readonly entries: SupabaseTraceEntry[] = [];
  private attached = false;

  attach(page: Page) {
    if (this.attached) return;
    this.attached = true;

    page.on("response", async (response) => {
      const url = response.url();
      if (!url.includes("supabase.co")) return;

      const status = response.status();
      if (status < 400) return;

      let detail = "";
      try {
        const text = await response.text();
        detail = text.slice(0, 400);
      } catch {
        detail = "(body unreadable)";
      }

      this.entries.push({
        kind: "http",
        method: response.request().method(),
        url,
        status,
        message: detail,
        at: new Date().toISOString(),
      });
    });

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (!/supabase|auth|gotrue|jwt|session/i.test(text)) return;
      this.entries.push({
        kind: "console",
        message: text.slice(0, 500),
        at: new Date().toISOString(),
      });
    });
  }

  assertClean(label: string) {
    if (this.entries.length === 0) return;
    const summary = this.entries
      .map((e) => {
        if (e.kind === "http") {
          return `[HTTP ${e.status}] ${e.method} ${e.url}\n  ${e.message}`;
        }
        return `[console] ${e.message}`;
      })
      .join("\n\n");
    throw new Error(`${label}: Supabase errors detected:\n\n${summary}`);
  }

  async attachReport(testInfo: TestInfo) {
    if (this.entries.length === 0) return;
    await testInfo.attach("supabase-trace", {
      body: JSON.stringify(this.entries, null, 2),
      contentType: "application/json",
    });
  }
}
