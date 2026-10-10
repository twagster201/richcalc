/// <reference lib="webworker" />
import { mortgageVsIsaSensitivity, summariseMortgageVsIsa } from '../../engine/tools/mortgageVsIsaAnalysis';
import type { WorkerRequest, WorkerResponse } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  const t0 = performance.now();
  try {
    let res: WorkerResponse;
    if (req.kind === 'main') {
      const result = summariseMortgageVsIsa(req.inputs, req.values, { seed: req.seed, runs: req.runs });
      res = { id: req.id, kind: 'main', result, ms: performance.now() - t0 };
    } else {
      const result = mortgageVsIsaSensitivity(req.inputs, req.values, {
        seed: req.seed,
        runs: req.runs,
        horizonYear: req.horizonYear,
      });
      res = { id: req.id, kind: 'sensitivity', result, ms: performance.now() - t0 };
    }
    self.postMessage(res);
  } catch (err) {
    self.postMessage({ id: req.id, kind: 'error', message: err instanceof Error ? err.message : String(err) } satisfies WorkerResponse);
  }
};
