import { rules2026_27, scheduledChanges } from './2026-27';
import type { RuleSet, ScheduledChange } from './schema';

export type { RuleSet, ScheduledChange } from './schema';
export { SOURCES } from './sources';
export type { SourceId, Source } from './sources';

/** All base rule sets, newest last. Add next year's file here each April. */
export const RULE_SETS: RuleSet[] = [rules2026_27];
export const SCHEDULED_CHANGES: ScheduledChange[] = [...scheduledChanges].sort((a, b) =>
  a.effectiveFrom.localeCompare(b.effectiveFrom),
);

export const LATEST_RULES: RuleSet = RULE_SETS[RULE_SETS.length - 1];

const cache = new Map<string, RuleSet>();

/** ISO date (YYYY-MM-DD) of the UK tax year start (6 April) on or before `date`. */
export function taxYearStart(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const year = m > 4 || (m === 4 && d >= 6) ? y : y - 1;
  return `${year}-04-06`;
}

/**
 * The rules in force on `date` (ISO YYYY-MM-DD): the latest base rule set that has started,
 * plus every announced change effective on or before that date.
 *
 * Beyond the last base rule set, thresholds are held at their last known values. Callers that
 * project further ahead apply their own (editable) uprating assumptions on top.
 */
export function rulesFor(date: string): RuleSet {
  const base = [...RULE_SETS].reverse().find((r) => r.validFrom <= date) ?? RULE_SETS[0];
  const changes = SCHEDULED_CHANGES.filter((c) => c.effectiveFrom <= date && c.effectiveFrom > base.validFrom);
  const key = `${base.id}|${changes.length}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const resolved = structuredClone(base);
  for (const c of changes) c.apply(resolved);
  cache.set(key, resolved);
  return resolved;
}
