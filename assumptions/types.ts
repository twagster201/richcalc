import type { Sourced } from '../rules/schema';

export type AssumptionUnit = 'percent' | 'pp' | 'years' | 'ratio' | 'pounds';

/**
 * A modelling assumption: a default the user can change. Percentages are stored as fractions
 * (0.05 = 5%) and displayed as percentages.
 */
export interface Assumption extends Sourced<number> {
  key: string;
  label: string;
  unit: AssumptionUnit;
  group: 'Inflation' | 'Interest rates' | 'Investments' | 'Mortgage' | 'Tax and allowances';
  /** Plausible low/high (roughly a 10th–90th percentile view) used for the sensitivity chart. */
  range: { low: number; high: number };
  /** Hard limits for inputs and for flip-point searches. */
  bounds: { min: number; max: number };
  /** What this is, in plain English, for the assumptions panel. */
  explain: string;
  /** Step for the input control, in display units. */
  step: number;
}

export type AssumptionSet = Record<string, Assumption>;
export type AssumptionValues = Record<string, number>;

export function defaultsOf(set: AssumptionSet): AssumptionValues {
  return Object.fromEntries(Object.values(set).map((a) => [a.key, a.value]));
}
