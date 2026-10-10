/**
 * Quantile dot plot: 50 dots, each standing for 2% of simulated futures, stacked where they land.
 * Dots above zero are filled in option B's colour; dots at or below zero are hollow rings in
 * option A's colour, so the two groups differ in shape as well as colour.
 *
 * Research (Kay et al., CHI 2016; Fernandes et al., CHI 2018) found people judge probabilities
 * more accurately from quantile dot plots than from density curves or intervals.
 */
import { useState } from 'preact/hooks';
import { moneyCompact, moneySigned, niceTicks } from '../../lib/format';
import { linear, useWidth } from './useWidth';

const M = { top: 8, right: 16, bottom: 30, left: 16 };
const MAX_STACK_H = 190;

interface Placed {
  value: number;
  cx: number;
  cy: number;
  i: number;
}

function layout(values: number[], x: (v: number) => number, plotLeft: number, plotW: number, d: number) {
  const bins = new Map<number, number>();
  const placed: Placed[] = [];
  let maxStack = 0;
  values.forEach((v, i) => {
    const bin = Math.round((x(v) - plotLeft) / d);
    const k = bins.get(bin) ?? 0;
    bins.set(bin, k + 1);
    maxStack = Math.max(maxStack, k + 1);
    placed.push({ value: v, cx: plotLeft + Math.min(plotW, Math.max(0, bin * d)), cy: k, i });
  });
  return { placed, maxStack };
}

export function DotPlot(props: {
  values: number[];
  aboveLabel: string;
  belowLabel: string;
  summary: string;
  animateKey?: string | number;
}) {
  const { values, aboveLabel, belowLabel, summary, animateKey } = props;
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, ...values);
  const ticks = niceTicks(lo, hi, width < 480 ? 4 : 6);
  const dMin = Math.min(lo, ticks[0]);
  const dMax = Math.max(hi, ticks[ticks.length - 1]);
  const plotW = width - M.left - M.right;
  const x = linear(dMin, dMax, M.left, M.left + plotW);

  // Pick the largest dot size whose tallest stack still fits.
  let d = 16;
  let res = layout(values, x, M.left, plotW, d);
  while (d > 6 && res.maxStack * d > MAX_STACK_H) {
    d -= 1;
    res = layout(values, x, M.left, plotW, d);
  }
  const stackH = Math.max(res.maxStack * d, 4 * d);
  const H = M.top + stackH + M.bottom;
  const base = M.top + stackH;
  const r = d / 2 - 1;
  const above = values.filter((v) => v > 0).length;
  const zx = x(0);
  const tip = hover !== null ? res.placed[hover] : null;

  return (
    <figure class="chart" ref={ref}>
      <div class="dot-counts" aria-hidden="true">
        <span>← {belowLabel}: <strong>{values.length - above}</strong> of {values.length}</span>
        <span>{aboveLabel}: <strong>{above}</strong> of {values.length} →</span>
      </div>
      <div role="img" aria-label={summary}>
        <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
          <g class="grid">
            <line x1={M.left} x2={M.left + plotW} y1={base + 1} y2={base + 1} />
          </g>
          <g class="axis">
            {ticks.map((t) => (
              <text key={t} x={x(t)} y={H - 8} text-anchor="middle">
                {moneyCompact(t)}
              </text>
            ))}
          </g>
          <line class="zero" x1={zx} x2={zx} y1={M.top} y2={base} />
          <g key={animateKey}>
            {res.placed.map((p) => (
              <circle
                key={p.i}
                class={`${p.value > 0 ? 'dot-b' : 'dot-a'} fan-drop${hover === p.i ? ' dot-hover' : ''}`}
                cx={p.cx}
                cy={base - p.cy * d - d / 2}
                r={r}
                onPointerEnter={() => setHover(p.i)}
                onPointerLeave={() => setHover(null)}
              />
            ))}
          </g>
        </svg>
        {tip && (
          <div class="tooltip" style={{ left: `${Math.min(Math.max(tip.cx - 90, 0), width - 200)}px`, top: '0px' }} aria-hidden="true">
            <div class="t-title">One dot = 1 in 50 futures</div>
            <div class="t-row"><span>Difference</span><strong>{moneySigned(tip.value)}</strong></div>
          </div>
        )}
      </div>
      <ul class="legend" aria-label="Key">
        <li><span class="key dot-b" /> {aboveLabel}</li>
        <li><span class="key dot-a" /> {belowLabel}</li>
      </ul>
    </figure>
  );
}
