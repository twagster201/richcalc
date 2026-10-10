/** Turn per-run, per-year outcomes into percentiles, probabilities and dot-plot quantiles. */
import { mean, quantileSorted } from '../core/stats';

export interface YearSummary {
  /** Years from now (1 = end of the first year). */
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  mean: number;
  /** Share of runs where the value is above zero. */
  probPositive: number;
}

export function column(data: Float64Array, runs: number, years: number, year: number): Float64Array {
  const out = new Float64Array(runs);
  for (let r = 0; r < runs; r++) out[r] = data[r * years + year];
  return out;
}

export function summariseColumn(values: Float64Array, year: number): YearSummary {
  const sorted = Float64Array.from(values).sort();
  let positive = 0;
  for (let i = 0; i < values.length; i++) if (values[i] > 0) positive++;
  return {
    year,
    p10: quantileSorted(sorted, 0.1),
    p25: quantileSorted(sorted, 0.25),
    p50: quantileSorted(sorted, 0.5),
    p75: quantileSorted(sorted, 0.75),
    p90: quantileSorted(sorted, 0.9),
    mean: mean(values),
    probPositive: positive / values.length,
  };
}

export function summariseByYear(data: Float64Array, runs: number, years: number): YearSummary[] {
  const out: YearSummary[] = [];
  for (let y = 0; y < years; y++) out.push(summariseColumn(column(data, runs, years, y), y + 1));
  return out;
}

/**
 * Quantile dot plot values: `dots` evenly spaced quantiles at (i + 0.5) / dots, so each dot
 * stands for an equal share of simulated futures.
 */
export function dotQuantiles(values: Float64Array, dots = 50): number[] {
  const sorted = Float64Array.from(values).sort();
  return Array.from({ length: dots }, (_, i) => quantileSorted(sorted, (i + 0.5) / dots));
}

export function median(values: Float64Array): number {
  return quantileSorted(Float64Array.from(values).sort(), 0.5);
}
