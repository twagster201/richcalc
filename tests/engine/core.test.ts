import { describe, expect, it } from 'vitest';
import { createRng } from '../../engine/core/prng';
import { cholesky, correlation, mean, quantileSorted, standardDeviation } from '../../engine/core/stats';
import { addMonths, monthsBetween } from '../../engine/core/dates';

describe('seeded random numbers', () => {
  it('are reproducible for the same seed and stream', () => {
    const a = createRng(42, 'x');
    const b = createRng(42, 'x');
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });
  it('differ between streams and seeds', () => {
    expect(createRng(42, 'x').next()).not.toBe(createRng(42, 'y').next());
    expect(createRng(42, 'x').next()).not.toBe(createRng(43, 'x').next());
  });
  it('uniforms lie in [0, 1) with mean 1/2', () => {
    const rng = createRng(1);
    const xs = Array.from({ length: 100_000 }, () => rng.next());
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
    expect(mean(xs)).toBeCloseTo(0.5, 2);
  });
  it('normals have mean 0 and standard deviation 1', () => {
    const rng = createRng(7);
    const xs = Float64Array.from({ length: 200_000 }, () => rng.normal());
    expect(mean(xs)).toBeCloseTo(0, 2);
    expect(standardDeviation(xs)).toBeCloseTo(1, 2);
  });
  it('unit-variance Student-t draws have variance 1 and fat tails', () => {
    const rng = createRng(9);
    const xs = Float64Array.from({ length: 200_000 }, () => rng.studentT(5));
    expect(standardDeviation(xs)).toBeGreaterThan(0.97);
    expect(standardDeviation(xs)).toBeLessThan(1.03);
    const m = mean(xs);
    const kurt = mean(xs.map((x) => (x - m) ** 4));
    expect(kurt).toBeGreaterThan(4); // a normal has 3; t(5) has 9 in theory
  });
});

describe('statistics helpers', () => {
  it('quantiles interpolate linearly (type 7)', () => {
    const s = Float64Array.from([1, 2, 3, 4, 5]);
    expect(quantileSorted(s, 0.5)).toBe(3);
    expect(quantileSorted(s, 0.1)).toBeCloseTo(1.4, 10);
    expect(quantileSorted(s, 0.9)).toBeCloseTo(4.6, 10);
  });
  it('Cholesky factor reproduces the matrix', () => {
    const m = [
      [1, 0.3, -0.2],
      [0.3, 1, 0.1],
      [-0.2, 0.1, 1],
    ];
    const l = cholesky(m);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        let s = 0;
        for (let k = 0; k < 3; k++) s += l[i][k] * l[j][k];
        expect(s).toBeCloseTo(m[i][j], 12);
      }
  });
  it('rejects a matrix that is not positive definite', () => {
    expect(() => cholesky([[1, 2], [2, 1]])).toThrow();
  });
  it('correlation of a series with itself is 1', () => {
    expect(correlation([1, 2, 3, 5], [1, 2, 3, 5])).toBeCloseTo(1, 12);
  });
});

describe('month arithmetic', () => {
  it('counts months and wraps years', () => {
    expect(monthsBetween('2026-10', '2028-06')).toBe(20);
    expect(addMonths('2026-10', 3)).toEqual({ year: 2027, month: 1 });
    expect(addMonths('2026-10', 6)).toEqual({ year: 2027, month: 4 });
  });
});
