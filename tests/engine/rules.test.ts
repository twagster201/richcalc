import { describe, expect, it } from 'vitest';
import { LATEST_RULES, RULE_SETS, SCHEDULED_CHANGES, SOURCES, rulesFor, taxYearStart } from '../../rules';
import type { Sourced } from '../../rules/schema';

function* sourcedValues(obj: unknown, path = ''): Generator<[string, Sourced<unknown>]> {
  if (obj && typeof obj === 'object') {
    if ('value' in obj && 'source' in obj && 'status' in obj) {
      yield [path, obj as Sourced<unknown>];
      return;
    }
    for (const [k, v] of Object.entries(obj)) yield* sourcedValues(v, path ? `${path}.${k}` : k);
  }
}

describe('rules config', () => {
  it('every value has at least one known source and a verified date', () => {
    for (const set of RULE_SETS) {
      for (const [path, s] of sourcedValues(set)) {
        expect(s.source.length, path).toBeGreaterThan(0);
        for (const ref of s.source) expect(SOURCES[ref.id], `${path} → ${ref.id}`).toBeDefined();
        expect(s.verified, path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('scheduled changes cite known sources', () => {
    for (const c of SCHEDULED_CHANGES) for (const ref of c.source) expect(SOURCES[ref.id]).toBeDefined();
  });

  it('applies announced changes from their effective dates, without mutating the base rules', () => {
    expect(rulesFor('2027-04-05').isa.cashCapUnder65.value).toBeNull();
    expect(rulesFor('2027-04-06').isa.cashCapUnder65.value).toBe(12_000);
    expect(rulesFor('2029-04-06').nationalInsurance.salarySacrificeCap.value).toBe(2_000);
    expect(LATEST_RULES.isa.cashCapUnder65.value).toBeNull();
  });

  it('finds the tax year start', () => {
    expect(taxYearStart('2026-04-05')).toBe('2025-04-06');
    expect(taxYearStart('2026-04-06')).toBe('2026-04-06');
    expect(taxYearStart('2026-12-31')).toBe('2026-04-06');
  });

  it('band tables are in ascending order', () => {
    const r = LATEST_RULES;
    for (const bands of [r.incomeTax.rUK.value, r.incomeTax.scotland.value]) {
      for (let i = 1; i < bands.length; i++) expect(bands[i].from).toBeGreaterThan(bands[i - 1].from);
    }
  });
});
