import type { AssumptionValues } from '../../assumptions/types';
import { SHOCK_CORRELATION } from '../../assumptions/economic';
import type { EsgParams } from './esg';

/** Map assumption values (by key) to scenario-generator parameters. */
export function esgParamsFrom(v: AssumptionValues): EsgParams {
  return {
    inflStart: v['infl.start'],
    inflLongRun: v['infl.longRun'],
    inflFade: v['infl.fade'],
    inflVol: v['infl.vol'],
    inflPersistence: v['infl.persistence'],
    rateStart: v['rate.start'],
    rateLongRun: v['rate.longRunReal'] + v['infl.longRun'],
    ratePersistence: v['rate.persistence'],
    rateVol: v['rate.vol'],
    rateInflationResponse: v['rate.inflationResponse'],
    equityReturn: v['eq.return'],
    equityVol: v['eq.vol'],
    bondReturn: v['bond.return'],
    bondVol: v['bond.vol'],
    correlation: SHOCK_CORRELATION.matrix,
  };
}
