/** Month arithmetic on 'YYYY-MM' strings. */

export function parseYearMonth(ym: string): { year: number; month: number } {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) throw new Error(`Expected YYYY-MM, got ${ym}`);
  return { year: Number(m[1]), month: Number(m[2]) };
}

/** Whole months from `from` to `to` (positive if `to` is later). */
export function monthsBetween(from: string, to: string): number {
  const a = parseYearMonth(from);
  const b = parseYearMonth(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

/** The calendar year and month (1–12) that is `offset` months after `start`. */
export function addMonths(start: string, offset: number): { year: number; month: number } {
  const { year, month } = parseYearMonth(start);
  const zero = year * 12 + (month - 1) + offset;
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 };
}

export function isoMidMonth(start: string, offset: number): string {
  const { year, month } = addMonths(start, offset);
  return `${year}-${String(month).padStart(2, '0')}-15`;
}
