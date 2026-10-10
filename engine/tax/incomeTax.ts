/**
 * Income tax for one person for one tax year.
 *
 * Follows the statutory order: personal allowance is set against non-savings income first, then
 * savings, then dividends. Non-savings income uses Scottish bands for Scottish taxpayers; savings
 * and dividend income always use UK bands. Relief-at-source pension contributions (and Gift Aid)
 * reduce adjusted net income and extend the band limits above the basic rate.
 *
 * Amounts are in pounds per year. The engine works in exact arithmetic; it does not round to
 * whole pounds or pence except where tests compare against HMRC's published figures.
 */
import type { Band, RuleSet } from '../../rules/schema';

export type TaxRegion = 'rUK' | 'scotland';

export interface IncomeTaxInput {
  /** Employment, self-employment and pension income, after salary sacrifice and net-pay pension deductions. */
  nonSavings: number;
  savings?: number;
  dividends?: number;
  region: TaxRegion;
  /** Gross relief-at-source pension contributions plus gross Gift Aid. */
  grossReliefAtSource?: number;
}

export interface BandSlice {
  name: string;
  rate: number;
  income: number;
  tax: number;
  kind: 'nonSavings' | 'savings' | 'dividends';
}

export interface IncomeTaxResult {
  adjustedNetIncome: number;
  personalAllowance: number;
  taxNonSavings: number;
  taxSavings: number;
  taxDividends: number;
  total: number;
  slices: BandSlice[];
  /** UK band (basic/higher/additional) of the top slice of income: used for savings and CGT. */
  ukBand: 'none' | 'basic' | 'higher' | 'additional';
}

/** Adjusted net income, simplified to the items RichCalc models. */
export function adjustedNetIncome(totalIncome: number, grossReliefAtSource = 0): number {
  return Math.max(0, totalIncome - grossReliefAtSource);
}

export function personalAllowance(rules: RuleSet, ani: number): number {
  const pa = rules.incomeTax.personalAllowance.value;
  const excess = Math.max(0, ani - rules.incomeTax.taperThreshold.value);
  return Math.max(0, pa - excess * rules.incomeTax.taperRate.value);
}

/** Bands with limits above the basic rate extended by `extension` (relief at source, Gift Aid). */
export function extendBands(bands: Band[], extension: number): Band[] {
  if (extension <= 0) return bands;
  const basicIndex = bands.findIndex((b) => b.name === 'Basic');
  return bands.map((b, i) => (i > basicIndex ? { ...b, from: b.from + extension } : b));
}

/** Tax on `amount` of taxable income stacked on top of `stackedBelow` already-taxed income. */
function taxThroughBands(
  bands: Band[],
  stackedBelow: number,
  amount: number,
  kind: BandSlice['kind'],
  rateFor: (band: Band, index: number) => number,
): BandSlice[] {
  const out: BandSlice[] = [];
  let remaining = amount;
  let position = stackedBelow;
  for (let i = 0; i < bands.length && remaining > 0; i++) {
    const top = i + 1 < bands.length ? bands[i + 1].from : Infinity;
    if (position >= top) continue;
    const inBand = Math.min(remaining, top - Math.max(position, bands[i].from));
    if (inBand <= 0) continue;
    const rate = rateFor(bands[i], i);
    out.push({ name: bands[i].name, rate, income: inBand, tax: inBand * rate, kind });
    remaining -= inBand;
    position += inBand;
  }
  return out;
}

const UK_BAND_KEYS = ['basic', 'higher', 'additional'] as const;

export function incomeTax(rules: RuleSet, input: IncomeTaxInput): IncomeTaxResult {
  const nonSavings = Math.max(0, input.nonSavings);
  const savings = Math.max(0, input.savings ?? 0);
  const dividends = Math.max(0, input.dividends ?? 0);
  const ras = Math.max(0, input.grossReliefAtSource ?? 0);
  const sd = rules.savingsAndDividends;

  const ani = adjustedNetIncome(nonSavings + savings + dividends, ras);
  const pa = personalAllowance(rules, ani);

  // Allowance goes against non-savings, then savings, then dividends.
  let paLeft = pa;
  const taxableNonSavings = Math.max(0, nonSavings - paLeft);
  paLeft = Math.max(0, paLeft - nonSavings);
  const taxableSavings = Math.max(0, savings - paLeft);
  paLeft = Math.max(0, paLeft - savings);
  const taxableDividends = Math.max(0, dividends - paLeft);

  const ukBands = extendBands(rules.incomeTax.rUK.value, ras);
  const nonSavingsBands = input.region === 'scotland' ? extendBands(rules.incomeTax.scotland.value, ras) : ukBands;

  const slices: BandSlice[] = [];
  slices.push(...taxThroughBands(nonSavingsBands, 0, taxableNonSavings, 'nonSavings', (b) => b.rate));

  // Savings and dividends sit on top of non-savings income in the UK bands.
  const ukBandFor = (i: number) => UK_BAND_KEYS[Math.min(i, 2)];
  let stacked = taxableNonSavings;
  const higherStart = ukBands[1].from;
  const additionalStart = ukBands[2].from;

  // Personal savings allowance depends on the person's highest band, judged on all taxable income.
  const totalTaxable = taxableNonSavings + taxableSavings + taxableDividends;
  const ukBand: IncomeTaxResult['ukBand'] =
    totalTaxable <= 0 ? 'none' : totalTaxable > additionalStart ? 'additional' : totalTaxable > higherStart ? 'higher' : 'basic';
  const psa = ukBand === 'none' ? sd.personalSavingsAllowance.value.basic : sd.personalSavingsAllowance.value[ukBand];

  if (taxableSavings > 0) {
    // Starting rate for savings: up to £5,000 at 0%, reduced £1 for £1 by taxable non-savings income.
    const startingBand = Math.max(0, sd.startingRateLimit.value - taxableNonSavings);
    let left = taxableSavings;
    const atStarting = Math.min(left, startingBand);
    if (atStarting > 0) {
      slices.push({ name: 'Starting rate for savings', rate: 0, income: atStarting, tax: 0, kind: 'savings' });
      left -= atStarting;
      stacked += atStarting;
    }
    const atNil = Math.min(left, psa);
    if (atNil > 0) {
      slices.push({ name: 'Personal savings allowance', rate: 0, income: atNil, tax: 0, kind: 'savings' });
      left -= atNil;
      stacked += atNil;
    }
    slices.push(...taxThroughBands(ukBands, stacked, left, 'savings', (_b, i) => sd.savingsRates.value[ukBandFor(i)]));
    stacked += left;
  }

  if (taxableDividends > 0) {
    let left = taxableDividends;
    const atNil = Math.min(left, sd.dividendAllowance.value);
    if (atNil > 0) {
      slices.push({ name: 'Dividend allowance', rate: 0, income: atNil, tax: 0, kind: 'dividends' });
      left -= atNil;
      stacked += atNil;
    }
    slices.push(...taxThroughBands(ukBands, stacked, left, 'dividends', (_b, i) => sd.dividendRates.value[ukBandFor(i)]));
  }

  const sum = (kind: BandSlice['kind']) => slices.filter((s) => s.kind === kind).reduce((a, s) => a + s.tax, 0);
  const taxNonSavings = sum('nonSavings');
  const taxSavings = sum('savings');
  const taxDividends = sum('dividends');

  return {
    adjustedNetIncome: ani,
    personalAllowance: pa,
    taxNonSavings,
    taxSavings,
    taxDividends,
    total: taxNonSavings + taxSavings + taxDividends,
    slices,
    ukBand,
  };
}
