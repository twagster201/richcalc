/**
 * Economic scenario generator: yearly paths for inflation, Bank Rate, and real returns on shares
 * and bonds, for many simulated futures.
 *
 * Random shocks are drawn once (`drawShocks`) and turned into paths by `buildPaths`. Keeping the
 * two apart gives "common random numbers": every option, and every sensitivity re-run with a
 * changed assumption, faces exactly the same sequence of good and bad years. Comparisons then
 * reflect the change being tested rather than sampling noise.
 */
import { createRng } from '../core/prng';
import { cholesky } from '../core/stats';

export const SHOCKS_PER_YEAR = 4; // inflation, rate, equity, bond

export interface Shocks {
  runs: number;
  years: number;
  seed: number;
  /** Independent standard normals, [run][year][variable]. */
  normals: Float64Array;
  /** Chi-squared draws for the fat-tailed equity shock, [run][year]. */
  chiSquared: Float64Array;
  equityDf: number;
}

export function drawShocks(seed: number, runs: number, years: number, equityDf: number): Shocks {
  const rng = createRng(seed, 'esg-v1');
  const normals = new Float64Array(runs * years * SHOCKS_PER_YEAR);
  const chi = new Float64Array(runs * years);
  for (let i = 0, j = 0, k = 0; k < runs * years; k++) {
    for (let v = 0; v < SHOCKS_PER_YEAR; v++) normals[i++] = rng.normal();
    chi[j++] = rng.chiSquared(equityDf);
  }
  return { runs, years, seed, normals, chiSquared: chi, equityDf };
}

export interface EsgParams {
  inflStart: number;
  inflLongRun: number;
  inflFade: number;
  inflVol: number;
  inflPersistence: number;
  rateStart: number;
  rateLongRun: number;
  ratePersistence: number;
  rateVol: number;
  rateInflationResponse: number;
  equityReturn: number; // typical (median) compound real growth, e.g. 0.05
  equityVol: number;
  bondReturn: number;
  bondVol: number;
  correlation: number[][];
}

export interface EsgPaths {
  runs: number;
  years: number;
  /** CPI inflation in each year, as a fraction. [run][year] */
  inflation: Float64Array;
  /** Average Bank Rate in each year. */
  bankRate: Float64Array;
  /** Log real returns. */
  equityLogReal: Float64Array;
  bondLogReal: Float64Array;
}

/** Central (expected) inflation path before surprises. */
export function centralInflation(p: EsgParams, year: number): number {
  return p.inflLongRun + (p.inflStart - p.inflLongRun) * Math.pow(p.inflFade, year);
}

export function buildPaths(p: EsgParams, shocks: Shocks): EsgPaths {
  const { runs, years, normals, chiSquared, equityDf } = shocks;
  const L = cholesky(p.correlation);
  const n = runs * years;
  const inflation = new Float64Array(n);
  const bankRate = new Float64Array(n);
  const equityLogReal = new Float64Array(n);
  const bondLogReal = new Float64Array(n);
  const muE = Math.log(1 + p.equityReturn);
  const muB = Math.log(1 + p.bondReturn);
  const tScale = Math.sqrt(equityDf - 2);
  const z = [0, 0, 0, 0];

  for (let r = 0; r < runs; r++) {
    let inflSurprise = 0;
    let rateGap = p.rateStart - p.rateLongRun;
    for (let y = 0; y < years; y++) {
      const idx = r * years + y;
      const base = idx * SHOCKS_PER_YEAR;
      // Correlate the independent normals.
      for (let i = 0; i < SHOCKS_PER_YEAR; i++) {
        let s = 0;
        for (let k = 0; k <= i; k++) s += L[i][k] * normals[base + k];
        z[i] = s;
      }
      inflSurprise = p.inflPersistence * inflSurprise + p.inflVol * z[0];
      inflation[idx] = centralInflation(p, y) + inflSurprise;

      rateGap = p.ratePersistence * rateGap + p.rateInflationResponse * inflSurprise + p.rateVol * z[1];
      bankRate[idx] = Math.max(0, p.rateLongRun + rateGap);

      // Fat-tailed share shock: a correlated normal scaled by an independent chi-squared draw,
      // giving a Student-t marginal with unit variance.
      const tShock = z[2] * (tScale / Math.sqrt(chiSquared[idx]));
      equityLogReal[idx] = muE + p.equityVol * tShock;
      bondLogReal[idx] = muB + p.bondVol * z[3];
    }
  }
  return { runs, years, inflation, bankRate, equityLogReal, bondLogReal };
}
