/** Child benefit and the High Income Child Benefit Charge (HICBC). */
import type { RuleSet } from '../../rules/schema';

/** Annual child benefit for `children` children, using 52 weekly payments. */
export function childBenefitAnnual(rules: RuleSet, children: number): number {
  if (children <= 0) return 0;
  const cb = rules.childBenefit;
  return 52 * (cb.weeklyEldest.value + (children - 1) * cb.weeklyAdditional.value);
}

/**
 * The charge on the higher earner: 1% of the benefit for every whole £200 of adjusted net income
 * over £60,000, capped at 100%.
 */
export function hicbc(rules: RuleSet, adjustedNetIncome: number, childBenefit: number): number {
  const cb = rules.childBenefit;
  const excess = adjustedNetIncome - cb.hicbcThreshold.value;
  if (excess <= 0 || childBenefit <= 0) return 0;
  const percent = Math.min(100, Math.floor(excess / cb.hicbcStep.value));
  return (childBenefit * percent) / 100;
}
