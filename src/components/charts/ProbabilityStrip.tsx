/**
 * Chance that option B is ahead, for each year, as bars growing up or down from an even (50%)
 * line. Bars above the line are option B's colour, below are option A's, and the selected and
 * final years carry direct labels.
 */
import { useState } from 'preact/hooks';
import type { YearSummary } from '../../../engine/analysis/summarise';
import { chance } from '../../lib/format';
import { linear, useWidth } from './useWidth';

const H = 150;
const M = { top: 18, right: 16, bottom: 26, left: 56 };

export function ProbabilityStrip(props: {
  data: YearSummary[];
  selectedYear: number;
  onSelectYear?: (y: number) => void;
  bName: string;
  aName: string;
  summary: string;
}) {
  const { data, selectedYear, onSelectYear, bName, aName, summary } = props;
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const n = data.length;
  const plotW = width - M.left - M.right;
  const slot = plotW / n;
  const barW = Math.min(24, Math.max(3, slot - 2));
  const y = linear(0, 1, H - M.bottom, M.top);
  const mid = y(0.5);
  const labelled = new Set([selectedYear, n]);
  const tipYear = hover;
  const tip = tipYear ? data[tipYear - 1] : null;

  return (
    <figure class="chart" ref={ref}>
      <div role="img" aria-label={summary}>
        <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
          <g class="grid">
            {[0, 0.5, 1].map((t) => (
              <line key={t} x1={M.left} x2={M.left + plotW} y1={y(t)} y2={y(t)} />
            ))}
          </g>
          <g class="axis">
            <text x={M.left - 8} y={y(1) + 4} text-anchor="end">100%</text>
            <text x={M.left - 8} y={mid + 4} text-anchor="end">50%</text>
            <text x={M.left - 8} y={y(0) + 4} text-anchor="end">0%</text>
          </g>
          {data.map((d, i) => {
            const cx = M.left + slot * (i + 0.5);
            const top = Math.min(y(d.probPositive), mid);
            const h = Math.max(1, Math.abs(y(d.probPositive) - mid));
            const cls = d.probPositive >= 0.5 ? 'bar-b' : 'bar-a';
            return (
              <g key={d.year}>
                <rect
                  class={`${cls}${d.year === selectedYear ? ' bar-selected' : ''}`}
                  x={cx - barW / 2}
                  y={top}
                  width={barW}
                  height={h}
                  rx={Math.min(4, barW / 2)}
                />
                {labelled.has(d.year) && (
                  <text
                    class="label-strong"
                    x={cx}
                    y={d.probPositive >= 0.5 ? top - 5 : top + h + 13}
                    text-anchor={i > n - 3 ? 'end' : 'middle'}
                  >
                    {chance(d.probPositive)}
                  </text>
                )}
                <rect
                  class="hit"
                  x={cx - slot / 2}
                  y={M.top}
                  width={slot}
                  height={H - M.top - M.bottom}
                  onPointerEnter={() => setHover(d.year)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => onSelectYear?.(d.year)}
                />
              </g>
            );
          })}
          <g class="axis">
            {data.map((d, i) =>
              d.year === 1 || (d.year % 5 === 0 && n - d.year >= (width < 520 ? 4 : 2)) || d.year === n ? (
                <text key={d.year} x={M.left + slot * (i + 0.5)} y={H - 8} text-anchor="middle">
                  {d.year}y
                </text>
              ) : null,
            )}
          </g>
        </svg>
        {tip && (
          <div class="tooltip" style={{ left: `${Math.min(M.left + slot * (tip.year - 0.5) + 10, width - 200)}px`, top: '0px' }} aria-hidden="true">
            <div class="t-title">After {tip.year} year{tip.year === 1 ? '' : 's'}</div>
            <div class="t-row"><span>{bName} ahead</span><strong>{chance(tip.probPositive)}</strong></div>
            <div class="t-row"><span>{aName} ahead</span><strong>{chance(1 - tip.probPositive)}</strong></div>
          </div>
        )}
      </div>
      <ul class="legend" aria-label="Key">
        <li><span class="key bar-b" /> More likely {bName.toLowerCase()} is ahead</li>
        <li><span class="key bar-a" /> More likely {aName.toLowerCase()} is ahead</li>
      </ul>
    </figure>
  );
}
