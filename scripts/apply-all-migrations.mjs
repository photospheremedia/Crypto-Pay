/**
 * Reads .migration-batch/*.payload.json in sorted order and prints
 * one line per migration: name|status (for agent to apply via MCP).
 * Run: node scripts/apply-all-migrations.mjs list
 */
import fs from 'fs';
import path from 'path';

const batchDir = path.resolve('.migration-batch');
const names = fs
  .readdirSync(batchDir)
  .filter((f) => f.endsWith('.payload.json'))
  .map((f) => f.replace(/\.payload\.json$/, ''))
  .sort();

const cmd = process.argv[2] ?? 'list';

if (cmd === 'list') {
  for (const name of names) console.log(name);
  process.exit(0);
}

if (cmd === 'payload') {
  const name = process.argv[3];
  if (!name) {
    console.error('Usage: node scripts/apply-all-migrations.mjs payload <name>');
    process.exit(1);
  }
  const file = path.join(batchDir, `${name}.payload.json`);
  process.stdout.write(fs.readFileSync(file, 'utf8'));
  process.exit(0);
}

console.error(`Unknown command: ${cmd}`);
process.exit(1);
