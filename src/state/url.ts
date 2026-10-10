/**
 * Shareable state: every input and assumption override lives in the query string, in readable
 * form (`bal=200000&rate=4.5&a.eq.return=3.5`). Only values that differ from the defaults are
 * written, so links stay short. `v` is the URL schema version, so old links keep working.
 */
import type { Assumption, AssumptionSet, AssumptionValues } from '../../assumptions/types';

export const URL_VERSION = '1';

export function toDisplay(a: Assumption, v: number): number {
  return a.unit === 'percent' || a.unit === 'pp' ? round(v * 100, 4) : v;
}
export function fromDisplay(a: Assumption, d: number): number {
  return a.unit === 'percent' || a.unit === 'pp' ? d / 100 : d;
}
function round(x: number, dp: number) {
  const k = Math.pow(10, dp);
  return Math.round(x * k) / k;
}

export function encodeOverrides(params: URLSearchParams, set: AssumptionSet, overrides: AssumptionValues) {
  for (const [key, value] of Object.entries(overrides)) {
    const a = set[key];
    if (!a || value === a.value) continue;
    params.set(`a.${key}`, String(toDisplay(a, value)));
  }
}

export function decodeOverrides(params: URLSearchParams, set: AssumptionSet): AssumptionValues {
  const out: AssumptionValues = {};
  for (const [k, raw] of params) {
    if (!k.startsWith('a.')) continue;
    const key = k.slice(2);
    const a = set[key];
    const d = Number(raw);
    if (!a || !Number.isFinite(d)) continue;
    const v = fromDisplay(a, d);
    out[key] = Math.min(a.bounds.max, Math.max(a.bounds.min, v));
  }
  return out;
}

export function num(params: URLSearchParams, key: string, fallback: number, min: number, max: number): number {
  const raw = params.get(key);
  if (raw === null || raw === '') return fallback;
  const v = Number(raw);
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}

export function oneOf<T extends string>(params: URLSearchParams, key: string, options: readonly T[], fallback: T): T {
  const raw = params.get(key) as T | null;
  return raw !== null && options.includes(raw) ? raw : fallback;
}
