import { describe, expect, it } from 'vitest';
import { amortize, growth, inflation, loanPayment, savingsNeeded, yearlySummary } from './finance';
import { bmi, bmr, bodyFatNavy, idealWeights, stepsToCalories } from './health';
import { addMonths, diffYMD, nextBirthday, parseDate } from './dates';
import { detectDefaults } from './settings-data';

describe('finance', () => {
  it('matches the standard mortgage payment', () => {
    // 200k over 30 years at 6% = 1199.10/month (well-known reference value)
    expect(loanPayment(200000, 6, 360)).toBeCloseTo(1199.1, 1);
  });

  it('handles 0% interest', () => {
    expect(loanPayment(12000, 0, 12)).toBe(1000);
  });

  it('handles a balloon payment', () => {
    const pay = loanPayment(20000, 6, 36, 5000);
    const plan = amortize({ principal: 20000, annualRate: 6, payment: pay, months: 36 });
    expect(plan.months).toBe(36);
    expect(plan.rows.at(-1).payment).toBeCloseTo(pay + 5000, 2);
    expect(plan.rows.at(-1).balance).toBeCloseTo(0, 6);
  });

  it('amortizes to zero and totals add up', () => {
    const pay = loanPayment(100000, 5, 120);
    const plan = amortize({ principal: 100000, annualRate: 5, payment: pay });
    expect(plan.months).toBe(120);
    expect(plan.totalPaid - plan.totalInterest).toBeCloseTo(100000, 2);
    const years = yearlySummary(plan.rows);
    expect(years).toHaveLength(10);
    expect(years.at(-1).balance).toBeCloseTo(0, 2);
  });

  it('overpayments shorten the term', () => {
    const pay = loanPayment(200000, 5, 300);
    const base = amortize({ principal: 200000, annualRate: 5, payment: pay });
    const extra = amortize({ principal: 200000, annualRate: 5, payment: pay, extra: 200 });
    expect(extra.months).toBeLessThan(base.months);
    expect(extra.totalInterest).toBeLessThan(base.totalInterest);
  });

  it('detects payments that never pay off', () => {
    expect(amortize({ principal: 10000, annualRate: 12, payment: 100 }).neverPaysOff).toBe(true);
  });

  it('compounds annually like the textbook formula', () => {
    const rows = growth({ initial: 1000, annualRate: 10, years: 2, perYear: 1 });
    expect(rows.at(-1).balance).toBeCloseTo(1210, 6);
  });

  it('compounds monthly with contributions', () => {
    // FV of 100/month for 12 months at 12%/yr monthly = 1268.25
    const rows = growth({ monthly: 100, annualRate: 12, years: 1, perYear: 12 });
    expect(rows.at(-1).balance).toBeCloseTo(1268.25, 2);
    expect(rows.at(-1).contributed).toBe(1200);
  });

  it('savingsNeeded reaches the target', () => {
    const m = savingsNeeded({ target: 10000, current: 1000, annualRate: 5, years: 3 });
    const rows = growth({ initial: 1000, monthly: m, annualRate: 5, years: 3, perYear: 12 });
    expect(rows.at(-1).balance).toBeCloseTo(10000, 4);
    expect(savingsNeeded({ target: 1000, current: 2000, years: 1 })).toBe(0);
  });

  it('inflation', () => {
    const r = inflation({ amount: 100, annualRate: 10, years: 2 });
    expect(r.futureCost).toBeCloseTo(121);
    expect(r.purchasingPower).toBeCloseTo(82.64, 2);
  });
});

describe('health', () => {
  it('bmi', () => {
    expect(bmi(70, 175)).toBeCloseTo(22.86, 2);
  });

  it('bmr (Mifflin–St Jeor)', () => {
    expect(bmr({ sex: 'male', kg: 80, cm: 180, age: 30 })).toBeCloseTo(1780);
    expect(bmr({ sex: 'female', kg: 60, cm: 165, age: 30 })).toBeCloseTo(1320.25);
  });

  it('body fat (US Navy)', () => {
    const male = bodyFatNavy({ sex: 'male', cm: 178, neck: 38, waist: 86 });
    expect(male).toBeGreaterThan(14);
    expect(male).toBeLessThan(18);
    const female = bodyFatNavy({ sex: 'female', cm: 165, neck: 33, waist: 72, hip: 98 });
    expect(female).toBeGreaterThan(24);
    expect(female).toBeLessThan(30);
    expect(bodyFatNavy({ sex: 'female', cm: 165, neck: 33, waist: 72 })).toBeNaN(); // hip required
    expect(bodyFatNavy({ sex: 'male', cm: 178, neck: 40, waist: 38 })).toBeNaN();
  });

  it('ideal weight (Devine, 6ft male = 77.6kg)', () => {
    const devine = idealWeights({ sex: 'male', cm: 182.88 }).find((f) => f.name.startsWith('Devine'));
    expect(devine.kg).toBeCloseTo(77.6, 1);
  });

  it('steps to calories', () => {
    const r = stepsToCalories({ steps: 10000, cm: 170, kg: 70, pace: 'moderate' });
    expect(r.km).toBeCloseTo(7.04, 2);
    expect(r.kcal).toBeGreaterThan(300);
    expect(r.kcal).toBeLessThan(450);
  });
});

describe('dates', () => {
  it('parses as local dates', () => {
    expect(parseDate('2024-03-01').getDate()).toBe(1);
  });

  it('adds months clamping to month end', () => {
    const d = addMonths(parseDate('2024-01-31'), 1);
    expect([d.getMonth(), d.getDate()]).toEqual([1, 29]);
    const e = addMonths(parseDate('2024-11-15'), 3);
    expect([e.getFullYear(), e.getMonth(), e.getDate()]).toEqual([2025, 1, 15]);
  });

  it('diffYMD', () => {
    expect(diffYMD(parseDate('1990-06-15'), parseDate('2026-11-23'))).toEqual({ years: 36, months: 5, days: 8 });
    expect(diffYMD(parseDate('2000-01-31'), parseDate('2000-03-01'))).toEqual({ years: 0, months: 1, days: 1 });
    expect(diffYMD(parseDate('2001-01-01'), parseDate('2000-01-01'))).toBeNull();
  });

  it('leap-day birthdays', () => {
    const next = nextBirthday(parseDate('2000-02-29'), parseDate('2026-01-01'));
    expect([next.getMonth(), next.getDate()]).toEqual([1, 28]);
  });
});

describe('settings defaults', () => {
  it('detects currency and units from locale', () => {
    expect(detectDefaults('en-US')).toEqual({ currency: 'USD', units: 'imperial' });
    expect(detectDefaults('en-GB')).toEqual({ currency: 'GBP', units: 'metric' });
    expect(detectDefaults('de-DE')).toEqual({ currency: 'EUR', units: 'metric' });
    expect(detectDefaults('ja')).toEqual({ currency: 'JPY', units: 'metric' });
    expect(detectDefaults('xx-invalid-!!')).toEqual({ currency: 'USD', units: 'imperial' });
  });
});
