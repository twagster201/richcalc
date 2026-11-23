import { useSettings } from '../../lib/settings';
import { LB_PER_KG, CM_PER_IN } from '../../lib/health';

/** Format a weight (kg internally) in the user's units. */
export function useWeightFormat() {
  const { imperial, number } = useSettings();
  return (kg, decimals = 1) => (imperial ? `${number(kg * LB_PER_KG, decimals)} lb` : `${number(kg, decimals)} kg`);
}

/** Format a height (cm internally) in the user's units. */
export function useHeightFormat() {
  const { imperial, number } = useSettings();
  return (cm) => {
    if (!imperial) return `${number(cm, 0)} cm`;
    const totalIn = Math.round(cm / CM_PER_IN);
    return `${Math.floor(totalIn / 12)}′ ${totalIn % 12}″`;
  };
}

export const kcalToKj = (kcal) => kcal * 4.184;
