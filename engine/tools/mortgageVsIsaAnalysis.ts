/** Run the mortgage-vs-ISA simulation and reduce it to what the page shows. */
import { ECONOMIC, EQUITY_TAIL_DF } from '../../assumptions/economic';
import type { Assumption, AssumptionValues } from '../../assumptions/types';
import { buildPaths, drawShocks, type Shocks } from '../sim/esg';
import { esgParamsFrom } from '../sim/params';
import { column, dotQuantiles, median, summariseByYear, summariseColumn, type YearSummary } from '../analysis/summarise';
import { findFlip, tornado, type Evaluate, type FlipPoint, type TornadoItem } from '../analysis/sensitivity';
import { quantileSorted } from '../core/stats';
import { runMortgageVsIsa, yearsNeeded, type MortgageVsIsaInputs, type MortgageVsIsaResult } from './mortgageVsIsa';

export interface RunOptions {
  seed: number;
  runs: number;
}

export interface MortgageVsIsaSummary {
  runs: number;
  years: number;
  seed: number;
  /** Invest minus overpay, today's money. Positive = investing ahead. */
  diff: YearSummary[];
  accessibleOverpay: YearSummary[];
  accessibleInvest: YearSummary[];
  /** 50 quantile dots of the difference for every year (index 0 = year 1). */
  dotsByYear: number[][];
  mortgageFreeOverpay: { p10: number; p50: number; p90: number; contractualYears: number };
  allowance: { shareOfRunsCapped: number; medianDiverted: number };
  overflow: { shareOfRunsOverflowing: number; medianOverflow: number };
  startingPayment: number;
}

export function simulateMortgageVsIsa(
  inputs: MortgageVsIsaInputs,
  values: AssumptionValues,
  options: RunOptions,
  shocks?: Shocks,
): MortgageVsIsaResult {
  const years = yearsNeeded(inputs);
  const s = shocks ?? drawShocks(options.seed, options.runs, years, EQUITY_TAIL_DF);
  return runMortgageVsIsa(inputs, values, buildPaths(esgParamsFrom(values), s));
}

function quantiles3(values: Float64Array) {
  const sorted = Float64Array.from(values).sort();
  return { p10: quantileSorted(sorted, 0.1), p50: quantileSorted(sorted, 0.5), p90: quantileSorted(sorted, 0.9) };
}

export function summariseMortgageVsIsa(inputs: MortgageVsIsaInputs, values: AssumptionValues, options: RunOptions): MortgageVsIsaSummary {
  const res = simulateMortgageVsIsa(inputs, values, options);
  const { runs, years } = res;
  const dotsByYear: number[][] = [];
  for (let y = 0; y < years; y++) dotsByYear.push(dotQuantiles(column(res.diffReal, runs, years, y)));

  let capped = 0;
  let overflowing = 0;
  for (let r = 0; r < runs; r++) {
    if (res.divertedByAllowance[r] > 1) capped++;
    if (res.overflowOutsideIsa[r] > 1) overflowing++;
  }
  return {
    runs,
    years,
    seed: options.seed,
    diff: summariseByYear(res.diffReal, runs, years),
    accessibleOverpay: summariseByYear(res.accessibleOverpayReal, runs, years),
    accessibleInvest: summariseByYear(res.accessibleInvestReal, runs, years),
    dotsByYear,
    mortgageFreeOverpay: { ...quantiles3(res.mortgageFreeYearsOverpay), contractualYears: res.termMonths / 12 },
    allowance: { shareOfRunsCapped: capped / runs, medianDiverted: median(res.divertedByAllowance) },
    overflow: { shareOfRunsOverflowing: overflowing / runs, medianOverflow: median(res.overflowOutsideIsa) },
    startingPayment: res.startingPayment,
  };
}

/** Assumptions worth testing for these inputs. */
export function sensitivityCandidates(inputs: MortgageVsIsaInputs): Assumption[] {
  const shared = ['rate.longRunReal', 'mort.spread', 'infl.longRun', 'rate.vol', 'mort.refixYears'];
  const keys =
    inputs.isaType === 'cash'
      ? ['cash.spread', ...shared]
      : ['eq.return', 'eq.vol', 'bond.return', 'fees', ...shared];
  return keys.map((k) => ECONOMIC[k]);
}

export interface MortgageVsIsaSensitivity {
  horizonYear: number;
  tornado: TornadoItem[];
  flips: FlipPoint[];
}

export function mortgageVsIsaSensitivity(
  inputs: MortgageVsIsaInputs,
  values: AssumptionValues,
  options: RunOptions & { horizonYear: number; top?: number },
): MortgageVsIsaSensitivity {
  const years = yearsNeeded(inputs);
  const h = Math.min(Math.max(1, options.horizonYear), years) - 1;
  const shocks = drawShocks(options.seed, options.runs, years, EQUITY_TAIL_DF);
  const evaluate: Evaluate = (v) => {
    const res = runMortgageVsIsa(inputs, v, buildPaths(esgParamsFrom(v), shocks));
    const s = summariseColumn(column(res.diffReal, res.runs, res.years, h), h + 1);
    return { median: s.p50, probPositive: s.probPositive };
  };
  const items = tornado(evaluate, values, sensitivityCandidates(inputs));
  const top = items.slice(0, options.top ?? 3);
  const flips = top.map((t) => findFlip(evaluate, values, ECONOMIC[t.key]));
  return { horizonYear: h + 1, tornado: items, flips };
}
