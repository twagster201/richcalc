import type { AssumptionValues } from '../../assumptions/types';
import type { MortgageVsIsaInputs } from '../../engine/tools/mortgageVsIsa';
import type { MortgageVsIsaSensitivity, MortgageVsIsaSummary } from '../../engine/tools/mortgageVsIsaAnalysis';

export type WorkerRequest =
  | { id: number; kind: 'main'; inputs: MortgageVsIsaInputs; values: AssumptionValues; seed: number; runs: number }
  | { id: number; kind: 'sensitivity'; inputs: MortgageVsIsaInputs; values: AssumptionValues; seed: number; runs: number; horizonYear: number };

export type WorkerResponse =
  | { id: number; kind: 'main'; result: MortgageVsIsaSummary; ms: number }
  | { id: number; kind: 'sensitivity'; result: MortgageVsIsaSensitivity; ms: number }
  | { id: number; kind: 'error'; message: string };

export const MAIN_RUNS = 5_000;
export const SENSITIVITY_RUNS = 1_000;
