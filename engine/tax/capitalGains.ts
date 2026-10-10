/** Capital gains tax on a disposal of investments (not a main home). */
import type { RuleSet } from '../../rules/schema';

/**
 * CGT on `gain`, given how much of the basic rate band is left unused by taxable income
 * (`unusedBasicBand`). Gains within the unused basic band are taxed at the lower rate.
 */
export function capitalGainsTax(rules: RuleSet, gain: number, unusedBasicBand: number): number {
  const cg = rules.capitalGains;
  const taxable = Math.max(0, gain - cg.annualExemptAmount.value);
  const atBasic = Math.min(taxable, Math.max(0, unusedBasicBand));
  return atBasic * cg.rates.value.basic + (taxable - atBasic) * cg.rates.value.higher;
}
