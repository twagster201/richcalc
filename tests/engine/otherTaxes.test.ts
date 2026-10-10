import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { rulesFor } from '../../rules';
import {
  capitalGainsTax,
  childBenefitAnnual,
  employeeNI,
  employerNI,
  hicbc,
  niableAfterSacrifice,
  propertyTax,
  studentLoanRepayment,
} from '../../engine/tax';

const r = rulesFor('2026-10-10');

describe('National Insurance (annual basis)', () => {
  it('employee: nothing up to £12,570, 8% to £50,270, 2% above', () => {
    expect(employeeNI(r, 12_570)).toBe(0);
    expect(employeeNI(r, 12_571)).toBeCloseTo(0.08, 10);
    expect(employeeNI(r, 50_270)).toBeCloseTo(3_016, 6);
    expect(employeeNI(r, 50_271)).toBeCloseTo(3_016.02, 6);
    expect(employeeNI(r, 60_000)).toBeCloseTo(3_210.6, 6);
  });
  it('employer: 15% above £5,000', () => {
    expect(employerNI(r, 5_000)).toBe(0);
    expect(employerNI(r, 30_000)).toBeCloseTo(3_750, 6);
  });
  it('salary sacrifice is fully NI-free before April 2029', () => {
    expect(niableAfterSacrifice(r, 60_000, 10_000)).toBe(50_000);
  });
  it('only the first £2,000 of sacrifice is NI-free from 6 April 2029', () => {
    const r29 = rulesFor('2029-04-06');
    expect(niableAfterSacrifice(r29, 60_000, 10_000)).toBe(58_000);
    expect(niableAfterSacrifice(r29, 60_000, 1_500)).toBe(58_500);
    expect(niableAfterSacrifice(rulesFor('2029-04-05'), 60_000, 10_000)).toBe(50_000);
  });
});

describe('student loans', () => {
  it.each([
    ['plan1', 26_900, 0],
    ['plan1', 26_901, 0.09],
    ['plan2', 29_385, 0],
    ['plan2', 29_386, 0.09],
    ['plan2', 40_000, 955.35],
    ['plan4', 33_795, 0],
    ['plan4', 33_796, 0.09],
    ['plan5', 25_000, 0],
    ['plan5', 25_001, 0.09],
  ] as const)('%s at £%d → £%d', (plan, pay, expected) => {
    expect(studentLoanRepayment(r, pay, plan).total).toBeCloseTo(expected, 6);
  });
  it('postgraduate loans are 6% over £21,000 and stack with an undergraduate plan', () => {
    expect(studentLoanRepayment(r, 21_000, 'none', true).total).toBe(0);
    expect(studentLoanRepayment(r, 30_000, 'none', true).total).toBeCloseTo(540, 6);
    const both = studentLoanRepayment(r, 40_000, 'plan2', true);
    expect(both.undergraduate).toBeCloseTo(955.35, 6);
    expect(both.postgraduate).toBeCloseTo(1_140, 6);
  });
});

describe('child benefit and the HICBC', () => {
  it('pays £27.05 a week for the eldest and £17.90 for others', () => {
    expect(childBenefitAnnual(r, 1)).toBeCloseTo(1_406.6, 6);
    expect(childBenefitAnnual(r, 2)).toBeCloseTo(2_337.4, 6);
    expect(childBenefitAnnual(r, 0)).toBe(0);
  });
  it('charges 1% per whole £200 over £60,000', () => {
    const cb = 2_000;
    expect(hicbc(r, 60_000, cb)).toBe(0);
    expect(hicbc(r, 60_199, cb)).toBe(0);
    expect(hicbc(r, 60_200, cb)).toBe(20);
    expect(hicbc(r, 70_000, cb)).toBe(1_000); // 50%
    expect(hicbc(r, 79_999, cb)).toBe(1_980); // 99%
    expect(hicbc(r, 80_000, cb)).toBe(2_000);
    expect(hicbc(r, 150_000, cb)).toBe(2_000);
  });
  it('HMRC manual PAYE14015 pattern: £68,000 gives a 40% charge', () => {
    expect(hicbc(r, 68_000, 1_000)).toBe(400);
  });
});

describe('property taxes', () => {
  it('GOV.UK SDLT example: £295,000 home → £4,750', () => {
    expect(propertyTax(r, 'england', 295_000, false).tax).toBeCloseTo(4_750, 6);
  });
  it('SDLT first-time buyer: nothing to £300,000, 5% to £500,000, relief lost above', () => {
    expect(propertyTax(r, 'england', 300_000, true).tax).toBe(0);
    expect(propertyTax(r, 'england', 500_000, true).tax).toBeCloseTo(10_000, 6);
    const over = propertyTax(r, 'england', 500_001, true);
    expect(over.firstTimeBuyerReliefApplied).toBe(false);
    expect(over.tax).toBeCloseTo(15_000.05, 6);
  });
  it('Northern Ireland uses SDLT', () => {
    expect(propertyTax(r, 'northernIreland', 295_000, false).tax).toBeCloseTo(4_750, 6);
  });
  it('LBTT: first-time buyer relief is worth up to £600', () => {
    expect(propertyTax(r, 'scotland', 200_000, false).tax).toBeCloseTo(1_100, 6);
    expect(propertyTax(r, 'scotland', 200_000, true).tax).toBeCloseTo(500, 6);
    const big = 900_000;
    expect(propertyTax(r, 'scotland', big, false).tax - propertyTax(r, 'scotland', big, true).tax).toBeCloseTo(600, 6);
  });
  it('LTT: 6% from £225,000, no first-time buyer relief', () => {
    expect(propertyTax(r, 'wales', 225_000, false).tax).toBe(0);
    expect(propertyTax(r, 'wales', 300_000, true).tax).toBeCloseTo(4_500, 6);
  });
  it('tax never decreases with price (standard rates)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 3_000_000 }), fc.integer({ min: 1, max: 50_000 }), fc.constantFrom('england', 'scotland', 'wales'), (p, d, n) => {
        const nation = n as 'england' | 'scotland' | 'wales';
        return propertyTax(r, nation, p + d, false).tax >= propertyTax(r, nation, p, false).tax;
      }),
    );
  });
});

describe('capital gains tax', () => {
  it('£3,000 exempt, then 18% within the unused basic band and 24% above', () => {
    expect(capitalGainsTax(r, 3_000, 0)).toBe(0);
    expect(capitalGainsTax(r, 10_000, 0)).toBeCloseTo(1_680, 6);
    expect(capitalGainsTax(r, 10_000, 5_000)).toBeCloseTo(5_000 * 0.18 + 2_000 * 0.24, 6);
  });
});
