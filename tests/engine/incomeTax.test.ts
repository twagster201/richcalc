import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { rulesFor } from '../../rules';
import { incomeTax, personalAllowance } from '../../engine/tax';

const r = rulesFor('2026-10-10');
const rUK = (salary: number, extra: Partial<Parameters<typeof incomeTax>[1]> = {}) =>
  incomeTax(r, { nonSavings: salary, region: 'rUK', ...extra });
const scot = (salary: number) => incomeTax(r, { nonSavings: salary, region: 'scotland' });

describe('personal allowance taper', () => {
  it('GOV.UK example: adjusted net income £105,000 gives an allowance of £10,070', () => {
    // "It's £5,000 over the £100,000 limit. Your Personal Allowance is reduced by £2,500."
    expect(personalAllowance(r, 105_000)).toBe(10_070);
  });
  it('is untouched at exactly £100,000 and starts falling at £100,001', () => {
    expect(personalAllowance(r, 100_000)).toBe(12_570);
    expect(personalAllowance(r, 100_001)).toBe(12_569.5);
  });
  it('is zero from £125,140', () => {
    expect(personalAllowance(r, 125_140)).toBe(0);
    expect(personalAllowance(r, 125_139)).toBeCloseTo(0.5, 10);
    expect(personalAllowance(r, 200_000)).toBe(0);
  });
});

describe('income tax, England / Wales / Northern Ireland', () => {
  // Each expected value is worked by hand in the comment.
  const cases: [number, number, string][] = [
    [12_570, 0, 'all within the allowance'],
    [12_571, 0.2, '£1 at basic rate'],
    [50_270, 7_540, '37,700 × 20%'],
    [50_271, 7_540.4, 'first £1 at higher rate'],
    [60_000, 11_432, '7,540 + 9,730 × 40%'],
    [100_000, 27_432, '7,540 + 49,730 × 40%'],
    [100_001, 27_432.6, 'extra £1 taxed at 40% plus £0.50 of lost allowance taxed at 40%'],
    [125_140, 42_516, 'allowance gone: 7,540 + 87,440 × 40%'],
    [125_141, 42_516.45, 'first £1 at additional rate'],
    [150_000, 53_703, '42,516 + 24,860 × 45%'],
  ];
  it.each(cases)('£%d → £%d (%s)', (salary, expected) => {
    expect(rUK(salary).total).toBeCloseTo(expected, 6);
  });

  it('has an effective 60% marginal rate between £100,000 and £125,140', () => {
    expect(rUK(110_001).total - rUK(110_000).total).toBeCloseTo(0.6, 6);
  });
});

describe('income tax, Scotland', () => {
  const cases: [number, number, string][] = [
    [12_570, 0, 'within the allowance'],
    [16_537, 753.73, '3,967 × 19%'],
    [16_538, 753.93, 'first £1 at basic 20%'],
    [29_526, 3_351.53, '+ 12,989 × 20%'],
    [29_527, 3_351.74, 'first £1 at intermediate 21%'],
    [43_662, 6_320.09, '+ 14,136 × 21%'],
    [43_663, 6_320.51, 'first £1 at higher 42%'],
    [75_000, 19_482.05, '+ 31,338 × 42%'],
    [75_001, 19_482.5, 'first £1 at advanced 45%'],
    [100_000, 30_732.05, '+ 25,000 × 45%'],
    [125_140, 47_701.55, 'allowance gone: 753.73 + 2,597.80 + 2,968.56 + 13,161.96 + 62,710 × 45%'],
    [125_141, 47_702.03, 'first £1 at top 48%'],
  ];
  it.each(cases)('£%d → £%d (%s)', (salary, expected) => {
    expect(scot(salary).total).toBeCloseTo(expected, 6);
  });

  it('has a 67.5% marginal rate in the taper zone (45% + half of 45%)', () => {
    expect(scot(110_001).total - scot(110_000).total).toBeCloseTo(0.675, 6);
  });
});

describe('savings and dividends', () => {
  it('basic-rate taxpayer: £1,000 personal savings allowance, rest at 20%', () => {
    expect(rUK(30_000, { savings: 2_000 }).taxSavings).toBeCloseTo(200, 6);
  });
  it('low earner: £5,000 starting rate band plus allowance makes £6,000 interest tax-free', () => {
    expect(rUK(12_570, { savings: 6_000 }).taxSavings).toBe(0);
  });
  it('starting rate band shrinks £1 for £1 with taxable non-savings income', () => {
    // Taxable salary 2,000 → starting band 3,000. Savings 5,000: 3,000 at 0%, 1,000 PSA, 1,000 at 20%.
    expect(rUK(14_570, { savings: 5_000 }).taxSavings).toBeCloseTo(200, 6);
  });
  it('higher-rate taxpayer: £500 allowance, rest at 40%', () => {
    expect(rUK(60_000, { savings: 1_000 }).taxSavings).toBeCloseTo(200, 6);
  });
  it('dividends: £500 allowance, then 10.75% basic / 35.75% higher', () => {
    expect(rUK(30_000, { dividends: 3_000 }).taxDividends).toBeCloseTo(268.75, 6);
    expect(rUK(60_000, { dividends: 3_000 }).taxDividends).toBeCloseTo(893.75, 6);
  });
  it('dividends straddling the higher-rate threshold are split between rates', () => {
    // Taxable salary 36,700; dividends 3,000: 500 allowance (36,700→37,200), 500 at 10.75%, 2,000 at 35.75%.
    expect(rUK(49_270, { dividends: 3_000 }).taxDividends).toBeCloseTo(500 * 0.1075 + 2_000 * 0.3575, 6);
  });
  it('Scottish taxpayer: savings use UK bands', () => {
    // Taxable non-savings 32,430 is a UK basic-rate position even though it is Scottish higher rate.
    const res = incomeTax(r, { nonSavings: 45_000, savings: 2_000, region: 'scotland' });
    expect(res.taxSavings).toBeCloseTo(200, 6);
  });
  it('savings rates rise to 22% from April 2027', () => {
    const r27 = rulesFor('2027-06-01');
    expect(incomeTax(r27, { nonSavings: 30_000, savings: 2_000, region: 'rUK' }).taxSavings).toBeCloseTo(220, 6);
  });
});

describe('relief-at-source pension contributions', () => {
  it('extend the basic rate band by the gross contribution', () => {
    // £60,000 with £10,000 gross contribution: higher rate starts at taxable 47,700, so all 47,430 is basic.
    expect(rUK(60_000, { grossReliefAtSource: 10_000 }).total).toBeCloseTo(9_486, 6);
  });
  it('restore the personal allowance by reducing adjusted net income', () => {
    const res = rUK(110_000, { grossReliefAtSource: 10_000 });
    expect(res.adjustedNetIncome).toBe(100_000);
    expect(res.personalAllowance).toBe(12_570);
  });
  it('do not extend the Scottish starter band', () => {
    const res = incomeTax(r, { nonSavings: 20_000, region: 'scotland', grossReliefAtSource: 1_000 });
    expect(res.slices.find((s) => s.name === 'Starter')?.income).toBe(3_967);
  });
});

describe('properties', () => {
  const salary = fc.integer({ min: 0, max: 400_000 });
  it('income tax never decreases as income rises', () => {
    fc.assert(
      fc.property(salary, fc.integer({ min: 1, max: 5_000 }), fc.constantFrom('rUK', 'scotland'), (s, d, region) => {
        const a = incomeTax(r, { nonSavings: s, region: region as 'rUK' | 'scotland' }).total;
        const b = incomeTax(r, { nonSavings: s + d, region: region as 'rUK' | 'scotland' }).total;
        return b >= a - 1e-9;
      }),
    );
  });
  it('the marginal rate on salary never exceeds 67.5%', () => {
    fc.assert(
      fc.property(salary, fc.constantFrom('rUK', 'scotland'), (s, region) => {
        const reg = region as 'rUK' | 'scotland';
        const d = incomeTax(r, { nonSavings: s + 100, region: reg }).total - incomeTax(r, { nonSavings: s, region: reg }).total;
        return d / 100 <= 0.675 + 1e-9;
      }),
    );
  });
  it('slices add up to taxable income', () => {
    fc.assert(
      fc.property(salary, fc.integer({ min: 0, max: 50_000 }), fc.integer({ min: 0, max: 50_000 }), (s, sav, div) => {
        const res = incomeTax(r, { nonSavings: s, savings: sav, dividends: div, region: 'rUK' });
        const taxable = Math.max(0, s + sav + div - res.personalAllowance);
        const sliced = res.slices.reduce((a, x) => a + x.income, 0);
        return Math.abs(sliced - taxable) < 1e-6;
      }),
    );
  });
});
