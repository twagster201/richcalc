/** Stamp Duty Land Tax (England, Northern Ireland), LBTT (Scotland) and LTT (Wales) on a main home. */
import type { RuleSet, Slice } from '../../rules/schema';

export type Nation = 'england' | 'wales' | 'scotland' | 'northernIreland';

export function sliceTax(slices: Slice[], price: number): number {
  let tax = 0;
  for (let i = 0; i < slices.length; i++) {
    const top = i + 1 < slices.length ? slices[i + 1].from : Infinity;
    const part = Math.min(price, top) - slices[i].from;
    if (part > 0) tax += part * slices[i].rate;
  }
  return tax;
}

export interface PropertyTaxResult {
  tax: number;
  taxName: 'Stamp Duty Land Tax' | 'Land and Buildings Transaction Tax' | 'Land Transaction Tax';
  firstTimeBuyerReliefApplied: boolean;
}

export function propertyTax(rules: RuleSet, nation: Nation, price: number, firstTimeBuyer: boolean): PropertyTaxResult {
  const { schedule, taxName } =
    nation === 'scotland'
      ? { schedule: rules.propertyTax.lbtt.value, taxName: 'Land and Buildings Transaction Tax' as const }
      : nation === 'wales'
        ? { schedule: rules.propertyTax.ltt.value, taxName: 'Land Transaction Tax' as const }
        : { schedule: rules.propertyTax.sdlt.value, taxName: 'Stamp Duty Land Tax' as const };

  const standard = sliceTax(schedule.standard, price);
  const ftb = schedule.firstTimeBuyer;
  if (firstTimeBuyer && ftb && (ftb.maxPrice === null || price <= ftb.maxPrice)) {
    const relieved = sliceTax(ftb.slices, price);
    if (relieved < standard) return { tax: relieved, taxName, firstTimeBuyerReliefApplied: true };
  }
  return { tax: standard, taxName, firstTimeBuyerReliefApplied: false };
}
