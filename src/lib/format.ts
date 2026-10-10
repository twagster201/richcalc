/** Number formatting for UK readers. */

const gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const gbp2 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Money rounded to match how precise the estimate really is: nearest £1 below £1,000, £10 below
 * £10,000, £100 below £100,000, then £1,000. Simulated results are never accurate to the pound.
 */
export function money(x: number): string {
  const a = Math.abs(x);
  const step = a < 1_000 ? 1 : a < 10_000 ? 10 : a < 100_000 ? 100 : 1_000;
  const v = Math.round(x / step) * step;
  return gbp0.format(v === 0 ? 0 : v).replace('-', '−');
}

export function moneyExact(x: number): string {
  return gbp2.format(x).replace('-', '−');
}

/** Signed money with an explicit plus: +£1,200 / −£1,200. */
export function moneySigned(x: number): string {
  const m = money(Math.abs(x));
  return x > 0 ? `+${m}` : x < 0 ? `−${m}` : m;
}

/** Compact axis labels: £0, £5k, £1.2m, −£20k. */
export function moneyCompact(x: number): string {
  const sign = x < 0 ? '−' : '';
  const a = Math.abs(x);
  if (a >= 1_000_000) return `${sign}£${trim(a / 1_000_000)}m`;
  if (a >= 1_000) return `${sign}£${trim(a / 1_000)}k`;
  return `${sign}£${Math.round(a)}`;
}

function trim(v: number): string {
  return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '');
}

/** 0.0429 → "4.29%" (up to `digits` decimals, trailing zeros trimmed). */
export function pct(x: number, digits = 2): string {
  const s = (x * 100).toFixed(digits).replace(/\.?0+$/, '');
  return `${s.replace('-', '−')}%`;
}

/** Probability as a whole-number percentage, never showing a false 0% or 100%. */
export function chance(p: number): string {
  if (p > 0 && p < 0.01) return 'under 1%';
  if (p < 1 && p > 0.99) return 'over 99%';
  return `${Math.round(p * 100)}%`;
}

/** "7 in 10" style phrasing for a probability. */
export function inTen(p: number): string {
  const n = Math.round(p * 10);
  if (n === 0) return p > 0 ? 'fewer than 1 in 10' : 'none of the';
  if (n === 10) return p < 1 ? 'more than 9 in 10' : 'all';
  return `${n} in 10`;
}

export function years(n: number): string {
  const r = Math.round(n * 10) / 10;
  return `${r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)} year${r === 1 ? '' : 's'}`;
}

/** Nice axis ticks covering [min, max]. */
export function niceTicks(min: number, max: number, target = 5): number[] {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const start = Math.floor(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + step * 0.5; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}
