/**
 * Class 1 National Insurance on employment earnings, worked out on an annual basis.
 *
 * Payroll actually calculates NI per pay period (weekly or monthly), which can differ slightly
 * from the annual figure when pay varies. For steady monthly pay the results are the same to
 * within pennies; RichCalc uses the annual basis and says so.
 */
import type { RuleSet } from '../../rules/schema';

export function employeeNI(rules: RuleSet, niableEarnings: number): number {
  const ni = rules.nationalInsurance;
  const pt = ni.primaryThreshold.value;
  const uel = ni.upperEarningsLimit.value;
  const main = Math.max(0, Math.min(niableEarnings, uel) - pt) * ni.employeeMainRate.value;
  const upper = Math.max(0, niableEarnings - uel) * ni.employeeUpperRate.value;
  return main + upper;
}

export function employerNI(rules: RuleSet, niableEarnings: number): number {
  const ni = rules.nationalInsurance;
  return Math.max(0, niableEarnings - ni.secondaryThreshold.value) * ni.employerRate.value;
}

/**
 * NI-able pay after a salary-sacrifice pension arrangement. Up to the cap (if any) the sacrifice
 * is NI-free; any sacrifice above the cap is added back to NI-able pay.
 */
export function niableAfterSacrifice(rules: RuleSet, grossSalary: number, sacrifice: number): number {
  const cap = rules.nationalInsurance.salarySacrificeCap.value;
  const exempt = cap === null ? sacrifice : Math.min(sacrifice, cap);
  return Math.max(0, grossSalary - exempt);
}

/** Whether pay is at or above the lower earnings limit, which protects State Pension qualifying years. */
export function aboveLowerEarningsLimit(rules: RuleSet, niableEarnings: number): boolean {
  return niableEarnings >= rules.nationalInsurance.lowerEarningsLimit.value;
}
