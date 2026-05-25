import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const functionsDir = join(root, "functions");
const sharedDir = join(functionsDir, "_shared");
const outDir = join(root, ".mcp-deploy");
mkdirSync(outDir, { recursive: true });

const PROJECT_ID = process.env.SUPABASE_PROJECT_REF ?? "usbxwewohpsbjwiuazpf";

const functions = [
  { name: "verify-turnstile", verify_jwt: false },
  { name: "rate-limit-check", verify_jwt: false },
  { name: "send-email", verify_jwt: true },
  { name: "chat", verify_jwt: false },
  { name: "stripe-webhook", verify_jwt: false },
  { name: "urban-piper-webhook", verify_jwt: false },
];

const sharedFiles = ["db.ts", "errors.ts", "types.ts"];

function readShared() {
  return sharedFiles.map((f) => ({
    name: `../_shared/${f}`,
    content: readFileSync(join(sharedDir, f), "utf8"),
  }));
}

for (const fn of functions) {
  const indexPath = join(functionsDir, fn.name, "index.ts");
  const files = [
    {
      name: "index.ts",
      content: readFileSync(indexPath, "utf8"),
    },
    ...readShared(),
  ];

  const denoJsonPath = join(root, "deno.json");
  try {
    files.push({
      name: "../deno.json",
      content: readFileSync(denoJsonPath, "utf8"),
    });
  } catch {
    /* optional */
  }

  const payload = {
    project_id: PROJECT_ID,
    name: fn.name,
    entrypoint_path: "index.ts",
    verify_jwt: fn.verify_jwt,
    files,
  };

  const outPath = join(outDir, `${fn.name}.json`);
  writeFileSync(outPath, JSON.stringify(payload));
  console.log(`${fn.name}: ${files.length} files -> ${outPath} (${JSON.stringify(payload).length} bytes)`);
}
