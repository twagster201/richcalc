import { describe, expect, it } from 'vitest';
import { ECONOMIC } from '../../assumptions/economic';
import { defaultsOf } from '../../assumptions/types';
import { runMortgageVsIsa, type MortgageVsIsaInputs } from '../../engine/tools/mortgageVsIsa';
import { mortgageVsIsaSensitivity, simulateMortgageVsIsa, summariseMortgageVsIsa } from '../../engine/tools/mortgageVsIsaAnalysis';
import { column, median } from '../../engine/analysis/summarise';
import { flatPaths } from './helpers';

const defaults = defaultsOf(ECONOMIC);
const noFees = { ...defaults, fees: 0, 'mort.overpayAllowance': 1, 'gia.dividendYield': 0 };

const base: MortgageVsIsaInputs = {
  startDate: '2026-10',
  balance: 200_000,
  rate: 0.045,
  termYears: 20,
  fixEnd: '2046-10', // fixed for the whole term: no remortgage risk
  spare: 300,
  isaType: 'ss',
  risk: 'allEquity',
  taxBand: 'basic',
  people: 2,
  under65: true,
};

describe('mortgage vs ISA: deterministic checks', () => {
  it('comes out level when investments earn exactly the mortgage rate', () => {
    // A monthly mortgage rate of 4.5%/12 is matched by an annual return of (1 + 0.045/12)^12 − 1.
    const g = Math.pow(1 + 0.045 / 12, 12) - 1;
    const res = runMortgageVsIsa(base, noFees, flatPaths(20, { equityReal: g, inflation: 0 }));
    for (let y = 0; y < res.years; y++) expect(Math.abs(res.diffReal[y])).toBeLessThan(0.01);
  });

  it('favours investing when returns beat the mortgage rate, and overpaying when they do not', () => {
    const high = runMortgageVsIsa(base, noFees, flatPaths(20, { equityReal: 0.07 }));
    const low = runMortgageVsIsa(base, noFees, flatPaths(20, { equityReal: 0.02 }));
    expect(high.diffReal[19]).toBeGreaterThan(0);
    expect(low.diffReal[19]).toBeLessThan(0);
  });

  it('overpaying clears the mortgage early', () => {
    const res = runMortgageVsIsa(base, noFees, flatPaths(20, {}));
    expect(res.mortgageFreeYearsOverpay[0]).toBeLessThan(20);
    expect(res.mortgageFreeYearsOverpay[0]).toBeGreaterThan(10);
  });

  it('diverts money to the ISA when overpayments exceed the yearly allowance', () => {
    const big = { ...base, spare: 3_000 };
    const capped = runMortgageVsIsa(big, { ...noFees, 'mort.overpayAllowance': 0.1 }, flatPaths(20, {}));
    const free = runMortgageVsIsa(big, noFees, flatPaths(20, {}));
    expect(capped.divertedByAllowance[0]).toBeGreaterThan(0);
    expect(free.divertedByAllowance[0]).toBe(0);
  });

  it('sends contributions above the ISA allowance to a taxable account', () => {
    const single = { ...base, people: 1 as const, spare: 2_000 }; // £24,000 a year > £20,000
    const res = runMortgageVsIsa(single, noFees, flatPaths(20, {}));
    expect(res.overflowOutsideIsa[0]).toBeGreaterThan(0);
    const couple = runMortgageVsIsa({ ...single, people: 2 }, noFees, flatPaths(20, {}));
    expect(couple.overflowOutsideIsa[0]).toBeLessThan(res.overflowOutsideIsa[0]);
  });

  it('applies the £12,000 cash ISA cap from April 2027 for under-65s', () => {
    const cash = { ...base, isaType: 'cash' as const, people: 1 as const, spare: 1_250 }; // £15,000 a year
    // No overpayments allowed, so both options invest exactly the spare cash each month.
    const noOverpay = { ...noFees, 'mort.overpayAllowance': 0 };
    const under = runMortgageVsIsa(cash, noOverpay, flatPaths(20, {}));
    const over = runMortgageVsIsa({ ...cash, under65: false }, noOverpay, flatPaths(20, {}));
    expect(under.overflowOutsideIsa[0]).toBeGreaterThan(0);
    expect(over.overflowOutsideIsa[0]).toBe(0);
  });

  it('deflates results by inflation', () => {
    const g = 0.06;
    const nominalWorld = runMortgageVsIsa(base, noFees, flatPaths(20, { equityReal: g, inflation: 0 }));
    const inflated = runMortgageVsIsa(base, noFees, flatPaths(20, { equityReal: g, inflation: 0.03 }));
    // With 3% inflation, nominal returns are higher but the fixed-rate mortgage is the same, so
    // investing does better in real terms than in a 0% inflation world with the same real return.
    expect(inflated.diffReal[19]).toBeGreaterThan(nominalWorld.diffReal[19]);
  });

  it('remortgages at the simulated rate when the fix ends', () => {
    const shortFix = { ...base, fixEnd: '2028-10' };
    const cheap = runMortgageVsIsa(shortFix, { ...noFees, 'mort.spread': 0 }, flatPaths(20, { bankRate: 0.01 }));
    const dear = runMortgageVsIsa(shortFix, { ...noFees, 'mort.spread': 0 }, flatPaths(20, { bankRate: 0.08 }));
    // Expensive future borrowing makes overpaying more valuable.
    expect(dear.diffReal[19]).toBeLessThan(cheap.diffReal[19]);
  });

  it('treats a variable rate as moving with Bank Rate', () => {
    const variable = { ...base, fixEnd: null };
    const res = runMortgageVsIsa(variable, noFees, flatPaths(20, { bankRate: defaults['rate.start'] }));
    expect(res.divertedByAllowance[0]).toBe(0); // no early repayment charges on a variable rate
    expect(Number.isFinite(res.diffReal[19])).toBe(true);
  });
});

describe('mortgage vs ISA: Monte Carlo', () => {
  const opts = { seed: 1, runs: 1_000 };

  it('is reproducible for the same seed and changes with the seed', () => {
    const a = summariseMortgageVsIsa(base, defaults, opts);
    const b = summariseMortgageVsIsa(base, defaults, opts);
    const c = summariseMortgageVsIsa(base, defaults, { ...opts, seed: 2 });
    expect(a.diff).toEqual(b.diff);
    expect(a.diff[9].p50).not.toBe(c.diff[9].p50);
  });

  it('gives ordered percentiles, valid probabilities and 50 sorted dots per year', () => {
    const s = summariseMortgageVsIsa(base, defaults, opts);
    for (const y of s.diff) {
      expect(y.p10).toBeLessThanOrEqual(y.p25);
      expect(y.p25).toBeLessThanOrEqual(y.p50);
      expect(y.p50).toBeLessThanOrEqual(y.p75);
      expect(y.p75).toBeLessThanOrEqual(y.p90);
      expect(y.probPositive).toBeGreaterThanOrEqual(0);
      expect(y.probPositive).toBeLessThanOrEqual(1);
    }
    expect(s.dotsByYear).toHaveLength(s.years);
    for (const dots of s.dotsByYear) {
      expect(dots).toHaveLength(50);
      for (let i = 1; i < 50; i++) expect(dots[i]).toBeGreaterThanOrEqual(dots[i - 1]);
    }
  });

  it('spreads out over time (the fan widens)', () => {
    const s = summariseMortgageVsIsa(base, defaults, opts);
    const width = (y: number) => s.diff[y].p90 - s.diff[y].p10;
    expect(width(19)).toBeGreaterThan(width(4));
    expect(width(4)).toBeGreaterThan(width(0));
  });

  it('a cash ISA rarely beats overpaying a 4.5% mortgage', () => {
    const s = summariseMortgageVsIsa({ ...base, isaType: 'cash' }, defaults, opts);
    expect(s.diff[19].probPositive).toBeLessThan(0.5);
  });

  it('runs 5,000 simulations of a 25-year mortgage quickly', () => {
    const t0 = performance.now();
    simulateMortgageVsIsa({ ...base, termYears: 25 }, defaults, { seed: 3, runs: 5_000 });
    const ms = performance.now() - t0;
    expect(ms).toBeLessThan(2_000); // generous for CI; typically far faster
  });
});

describe('mortgage vs ISA: sensitivity', () => {
  const sens = mortgageVsIsaSensitivity(base, defaults, { seed: 1, runs: 400, horizonYear: 20 });

  it('ranks assumptions by how much they move the median', () => {
    for (let i = 1; i < sens.tornado.length; i++) expect(sens.tornado[i].swing).toBeLessThanOrEqual(sens.tornado[i - 1].swing);
    expect(sens.tornado[0].key).toBe('eq.return');
  });

  it('finds the share return at which the answer flips, and it really is the break-even', () => {
    const flip = sens.flips.find((f) => f.key === 'eq.return');
    expect(flip?.value).not.toBeNull();
    const at = simulateMortgageVsIsa(base, { ...defaults, 'eq.return': flip!.value! }, { seed: 1, runs: 400 });
    expect(Math.abs(median(column(at.diffReal, at.runs, at.years, 19)))).toBeLessThan(500);
    expect(flip!.direction).toBe(1); // higher returns favour investing
  });
});
