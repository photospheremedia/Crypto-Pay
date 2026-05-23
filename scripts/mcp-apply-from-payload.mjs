/**
 * Prints one migration payload per line as: name<TAB>query_length
 * Agent applies via MCP apply_migration using payload files.
 */
import fs from 'fs';
import path from 'path';

const dir = path.resolve('.migration-batch');
const skip = new Set([
  '0002_core', '0003_rebrand', '0004_rls_definer', '0005_profiles_billing', '0006_roles_cleanup',
  '20260127000001_add_leads', '20260128000001_add_newsletter', '20260128000002_update_trigger_new_fields',
  '20260129000001_fix_user_trigger', '20260130000001_customer_pricing',
]);

const names = fs.readdirSync(dir)
  .filter((f) => f.endsWith('.payload.json'))
  .map((f) => f.replace(/\.payload.json$/, ''))
  .sort()
  .filter((n) => !skip.has(n));

for (const name of names) {
  const p = JSON.parse(fs.readFileSync(path.join(dir, `${name}.payload.json`), 'utf8'));
  fs.writeFileSync(path.join(dir, `mcp-args-${name}.json`), JSON.stringify(p));
  console.log(`${name}\t${p.query.length}`);
}
