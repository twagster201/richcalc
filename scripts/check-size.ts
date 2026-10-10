/** Fail the build if the JavaScript sent to a browser grows past the budget. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = { page: 40, worker: 35 };
const dir = resolve(import.meta.dirname, '../dist/assets');
let failed = false;
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const gz = gzipSync(readFileSync(join(dir, f))).length / 1024;
  const kind = f.includes('worker') ? 'worker' : 'page';
  const ok = gz <= BUDGET_KB[kind];
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'OVER'} ${f.padEnd(40)} ${gz.toFixed(1)} kB gzip (budget ${BUDGET_KB[kind]} kB, ${(statSync(join(dir, f)).size / 1024).toFixed(0)} kB raw)`);
}
if (failed) {
  console.error('JavaScript size budget exceeded.');
  process.exit(1);
}
