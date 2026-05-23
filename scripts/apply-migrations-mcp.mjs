/**
 * Prints migration names (one per line) for remaining migrations to apply.
 * Agent reads each .sql file and calls MCP apply_migration.
 */
import fs from 'fs';
import path from 'path';

const migrationsDir = path.resolve('supabase/migrations');
const skip = new Set([
  '0001_tenants.sql',
  '0002_core.sql',
  '0003_rebrand.sql',
  '0004_rls_definer.sql',
  '0005_profiles_billing.sql',
  '0006_roles_cleanup.sql',
]);

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql') && !skip.has(f))
  .sort();

for (const file of files) {
  const name = file.replace(/\.sql$/, '');
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const out = path.resolve('.migration-batch', `${name}.sqlonly`);
  fs.mkdirSync(path.resolve('.migration-batch'), { recursive: true });
  fs.writeFileSync(out, sql, 'utf8');
  console.log(name);
}
