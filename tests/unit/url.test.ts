import { describe, expect, it } from 'vitest';
import { decodeState, defaultState, encodeState } from '../../src/tools/mortgage/state';
import { money, moneyCompact, niceTicks, pct } from '../../src/lib/format';

const start = '2026-10';

describe('URL state', () => {
  it('encodes nothing for the defaults, so the default URL is clean', () => {
    expect(encodeState(defaultState(start), start)).toBe('');
  });
  it('round-trips inputs, assumption overrides, horizon and seed', () => {
    const s = defaultState(start);
    s.form = { ...s.form, balance: 315_000, rate: 3.99, fixEnd: 'none', isa: 'cash', people: 1, under65: false, band: 'higher' };
    s.overrides = { 'eq.return': 0.035, 'mort.spread': 0.012 };
    s.horizon = 7;
    s.seed = 99;
    const q = encodeState(s, start);
    expect(q).toContain('a.eq.return=3.5');
    expect(decodeState(q, start)).toEqual(s);
  });
  it('ignores junk and clamps out-of-range values', () => {
    const s = decodeState('?bal=abc&rate=99&risk=yolo&a.eq.return=500&a.nope=1', start);
    expect(s.form.balance).toBe(defaultState(start).form.balance);
    expect(s.form.rate).toBe(20);
    expect(s.form.risk).toBe(defaultState(start).form.risk);
    expect(s.overrides['eq.return']).toBe(0.12);
    expect(s.overrides).not.toHaveProperty('nope');
  });
});

describe('formatting', () => {
  it('rounds money to honest precision', () => {
    expect(money(842.4)).toBe('£842');
    expect(money(3_792)).toBe('£3,790');
    expect(money(21_260)).toBe('£21,300');
    expect(money(-7_783)).toBe('−£7,780');
    expect(money(123_456)).toBe('£123,000');
  });
  it('formats axis labels compactly', () => {
    expect(moneyCompact(20_000)).toBe('£20k');
    expect(moneyCompact(-1_500)).toBe('−£1.5k');
    expect(moneyCompact(2_500_000)).toBe('£2.5m');
  });
  it('formats percentages', () => {
    expect(pct(0.0429)).toBe('4.29%');
    expect(pct(0.05)).toBe('5%');
  });
  it('makes ticks that cover the range', () => {
    const t = niceTicks(-23_000, 87_000);
    expect(t[0]).toBeLessThanOrEqual(-20_000);
    expect(t[t.length - 1]).toBeGreaterThanOrEqual(80_000);
  });
});
