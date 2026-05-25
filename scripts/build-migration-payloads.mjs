import fs from 'fs';
import path from 'path';

const batchDir = path.resolve('.migration-batch');
const projectId = process.env.SUPABASE_PROJECT_REF ?? 'usbxwewohpsbjwiuazpf';
const names = fs
  .readdirSync(batchDir)
  .filter((f) => f.endsWith('.sqlonly'))
  .map((f) => f.replace(/\.sqlonly$/, ''))
  .sort();

for (const name of names) {
  const query = fs.readFileSync(path.join(batchDir, `${name}.sqlonly`), 'utf8');
  const payload = { project_id: projectId, name, query };
  fs.writeFileSync(path.join(batchDir, `${name}.payload.json`), JSON.stringify(payload));
}
console.log(`Built ${names.length} payload files`);
