/**
 * UK tax and benefit rules for the 2026/27 tax year (6 April 2026 to 5 April 2027),
 * plus changes already announced for later years.
 *
 * Every value carries its source, the date it was last checked and a status. When a value
 * changes (usually at a Budget, and every April), update it here. Nothing else in the codebase
 * should contain a tax rate, threshold or allowance.
 */
import type { RuleSet, ScheduledChange, Sourced, SourceRef, Status } from './schema';
import type { SourceId } from './sources';

const VERIFIED = '2026-10-10';

function v<T>(value: T, ids: SourceId | SourceId[], status: Status = 'confirmed', note?: string, locator?: string): Sourced<T> {
  const list = Array.isArray(ids) ? ids : [ids];
  const source: SourceRef[] = list.map((id) => (locator ? { id, locator } : { id }));
  return note ? { value, source, verified: VERIFIED, status, note } : { value, source, verified: VERIFIED, status };
}

export const rules2026_27: RuleSet = {
  id: '2026-27',
  taxYear: '2026/27',
  validFrom: '2026-04-06',
  validTo: '2027-04-05',

  incomeTax: {
    personalAllowance: v(12_570, ['govuk-income-tax-rates', 'govuk-thresholds-frozen-2031'], 'confirmed',
      'Frozen at £12,570 until 5 April 2031.'),
    taperThreshold: v(100_000, 'govuk-income-tax-rates', 'confirmed',
      'The personal allowance shrinks by £1 for every £2 of adjusted net income above £100,000.'),
    taperRate: v(0.5, 'govuk-income-tax-rates'),
    rUK: v(
      [
        { from: 0, rate: 0.2, name: 'Basic' },
        { from: 37_700, rate: 0.4, name: 'Higher' },
        { from: 125_140, rate: 0.45, name: 'Additional' },
      ],
      ['govuk-income-tax-rates', 'govuk-thresholds-frozen-2031'],
      'confirmed',
      'Bands are on taxable income (after the personal allowance). With the full allowance, higher rate starts at £50,270 of gross income. Wales sets its own rates but they are currently identical.',
    ),
    scotland: v(
      [
        { from: 0, rate: 0.19, name: 'Starter' },
        { from: 3_967, rate: 0.2, name: 'Basic' },
        { from: 16_956, rate: 0.21, name: 'Intermediate' },
        { from: 31_092, rate: 0.42, name: 'Higher' },
        { from: 62_430, rate: 0.45, name: 'Advanced' },
        { from: 125_140, rate: 0.48, name: 'Top' },
      ],
      ['govscot-income-tax-2026-27', 'govscot-srr-2026-27', 'ciot-srr-agreed-2026-27'],
      'confirmed',
      'Bands on taxable income, as set out in the Scottish Rate Resolution approved on 19 February 2026. With the full allowance these start at £12,571, £16,538, £29,527, £43,663, £75,001 and £125,141 of gross income.',
    ),
  },

  savingsAndDividends: {
    savingsRates: v({ basic: 0.2, higher: 0.4, additional: 0.45 }, 'govuk-property-savings-dividend-rates', 'confirmed',
      'Savings rates rise by 2 points from April 2027 (see scheduled changes).'),
    startingRateLimit: v(5_000, 'govuk-budget-2025-annex-a', 'confirmed', 'Frozen at £5,000 to 2030-31 by Finance Act 2026.'),
    personalSavingsAllowance: v({ basic: 1_000, higher: 500, additional: 0 }, 'govuk-budget-2025-annex-a'),
    dividendRates: v({ basic: 0.1075, higher: 0.3575, additional: 0.3935 }, ['govuk-tax-on-dividends', 'govuk-property-savings-dividend-rates'], 'confirmed',
      'Basic and higher dividend rates rose by 2 points from 6 April 2026.'),
    dividendAllowance: v(500, 'govuk-tax-on-dividends'),
  },

  capitalGains: {
    annualExemptAmount: v(3_000, 'govuk-cgt-rates'),
    rates: v({ basic: 0.18, higher: 0.24 }, 'govuk-cgt-rates'),
  },

  nationalInsurance: {
    lowerEarningsLimit: v(6_708, ['govuk-employer-rates-2026-27', 'govuk-ni-rates']),
    primaryThreshold: v(12_570, ['govuk-employer-rates-2026-27', 'govuk-thresholds-frozen-2031'], 'confirmed', 'Frozen until April 2031 alongside the personal allowance.'),
    upperEarningsLimit: v(50_270, ['govuk-employer-rates-2026-27', 'govuk-thresholds-frozen-2031']),
    employeeMainRate: v(0.08, 'govuk-employer-rates-2026-27'),
    employeeUpperRate: v(0.02, 'govuk-employer-rates-2026-27'),
    secondaryThreshold: v(5_000, 'govuk-employer-rates-2026-27', 'confirmed', 'GOV.UK says £5,000 applies from 6 April 2025 until 5 April 2028.'),
    employerRate: v(0.15, 'govuk-employer-rates-2026-27'),
    salarySacrificeCap: v(null, 'govuk-salary-sacrifice-2029', 'confirmed', 'No cap until 6 April 2029 (see scheduled changes).'),
  },

  studentLoans: {
    plans: v(
      {
        plan1: { threshold: 26_900, rate: 0.09 },
        plan2: { threshold: 29_385, rate: 0.09 },
        plan4: { threshold: 33_795, rate: 0.09 },
        plan5: { threshold: 25_000, rate: 0.09 },
      },
      ['govuk-sl-deduction-tables-2026-27', 'govuk-sl-collection-2026'],
      'confirmed',
      'Plan 2 is frozen at £29,385 until the end of 2029-30 (Budget 2025). Plan 5 repayments start in April 2026.',
    ),
    postgraduate: v({ threshold: 21_000, rate: 0.06 }, 'govuk-sl-deduction-tables-2026-27'),
  },

  childBenefit: {
    weeklyEldest: v(27.05, 'govuk-child-benefit-rates'),
    weeklyAdditional: v(17.9, 'govuk-child-benefit-rates'),
    hicbcThreshold: v(60_000, 'govuk-hicbc', 'confirmed', 'Charged on the higher earner in a couple, based on adjusted net income.'),
    hicbcStep: v(200, 'govuk-hicbc', 'confirmed', '1% of the child benefit is clawed back for every £200 over £60,000, so all of it is gone at £80,000.'),
  },

  childcare: {
    taxFreeChildcare: v(
      { topUpRate: 0.2, maxPerChild: 2_000, maxPerDisabledChild: 4_000, incomeLimit: 100_000, minWeeklyHoursAtMinimumWage: 16 },
      'govuk-tax-free-childcare',
      'confirmed',
      'Government adds £2 for every £8 paid in (20% of the bill), up to £500 a quarter per child. Each parent must expect adjusted net income of no more than £100,000.',
    ),
    englandWorkingParents: v(
      { hoursPerWeek: 30, weeksPerYear: 38, fromAgeMonths: 9, incomeLimit: 100_000 },
      ['bsil-30-hours-eligibility', 'govuk-free-childcare-working-eligibility'],
      'confirmed',
      'England only. From the term after a child turns 9 months until school. Neither parent may have adjusted net income over £100,000.',
    ),
    englandUniversal3to4: v({ hoursPerWeek: 15, weeksPerYear: 38 }, 'govuk-free-childcare-working-eligibility', 'confirmed',
      'All 3 and 4 year olds in England get 15 hours regardless of income.'),
    scotlandFunded3to4: v({ hoursPerYear: 1_140, incomeTested: false }, 'govscot-elc', 'confirmed',
      'Scotland offers 1,140 hours a year to all 3 and 4 year olds regardless of income, so there is no childcare cliff at £100,000.'),
    walesChildcareOffer: v(
      { maxHoursPerWeek: 30, weeksPerYear: 48, incomeLimit: 100_000, incomeBasis: 'gross' },
      'govwales-childcare-offer-eligibility',
      'confirmed',
      'Each parent’s GROSS income must be £100,000 or less, measured before pension contributions or salary sacrifice, so pension contributions do not restore eligibility. The split between funded education and childcare hours varies by council.',
    ),
    northernIrelandSubsidy: v({ subsidyRate: 0.15, linkedToTaxFreeChildcare: true }, 'educationni-nicss-2026', 'confirmed',
      'Paid on top of Tax-Free Childcare to families who claim it, so it is lost at the same £100,000 limit.'),
  },

  isa: {
    overallAllowance: v(20_000, ['govuk-cash-isa-limit'], 'confirmed', 'Unchanged at £20,000 a year.'),
    cashCapUnder65: v(null, 'govuk-cash-isa-limit', 'confirmed', 'No separate cash limit until 6 April 2027 (see scheduled changes).'),
  },

  pensions: {
    annualAllowance: v(60_000, ['govuk-pension-rates', 'govuk-budget-2025-annex-a']),
    taperThresholdIncome: v(200_000, 'govuk-pension-rates'),
    taperAdjustedIncome: v(260_000, ['govuk-pension-rates', 'govuk-budget-2025-annex-a']),
    minimumTaperedAllowance: v(10_000, 'govuk-pension-rates'),
    basicReliefAtSource: v(0.2, 'govuk-pension-rates', 'confirmed', 'Relief at source is added at 20% for everyone, including Scottish starter-rate taxpayers.'),
  },

  propertyTax: {
    sdlt: v(
      {
        standard: [
          { from: 0, rate: 0 },
          { from: 125_000, rate: 0.02 },
          { from: 250_000, rate: 0.05 },
          { from: 925_000, rate: 0.1 },
          { from: 1_500_000, rate: 0.12 },
        ],
        firstTimeBuyer: { slices: [{ from: 0, rate: 0 }, { from: 300_000, rate: 0.05 }], maxPrice: 500_000 },
      },
      ['govuk-sdlt-residential', 'hmrc-sdltm29805'],
      'confirmed',
      'England and Northern Ireland. First-time buyer relief is lost entirely above £500,000. Rates in force since 1 April 2025.',
    ),
    lbtt: v(
      {
        standard: [
          { from: 0, rate: 0 },
          { from: 145_000, rate: 0.02 },
          { from: 250_000, rate: 0.05 },
          { from: 325_000, rate: 0.1 },
          { from: 750_000, rate: 0.12 },
        ],
        firstTimeBuyer: {
          slices: [
            { from: 0, rate: 0 },
            { from: 175_000, rate: 0.02 },
            { from: 250_000, rate: 0.05 },
            { from: 325_000, rate: 0.1 },
            { from: 750_000, rate: 0.12 },
          ],
          maxPrice: null,
        },
      },
      ['revscot-lbtt-residential', 'govscot-tax-ready-reckoners-2026-27'],
      'confirmed',
      'Scotland. First-time buyer relief raises the nil-rate band to £175,000 (worth up to £600) at any price.',
    ),
    ltt: v(
      {
        standard: [
          { from: 0, rate: 0 },
          { from: 225_000, rate: 0.06 },
          { from: 400_000, rate: 0.075 },
          { from: 750_000, rate: 0.1 },
          { from: 1_500_000, rate: 0.12 },
        ],
      },
      ['govwales-ltt-rates', 'govwales-draft-budget-2026-27-taxes'],
      'confirmed',
      'Wales. There is no first-time buyer relief. Rates unchanged for 2026-27.',
    ),
  },

  minimumWage: v({ age21plus: 12.71, age18to20: 10.85, under18: 8.0 }, 'govuk-nlw-2026', 'confirmed', 'From 1 April 2026.'),
};

/** Changes already announced for future dates, applied in date order by `rulesFor`. */
export const scheduledChanges: ScheduledChange[] = [
  {
    effectiveFrom: '2027-04-06',
    summary: 'Cash ISA subscriptions capped at £12,000 a year for people under 65 (the overall ISA allowance stays £20,000).',
    status: 'confirmed',
    source: [{ id: 'govuk-cash-isa-limit' }, { id: 'leg-isa-amendment-no2-2026' }, { id: 'govuk-isa-anti-circumvention' }],
    verified: VERIFIED,
    apply: (r) => {
      r.isa.cashCapUnder65 = v(12_000, ['govuk-cash-isa-limit', 'leg-isa-amendment-no2-2026'], 'confirmed',
        'People aged 65 or over at any point in the tax year keep the full £20,000 cash limit.');
    },
  },
  {
    effectiveFrom: '2027-04-06',
    summary: 'Savings income tax rates rise by 2 points to 22% (basic), 42% (higher) and 47% (additional).',
    status: 'announced',
    source: [{ id: 'govuk-property-savings-dividend-rates' }],
    verified: VERIFIED,
    apply: (r) => {
      r.savingsAndDividends.savingsRates = v({ basic: 0.22, higher: 0.42, additional: 0.47 }, 'govuk-property-savings-dividend-rates', 'announced');
    },
  },
  {
    effectiveFrom: '2029-04-06',
    summary: 'Salary-sacrificed pension contributions above £2,000 a year become liable to employee and employer National Insurance.',
    status: 'announced',
    source: [{ id: 'govuk-salary-sacrifice-2029' }, { id: 'parliament-nic-employer-pensions-bill' }],
    verified: VERIFIED,
    apply: (r) => {
      r.nationalInsurance.salarySacrificeCap = v(2_000, ['govuk-salary-sacrifice-2029', 'parliament-nic-employer-pensions-bill'], 'announced',
        'The enabling Act received Royal Assent in April 2026 and requires the first limit to be £2,000. Detailed regulations are still to be made.');
    },
  },
];
