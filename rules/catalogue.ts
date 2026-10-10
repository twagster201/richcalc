/**
 * A flat, human-readable list of every value in a rule set, used by the /assumptions/ page and
 * by the generated ASSUMPTIONS.md, so both always match the rules file.
 */
import type { Band, PropertyTaxSchedule, RuleSet, Slice, Sourced } from './schema';

export interface RuleEntry {
  path: string;
  label: string;
  value: string;
  sourced: Sourced<unknown>;
}

const LABELS: Record<string, string> = {
  'incomeTax.personalAllowance': 'Personal allowance',
  'incomeTax.taperThreshold': 'Personal allowance taper starts (adjusted net income)',
  'incomeTax.taperRate': 'Allowance lost per £1 over the taper threshold',
  'incomeTax.rUK': 'Income tax bands: England, Wales, Northern Ireland (taxable income)',
  'incomeTax.scotland': 'Income tax bands: Scotland (taxable income)',
  'savingsAndDividends.savingsRates': 'Savings income tax rates (basic / higher / additional)',
  'savingsAndDividends.startingRateLimit': 'Starting rate for savings band (0%)',
  'savingsAndDividends.personalSavingsAllowance': 'Personal savings allowance (basic / higher / additional)',
  'savingsAndDividends.dividendRates': 'Dividend tax rates (basic / higher / additional)',
  'savingsAndDividends.dividendAllowance': 'Dividend allowance',
  'capitalGains.annualExemptAmount': 'Capital gains annual exempt amount',
  'capitalGains.rates': 'Capital gains tax rates (basic / higher)',
  'nationalInsurance.lowerEarningsLimit': 'NI lower earnings limit',
  'nationalInsurance.primaryThreshold': 'NI primary threshold (employees start paying)',
  'nationalInsurance.upperEarningsLimit': 'NI upper earnings limit',
  'nationalInsurance.employeeMainRate': 'Employee NI main rate',
  'nationalInsurance.employeeUpperRate': 'Employee NI rate above upper earnings limit',
  'nationalInsurance.secondaryThreshold': 'Employer NI secondary threshold',
  'nationalInsurance.employerRate': 'Employer NI rate',
  'nationalInsurance.salarySacrificeCap': 'NI-free salary sacrifice cap (pensions)',
  'studentLoans.plans': 'Student loan thresholds and rates',
  'studentLoans.postgraduate': 'Postgraduate loan threshold and rate',
  'childBenefit.weeklyEldest': 'Child benefit, eldest child (weekly)',
  'childBenefit.weeklyAdditional': 'Child benefit, each other child (weekly)',
  'childBenefit.hicbcThreshold': 'High Income Child Benefit Charge starts',
  'childBenefit.hicbcStep': 'HICBC: income per 1% of benefit withdrawn',
  'childcare.taxFreeChildcare': 'Tax-Free Childcare',
  'childcare.englandWorkingParents': 'England: funded childcare for working parents',
  'childcare.englandUniversal3to4': 'England: universal hours for 3–4 year olds',
  'childcare.scotlandFunded3to4': 'Scotland: funded early learning and childcare',
  'childcare.walesChildcareOffer': 'Wales: Childcare Offer',
  'childcare.northernIrelandSubsidy': 'Northern Ireland Childcare Subsidy Scheme',
  'isa.overallAllowance': 'ISA allowance (per person, per year)',
  'isa.cashCapUnder65': 'Cash ISA limit for under-65s',
  'pensions.annualAllowance': 'Pension annual allowance',
  'pensions.taperThresholdIncome': 'Tapered annual allowance: threshold income',
  'pensions.taperAdjustedIncome': 'Tapered annual allowance: adjusted income',
  'pensions.minimumTaperedAllowance': 'Minimum tapered annual allowance',
  'pensions.basicReliefAtSource': 'Relief at source added to personal contributions',
  'propertyTax.sdlt': 'Stamp Duty Land Tax (England and Northern Ireland)',
  'propertyTax.lbtt': 'Land and Buildings Transaction Tax (Scotland)',
  'propertyTax.ltt': 'Land Transaction Tax (Wales)',
  minimumWage: 'National Minimum / Living Wage (hourly)',
};

const gbp = (n: number) => `£${n.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
const pc = (n: number) => `${+(n * 100).toFixed(2)}%`;

function isBands(v: unknown): v is Band[] {
  return Array.isArray(v) && v.every((b) => typeof b === 'object' && b && 'name' in b && 'rate' in b);
}
function slices(s: Slice[]): string {
  return s.map((x, i) => `${pc(x.rate)} ${i + 1 < s.length ? `${gbp(x.from)}–${gbp(s[i + 1].from)}` : `above ${gbp(x.from)}`}`).join('; ');
}

function describe(path: string, v: unknown): string {
  if (v === null) return 'None';
  if (typeof v === 'number') {
    if (path.endsWith('Rate') || path.endsWith('taperRate') || path.endsWith('basicReliefAtSource')) return pc(v);
    if (path.startsWith('childBenefit.weekly')) return gbp(v);
    if (path.endsWith('hicbcStep')) return `${gbp(v)} per 1%`;
    return gbp(v);
  }
  if (isBands(v)) return v.map((b) => `${b.name} ${pc(b.rate)} from ${gbp(b.from)}`).join('; ');
  if (path.startsWith('propertyTax.')) {
    const s = v as PropertyTaxSchedule;
    const ftb = s.firstTimeBuyer
      ? ` First-time buyers: ${slices(s.firstTimeBuyer.slices)}${s.firstTimeBuyer.maxPrice ? ` (only up to ${gbp(s.firstTimeBuyer.maxPrice)})` : ''}.`
      : ' No first-time buyer relief.';
    return `${slices(s.standard)}.${ftb}`;
  }
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, x]) => {
        if (typeof x === 'object' && x && 'threshold' in x) {
          const r = x as { threshold: number; rate: number };
          return `${k}: ${pc(r.rate)} above ${gbp(r.threshold)}`;
        }
        if (typeof x === 'number') return `${k}: ${k.toLowerCase().includes('rate') || x < 1 ? (x < 1 && x > 0 ? pc(x) : String(x)) : x >= 100 ? gbp(x) : String(x)}`;
        return `${k}: ${String(x)}`;
      })
      .join('; ');
  }
  return String(v);
}

export function ruleEntries(rules: RuleSet): RuleEntry[] {
  const out: RuleEntry[] = [];
  const walk = (obj: unknown, path: string) => {
    if (obj && typeof obj === 'object' && 'value' in obj && 'source' in obj && 'status' in obj) {
      const s = obj as Sourced<unknown>;
      out.push({ path, label: LABELS[path] ?? path, value: describe(path, s.value), sourced: s });
      return;
    }
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [k, v] of Object.entries(obj)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  for (const [k, v] of Object.entries(rules)) if (typeof v === 'object') walk(v, k);
  return out;
}
