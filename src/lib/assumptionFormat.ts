import type { Assumption } from '../../assumptions/types';
import { pct } from './format';

export function formatAssumption(a: Assumption, v: number): string {
  switch (a.unit) {
    case 'percent':
      return pct(v, 2);
    case 'pp':
      return `${(v * 100).toFixed(2).replace(/\.?0+$/, '').replace('-', '−')} pts`;
    case 'years':
      return `${v} yr${v === 1 ? '' : 's'}`;
    case 'pounds':
      return `£${Math.round(v).toLocaleString('en-GB')}`;
    default:
      return v.toFixed(2);
  }
}

export function unitSuffix(a: Assumption): string {
  return a.unit === 'percent' ? '%' : a.unit === 'pp' ? 'points' : a.unit === 'years' ? 'years' : '';
}
