import type { EsgPaths } from '../../engine/sim/esg';

/** Deterministic paths for hand-checkable tool tests. */
export function flatPaths(years: number, opts: { inflation?: number; bankRate?: number; equityReal?: number; bondReal?: number }): EsgPaths {
  const n = years;
  const fill = (v: number) => new Float64Array(n).fill(v);
  return {
    runs: 1,
    years,
    inflation: fill(opts.inflation ?? 0),
    bankRate: fill(opts.bankRate ?? 0.03),
    equityLogReal: fill(Math.log(1 + (opts.equityReal ?? 0.05))),
    bondLogReal: fill(Math.log(1 + (opts.bondReal ?? 0.01))),
  };
}
