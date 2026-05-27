/**
 * Merges professional marketing-page translations into locale JSON files.
 * Run after sync-locale-messages.ts when new marketing namespaces are added to en.json.
 *
 * Usage: pnpm exec tsx scripts/apply-marketing-translations.ts
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { deepMergeMessages } from "../lib/i18n/deep-merge-messages";

const MESSAGES_DIR = path.join(process.cwd(), "messages");
const LOCALE_DATA_DIR = path.join(process.cwd(), "scripts/locale-data");

const LOCALE_FILES: Record<string, string> = {
  es: "es-marketing.json",
  fr: "fr-marketing.json",
  de: "de-marketing.json",
  ar: "ar-marketing.json",
};

async function mergeLocaleFile(locale: string, dataFile: string): Promise<void> {
  const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const dataPath = path.join(LOCALE_DATA_DIR, dataFile);
  const existing = JSON.parse(await readFile(localePath, "utf8")) as Record<string, unknown>;
  const patch = JSON.parse(await readFile(dataPath, "utf8")) as Record<string, unknown>;
  const merged = deepMergeMessages(existing, patch);
  await writeFile(localePath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Applied marketing translations to ${locale}.json`);
}

async function main() {
  for (const [locale, file] of Object.entries(LOCALE_FILES)) {
    await mergeLocaleFile(locale, file);
  }

  // Austrian German inherits German marketing copy.
  const de = JSON.parse(
    await readFile(path.join(MESSAGES_DIR, "de.json"), "utf8"),
  ) as Record<string, unknown>;
  await writeFile(
    path.join(MESSAGES_DIR, "de-AT.json"),
    `${JSON.stringify(de, null, 2)}\n`,
    "utf8",
  );
  console.log("Synced de-AT.json from de.json");
}

void main();
