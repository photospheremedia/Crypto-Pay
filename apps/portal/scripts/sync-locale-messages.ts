/**
 * Ensures every locale file contains all keys from en.json.
 * Existing translations are kept; missing keys are filled from English as placeholders.
 *
 * Usage: pnpm --filter @crypto-pay/portal exec tsx scripts/sync-locale-messages.ts
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";
import {
  deepMergeMessages,
  pickMessageStructure,
} from "../lib/i18n/deep-merge-messages";
import { routing } from "../i18n/routing";

const MESSAGES_DIR = path.join(process.cwd(), "messages");

async function main() {
  const enPath = path.join(MESSAGES_DIR, "en.json");
  const en = JSON.parse(await readFile(enPath, "utf8")) as Record<string, unknown>;

  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;

    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    let existing: Record<string, unknown> = {};

    try {
      existing = JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
    } catch {
      console.warn(`Creating ${locale}.json from en.json`);
    }

    const pruned = pickMessageStructure(en, existing);
    const merged = deepMergeMessages(en, pruned);
    await writeFile(filePath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
    console.log(`Synced ${locale}.json`);
  }

  console.log(
    "\nTip: after adding new marketing namespaces, run:\n  pnpm exec tsx scripts/apply-marketing-translations.ts",
  );
}

void main();
