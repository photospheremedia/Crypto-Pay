/**
 * Apply remaining migrations via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN in environment.
 */
import fs from 'fs';
import path from 'path';

const PROJECT_REF = 'hwntncyiqaltzvlidscg';
const BATCH_DIR = path.resolve('.migration-batch');
const APPLIED_FILE = path.join(BATCH_DIR, 'applied.json');
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

const alreadyApplied = new Set([
  '0002_core',
  '0003_rebrand',
  '0004_rls_definer',
  '0005_profiles_billing',
  '0006_roles_cleanup',
  '20260127000001_add_leads',
  '20260128000001_add_newsletter',
  '20260128000002_update_trigger_new_fields',
  '20260129000001_fix_user_trigger',
  '20260130000001_customer_pricing',
]);

if (fs.existsSync(APPLIED_FILE)) {
  for (const n of JSON.parse(fs.readFileSync(APPLIED_FILE, 'utf8'))) {
    alreadyApplied.add(n);
  }
}

const names = fs
  .readdirSync(BATCH_DIR)
  .filter((f) => f.endsWith('.payload.json'))
  .map((f) => f.replace(/\.payload\.json$/, ''))
  .sort()
  .filter((n) => !alreadyApplied.has(n));

async function applyMigration(name, query) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/migrations`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, query }),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    throw new Error(`${name}: ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

const results = { ok: [], fail: [] };

for (const name of names) {
  const payload = JSON.parse(
    fs.readFileSync(path.join(BATCH_DIR, `${name}.payload.json`), 'utf8')
  );
  try {
    await applyMigration(name, payload.query);
    results.ok.push(name);
    console.log(`OK ${name}`);
  } catch (e) {
    results.fail.push({ name, error: String(e) });
    console.error(`FAIL ${name}:`, e.message);
  }
}

fs.writeFileSync(
  path.join(BATCH_DIR, 'results.json'),
  JSON.stringify(results, null, 2)
);
console.log(`Done: ${results.ok.length} ok, ${results.fail.length} fail`);
