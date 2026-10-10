/**
 * Sensitivity ("tornado") chart: for each assumption, the median result when it is set to its
 * low and high plausible values, drawn as a bar between the two around the current median.
 */
import type { TornadoItem } from '../../../engine/analysis/sensitivity';
import { moneyCompact, niceTicks } from '../../lib/format';
import { linear, useWidth } from './useWidth';

const ROW = 46;
const M = { top: 8, right: 56, bottom: 28, left: 56 };

export function Tornado(props: {
  items: TornadoItem[];
  baseMedian: number;
  formatValue: (key: string, v: number) => string;
  summary: string;
}) {
  const { items, baseMedian, formatValue, summary } = props;
  const [ref, width] = useWidth<HTMLDivElement>();
  const values = items.flatMap((t) => [t.atLow.median, t.atHigh.median]).concat([0, baseMedian]);
  const ticks = niceTicks(Math.min(...values), Math.max(...values), width < 480 ? 4 : 6);
  const plotW = width - M.left - M.right;
  const x = linear(Math.min(ticks[0], ...values), Math.max(ticks[ticks.length - 1], ...values), M.left, M.left + plotW);
  const H = M.top + items.length * ROW + M.bottom;

  return (
    <figure class="chart" ref={ref}>
      <div role="img" aria-label={summary}>
        <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
          <g class="grid">
            {ticks.map((t) => (
              <line key={t} x1={x(t)} x2={x(t)} y1={M.top} y2={H - M.bottom} />
            ))}
          </g>
          <line class="zero" x1={x(0)} x2={x(0)} y1={M.top} y2={H - M.bottom} />
          {items.map((t, i) => {
            const y0 = M.top + i * ROW;
            const a = x(t.atLow.median);
            const b = x(t.atHigh.median);
            const left = Math.min(a, b);
            const w = Math.max(2, Math.abs(b - a));
            return (
              <g key={t.key}>
                <text class="label halo" x={8} y={y0 + 14}>{t.label}</text>
                <rect class="bar-neutral" x={left} y={y0 + 22} width={w} height={14} rx={4} />
                <text class="tick" x={a + (a <= b ? -4 : 4)} y={y0 + 33} text-anchor={a <= b ? 'end' : 'start'}>
                  {formatValue(t.key, t.low)}
                </text>
                <text class="tick" x={b + (b >= a ? 4 : -4)} y={y0 + 33} text-anchor={b >= a ? 'start' : 'end'}>
                  {formatValue(t.key, t.high)}
                </text>
              </g>
            );
          })}
          <line class="selected-line" x1={x(baseMedian)} x2={x(baseMedian)} y1={M.top + 18} y2={H - M.bottom} />
          <g class="axis">
            {ticks.map((t) => (
              <text key={t} x={x(t)} y={H - 8} text-anchor="middle">{moneyCompact(t)}</text>
            ))}
          </g>
        </svg>
      </div>
    </figure>
  );
}
