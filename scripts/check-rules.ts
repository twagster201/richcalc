/**
 * Rules health check, run in CI and before each April update.
 * Fails if today is past the end of the latest rule set; warns about stale or unverified values.
 */
import { ECONOMIC } from '../assumptions/economic';
import { LATEST_RULES } from '../rules';
import { ruleEntries } from '../rules/catalogue';

const today = new Date().toISOString().slice(0, 10);
const staleBefore = new Date(Date.now() - 183 * 86_400_000).toISOString().slice(0, 10);
let failed = false;

if (today > LATEST_RULES.validTo) {
  console.error(`✗ Latest rules (${LATEST_RULES.taxYear}) ended on ${LATEST_RULES.validTo}. Add the next tax year's rules file.`);
  failed = true;
} else {
  console.log(`✓ Rules ${LATEST_RULES.taxYear} valid until ${LATEST_RULES.validTo}.`);
}

const stale = [
  ...ruleEntries(LATEST_RULES).filter((r) => r.sourced.verified < staleBefore).map((r) => r.label),
  ...Object.values(ECONOMIC).filter((a) => a.verified < staleBefore).map((a) => a.label),
];
if (stale.length) console.warn(`! ${stale.length} values not checked in 6 months:\n  - ${stale.join('\n  - ')}`);

const unverified = [
  ...ruleEntries(LATEST_RULES).filter((r) => r.sourced.status === 'unverified').map((r) => r.label),
  ...Object.values(ECONOMIC).filter((a) => a.status === 'unverified').map((a) => a.label),
];
if (unverified.length) console.warn(`! ${unverified.length} unverified values (shown with a badge):\n  - ${unverified.join('\n  - ')}`);

process.exit(failed ? 1 : 0);
