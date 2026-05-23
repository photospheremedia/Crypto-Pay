import fs from 'fs';
import path from 'path';

const name = process.argv[2];
if (!name) {
  console.error('Usage: node scripts/apply-one-migration.mjs <migration_name>');
  process.exit(1);
}
const file = path.resolve('.migration-batch', `mcp-args-${name}.json`);
const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
process.stdout.write(JSON.stringify(payload));
