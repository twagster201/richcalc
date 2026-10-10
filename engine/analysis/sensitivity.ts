/**
 * Which assumptions move the answer most, and at what value the answer flips.
 *
 * `evaluate` must use common random numbers (the same simulated shocks for every call), so that
 * differences between calls come from the assumption being changed, not from sampling noise.
 */
import type { Assumption, AssumptionValues } from '../../assumptions/types';

export interface Metric {
  /** Median outcome (e.g. net-worth difference) at the chosen horizon. */
  median: number;
  /** Probability the outcome is above zero at the chosen horizon. */
  probPositive: number;
}

export type Evaluate = (values: AssumptionValues) => Metric;

export interface TornadoItem {
  key: string;
  label: string;
  low: number;
  high: number;
  atLow: Metric;
  atHigh: Metric;
  /** Absolute change in the median between low and high. */
  swing: number;
}

export function tornado(evaluate: Evaluate, base: AssumptionValues, candidates: Assumption[]): TornadoItem[] {
  const items: TornadoItem[] = [];
  for (const a of candidates) {
    const { low, high } = a.range;
    if (low === high) continue;
    const atLow = evaluate({ ...base, [a.key]: low });
    const atHigh = evaluate({ ...base, [a.key]: high });
    items.push({ key: a.key, label: a.label, low, high, atLow, atHigh, swing: Math.abs(atHigh.median - atLow.median) });
  }
  return items.sort((x, y) => y.swing - x.swing);
}

export interface FlipPoint {
  key: string;
  /** Value at which the median outcome crosses zero, or null if it doesn't within the bounds. */
  value: number | null;
  /** Sign of the median outcome at the current value (1 above zero, -1 below). */
  currentSign: 1 | -1;
  /** Whether raising the assumption pushes the outcome up (+1) or down (-1). */
  direction: 1 | -1;
  searched: { min: number; max: number };
}

/**
 * Find where the median outcome crosses zero by bisection between the assumption's bounds.
 * Assumes the median is monotone in the assumption, which holds for the drivers we test
 * (returns, rates, fees, spreads) when random numbers are held fixed.
 */
export function findFlip(evaluate: Evaluate, base: AssumptionValues, a: Assumption, tolerance?: number): FlipPoint {
  const { min, max } = a.bounds;
  const f = (x: number) => evaluate({ ...base, [a.key]: x }).median;
  const current = f(base[a.key]);
  const currentSign: 1 | -1 = current > 0 ? 1 : -1;
  const fMin = f(min);
  const fMax = f(max);
  const direction: 1 | -1 = fMax >= fMin ? 1 : -1;
  const result = { key: a.key, currentSign, direction, searched: { min, max } };
  if (Math.sign(fMin) === Math.sign(fMax) || fMin === 0 || fMax === 0) {
    return { ...result, value: fMin === 0 ? min : fMax === 0 ? max : null };
  }
  let lo = min;
  let hi = max;
  let fLo = fMin;
  const tol = tolerance ?? (max - min) / 2000;
  while (hi - lo > tol) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.sign(fm) === Math.sign(fLo)) {
      lo = mid;
      fLo = fm;
    } else {
      hi = mid;
    }
  }
  return { ...result, value: (lo + hi) / 2 };
}
