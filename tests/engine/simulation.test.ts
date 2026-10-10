import { describe, expect, it } from 'vitest';
import { ECONOMIC, EQUITY_TAIL_DF, SHOCK_CORRELATION } from '../../assumptions/economic';
import { defaultsOf } from '../../assumptions/types';
import { buildPaths, centralInflation, drawShocks } from '../../engine/sim/esg';
import { esgParamsFrom } from '../../engine/sim/params';
import { balanceAfter, monthlyPayment } from '../../engine/sim/mortgage';
import { correlation } from '../../engine/core/stats';

const defaults = defaultsOf(ECONOMIC);

describe('mortgage arithmetic', () => {
  it('£200,000 at 5% over 25 years costs £1,169.18 a month', () => {
    expect(monthlyPayment(200_000, 0.05, 300)).toBeCloseTo(1_169.18, 2);
  });
  it('the balance is cleared exactly at the end of the term', () => {
    expect(balanceAfter(200_000, 0.05, 300, 300)).toBeCloseTo(0, 6);
    expect(balanceAfter(200_000, 0.05, 300, 0)).toBeCloseTo(200_000, 6);
  });
  it('handles a 0% rate', () => {
    expect(monthlyPayment(12_000, 0, 120)).toBe(100);
  });
});

describe('economic scenario generator', () => {
  const shocks = drawShocks(2026, 4_000, 30, EQUITY_TAIL_DF);
  const paths = buildPaths(esgParamsFrom(defaults), shocks);

  it('is reproducible for a given seed', () => {
    const again = buildPaths(esgParamsFrom(defaults), drawShocks(2026, 4_000, 30, EQUITY_TAIL_DF));
    expect(again.equityLogReal).toEqual(paths.equityLogReal);
  });

  it('with no volatility, follows the central paths exactly', () => {
    const p = { ...esgParamsFrom(defaults), inflVol: 0, rateVol: 0, equityVol: 0, bondVol: 0 };
    const flat = buildPaths(p, drawShocks(1, 3, 10, EQUITY_TAIL_DF));
    for (let y = 0; y < 10; y++) {
      expect(flat.inflation[y]).toBeCloseTo(centralInflation(p, y), 12);
      expect(flat.equityLogReal[y]).toBeCloseTo(Math.log(1.05), 12);
      const gap = (p.rateStart - p.rateLongRun) * Math.pow(p.ratePersistence, y + 1);
      expect(flat.bankRate[y]).toBeCloseTo(p.rateLongRun + gap, 12);
    }
  });

  it('typical compound share growth matches the assumption', () => {
    const sorted = Float64Array.from(paths.equityLogReal).sort();
    const med = sorted[Math.floor(sorted.length / 2)];
    expect(Math.exp(med) - 1).toBeCloseTo(defaults['eq.return'], 2);
  });

  it('share volatility matches the assumption', () => {
    let s = 0;
    let s2 = 0;
    for (const x of paths.equityLogReal) {
      s += x;
      s2 += x * x;
    }
    const n = paths.equityLogReal.length;
    const sd = Math.sqrt(s2 / n - (s / n) ** 2);
    expect(sd).toBeGreaterThan(defaults['eq.vol'] * 0.96);
    expect(sd).toBeLessThan(defaults['eq.vol'] * 1.04);
  });

  it('a fall of more than 25% after inflation happens in roughly 1 year in 40', () => {
    let crashes = 0;
    for (const x of paths.equityLogReal) if (Math.exp(x) < 0.75) crashes++;
    const freq = crashes / paths.equityLogReal.length;
    expect(freq).toBeGreaterThan(1 / 60);
    expect(freq).toBeLessThan(1 / 28);
  });

  it('recovers the inflation–bond shock correlation sign', () => {
    // Year-1 inflation surprise vs year-1 bond return across runs.
    const infl: number[] = [];
    const bond: number[] = [];
    for (let r = 0; r < paths.runs; r++) {
      infl.push(paths.inflation[r * paths.years]);
      bond.push(paths.bondLogReal[r * paths.years]);
    }
    const target = SHOCK_CORRELATION.matrix[0][3];
    expect(correlation(infl, bond)).toBeCloseTo(target, 1);
  });

  it('never produces a negative Bank Rate', () => {
    expect(Math.min(...paths.bankRate)).toBeGreaterThanOrEqual(0);
  });
});
