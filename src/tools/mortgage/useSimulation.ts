/**
 * Runs simulations in Web Workers so the page never blocks. The main result and the slower
 * sensitivity analysis use separate workers; a stale sensitivity run is abandoned (the worker is
 * terminated) as soon as inputs change.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { AssumptionValues } from '../../../assumptions/types';
import type { MortgageVsIsaInputs } from '../../../engine/tools/mortgageVsIsa';
import type { MortgageVsIsaSensitivity, MortgageVsIsaSummary } from '../../../engine/tools/mortgageVsIsaAnalysis';
import { MAIN_RUNS, SENSITIVITY_RUNS, type WorkerRequest, type WorkerResponse } from '../../worker/protocol';

export interface SimState {
  main: MortgageVsIsaSummary | null;
  sensitivity: MortgageVsIsaSensitivity | null;
  mainPending: boolean;
  sensitivityPending: boolean;
  error: string | null;
  lastMs: number | null;
}

function makeWorker(): Worker {
  return new Worker(new URL('../../worker/sim.worker.ts', import.meta.url), { type: 'module' });
}

export function simKey(inputs: MortgageVsIsaInputs, values: AssumptionValues, seed: number): string {
  return JSON.stringify([inputs, values, seed]);
}

export function useSimulation(
  inputs: MortgageVsIsaInputs,
  values: AssumptionValues,
  seed: number,
  horizon: number,
  initial: { key: string; main: MortgageVsIsaSummary; sensitivity: MortgageVsIsaSensitivity | null; horizon: number } | null,
): SimState {
  const key = simKey(inputs, values, seed);
  const [state, setState] = useState<SimState>({
    main: initial?.main ?? null,
    sensitivity: initial?.sensitivity ?? null,
    mainPending: false,
    sensitivityPending: false,
    error: null,
    lastMs: null,
  });
  const mainWorker = useRef<Worker | null>(null);
  const sensWorker = useRef<Worker | null>(null);
  const sensBusy = useRef(false);
  const nextId = useRef(1);
  const latestMain = useRef(0);
  const latestSens = useRef(0);
  const shownKey = useRef(initial?.key ?? '');
  const shownSensKey = useRef(initial ? `${initial.key}|${initial.horizon}` : '');

  useEffect(
    () => () => {
      mainWorker.current?.terminate();
      sensWorker.current?.terminate();
    },
    [],
  );

  // Main result.
  useEffect(() => {
    if (key === shownKey.current) return;
    setState((s) => ({ ...s, mainPending: true }));
    const t = setTimeout(() => {
      const w = (mainWorker.current ??= makeWorker());
      const id = nextId.current++;
      latestMain.current = id;
      w.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const res = e.data;
        if (res.id !== latestMain.current) return;
        if (res.kind === 'main') {
          shownKey.current = key;
          setState((s) => ({ ...s, main: res.result, mainPending: false, error: null, lastMs: res.ms }));
        } else if (res.kind === 'error') {
          setState((s) => ({ ...s, mainPending: false, error: res.message }));
        }
      };
      const req: WorkerRequest = { id, kind: 'main', inputs, values, seed, runs: MAIN_RUNS };
      w.postMessage(req);
    }, 120);
    return () => clearTimeout(t);
  }, [key]);

  // Sensitivity analysis (depends on the horizon too).
  const sensKey = `${key}|${horizon}`;
  useEffect(() => {
    if (sensKey === shownSensKey.current) return;
    setState((s) => ({ ...s, sensitivityPending: true }));
    const t = setTimeout(() => {
      if (sensBusy.current && sensWorker.current) {
        sensWorker.current.terminate();
        sensWorker.current = null;
      }
      const w = (sensWorker.current ??= makeWorker());
      const id = nextId.current++;
      latestSens.current = id;
      sensBusy.current = true;
      w.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const res = e.data;
        sensBusy.current = false;
        if (res.id !== latestSens.current) return;
        if (res.kind === 'sensitivity') {
          shownSensKey.current = sensKey;
          setState((s) => ({ ...s, sensitivity: res.result, sensitivityPending: false }));
        } else if (res.kind === 'error') {
          setState((s) => ({ ...s, sensitivityPending: false, error: res.message }));
        }
      };
      const req: WorkerRequest = { id, kind: 'sensitivity', inputs, values, seed, runs: SENSITIVITY_RUNS, horizonYear: horizon };
      w.postMessage(req);
    }, 450);
    return () => clearTimeout(t);
  }, [sensKey]);

  return state;
}
