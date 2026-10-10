/**
 * Types shared by every rule set and assumption file.
 *
 * Every number that comes from the outside world is wrapped in `Sourced<T>` so the UI,
 * the generated docs and CI can all see where it came from, when it was last checked,
 * and how much confidence to place in it.
 */
import type { SourceId } from './sources';

export type Status =
  /** In force or legislated, checked against the primary source. */
  | 'confirmed'
  /** Announced by government for a future date; legislation pending or only partly made. */
  | 'announced'
  /** Market practice rather than a government rule (e.g. 10% ERC-free overpayments). */
  | 'convention'
  /** A modelling choice made by RichCalc, with the reasoning written down. */
  | 'judgement'
  /** Could not be verified against a primary source. Shown with a visible badge. */
  | 'unverified';

export interface SourceRef {
  id: SourceId;
  /** Section, table or paragraph within the source. */
  locator?: string;
}

export interface Sourced<T> {
  value: T;
  source: SourceRef[];
  /** ISO date this value was last checked against its source. */
  verified: string;
  status: Status;
  /** Plain-English note: why this value, and anything surprising about it. */
  note?: string;
}

/** A marginal-rate band: `rate` applies to income from `from` up to the next band's `from`. */
export interface Band {
  from: number;
  rate: number;
  name: string;
}

/** A slice-based property tax schedule: `rate` applies to the part of the price above `from`. */
export interface Slice {
  from: number;
  rate: number;
}

export interface PropertyTaxSchedule {
  standard: Slice[];
  /** First-time buyer schedule, if any, and the price above which it is withdrawn entirely. */
  firstTimeBuyer?: { slices: Slice[]; maxPrice: number | null };
}

export type StudentLoanPlan = 'plan1' | 'plan2' | 'plan4' | 'plan5';

export interface StudentLoanRule {
  threshold: number;
  rate: number;
}

export interface RuleSet {
  id: string; // '2026-27'
  taxYear: string; // '2026/27'
  validFrom: string; // ISO
  validTo: string; // ISO, inclusive
  incomeTax: {
    personalAllowance: Sourced<number>;
    /** Adjusted net income above which the personal allowance is withdrawn. */
    taperThreshold: Sourced<number>;
    /** Allowance lost per £1 of income over the threshold (0.5 = £1 for every £2). */
    taperRate: Sourced<number>;
    /** England, Wales and Northern Ireland: bands on taxable income (income after the allowance). */
    rUK: Sourced<Band[]>;
    /** Scotland, non-savings non-dividend income: bands on taxable income (income after the allowance). */
    scotland: Sourced<Band[]>;
  };
  savingsAndDividends: {
    /** UK-wide rates on savings income by band (basic, higher, additional). */
    savingsRates: Sourced<{ basic: number; higher: number; additional: number }>;
    startingRateLimit: Sourced<number>;
    personalSavingsAllowance: Sourced<{ basic: number; higher: number; additional: number }>;
    dividendRates: Sourced<{ basic: number; higher: number; additional: number }>;
    dividendAllowance: Sourced<number>;
  };
  capitalGains: {
    annualExemptAmount: Sourced<number>;
    rates: Sourced<{ basic: number; higher: number }>;
  };
  nationalInsurance: {
    lowerEarningsLimit: Sourced<number>;
    primaryThreshold: Sourced<number>;
    upperEarningsLimit: Sourced<number>;
    employeeMainRate: Sourced<number>;
    employeeUpperRate: Sourced<number>;
    secondaryThreshold: Sourced<number>;
    employerRate: Sourced<number>;
    /** Annual salary-sacrifice pension amount still exempt from NI. null = no cap. */
    salarySacrificeCap: Sourced<number | null>;
  };
  studentLoans: {
    plans: Sourced<Record<StudentLoanPlan, StudentLoanRule>>;
    postgraduate: Sourced<StudentLoanRule>;
  };
  childBenefit: {
    weeklyEldest: Sourced<number>;
    weeklyAdditional: Sourced<number>;
    hicbcThreshold: Sourced<number>;
    /** Income above the threshold that removes 1% of child benefit. */
    hicbcStep: Sourced<number>;
  };
  childcare: {
    taxFreeChildcare: Sourced<{
      topUpRate: number; // government adds £2 per £8 paid in = 20% of the total bill
      maxPerChild: number;
      maxPerDisabledChild: number;
      incomeLimit: number; // per parent, adjusted net income; ineligible if over
      minWeeklyHoursAtMinimumWage: number;
    }>;
    englandWorkingParents: Sourced<{
      hoursPerWeek: number;
      weeksPerYear: number;
      fromAgeMonths: number;
      incomeLimit: number; // per parent, adjusted net income
    }>;
    englandUniversal3to4: Sourced<{ hoursPerWeek: number; weeksPerYear: number }>;
    scotlandFunded3to4: Sourced<{ hoursPerYear: number; incomeTested: false }>;
    walesChildcareOffer: Sourced<{
      maxHoursPerWeek: number;
      weeksPerYear: number;
      incomeLimit: number; // per parent, GROSS income before pension or salary sacrifice
      incomeBasis: 'gross';
    }>;
    northernIrelandSubsidy: Sourced<{ subsidyRate: number; linkedToTaxFreeChildcare: true }>;
  };
  isa: {
    overallAllowance: Sourced<number>;
    /** Cash ISA cap for people under 65. null = no separate cap. */
    cashCapUnder65: Sourced<number | null>;
  };
  pensions: {
    annualAllowance: Sourced<number>;
    taperThresholdIncome: Sourced<number>;
    taperAdjustedIncome: Sourced<number>;
    minimumTaperedAllowance: Sourced<number>;
    basicReliefAtSource: Sourced<number>;
  };
  propertyTax: {
    sdlt: Sourced<PropertyTaxSchedule>; // England and Northern Ireland
    lbtt: Sourced<PropertyTaxSchedule>; // Scotland
    ltt: Sourced<PropertyTaxSchedule>; // Wales
  };
  minimumWage: Sourced<{ age21plus: number; age18to20: number; under18: number }>;
}

/**
 * An announced change that takes effect on a known date. `apply` receives a deep clone of
 * the rule set in force just before `effectiveFrom` and returns it changed.
 */
export interface ScheduledChange {
  effectiveFrom: string; // ISO date
  summary: string;
  status: 'announced' | 'confirmed';
  source: SourceRef[];
  verified: string;
  apply: (rules: RuleSet) => void;
}
