/**
 * Fan chart of a difference between two options over time: the 10–90 and 25–75 percentile
 * bands and the median. Above zero is tinted for option B, below zero for option A, and both
 * sides are labelled in words so colour is never the only cue.
 */
import { useState } from 'preact/hooks';
import type { YearSummary } from '../../../engine/analysis/summarise';
import { chance, moneyCompact, moneySigned, niceTicks } from '../../lib/format';
import { linear, useWidth } from './useWidth';

export interface FanChartProps {
  id: string;
  data: YearSummary[];
  /** Words for "value above zero", e.g. "Investing ahead". */
  aboveLabel: string;
  belowLabel: string;
  selectedYear: number;
  onSelectYear?: (year: number) => void;
  /** Accessible description of the chart. */
  summary: string;
  probabilityLabel: string;
  /** Set false for a static illustration with no keyboard or pointer interaction. */
  interactive?: boolean;
}

const H = 320;
const M = { top: 16, right: 16, bottom: 34, left: 56 };

export function FanChart({ id, data, aboveLabel, belowLabel, selectedYear, onSelectYear, summary, probabilityLabel, interactive = true }: FanChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  // Start the fan from a single point: at year 0 both options are identical.
  const zeroRow: YearSummary = { year: 0, p10: 0, p25: 0, p50: 0, p75: 0, p90: 0, mean: 0, probPositive: 0.5 };
  const rows = [zeroRow, ...data];
  const maxYear = data.length;

  const lo = Math.min(0, ...rows.map((r) => r.p10));
  const hi = Math.max(0, ...rows.map((r) => r.p90));
  const ticks = niceTicks(lo, hi, 5);
  const yMin = Math.min(lo, ticks[0]);
  const yMax = Math.max(hi, ticks[ticks.length - 1]);

  const plotW = width - M.left - M.right;
  const x = linear(0, maxYear, M.left, M.left + plotW);
  const y = linear(yMin, yMax, M.top + (H - M.top - M.bottom), M.top);
  const y0 = y(0);

  const area = (loKey: keyof YearSummary, hiKey: keyof YearSummary) => {
    const top = rows.map((r) => `${x(r.year).toFixed(1)},${y(r[hiKey] as number).toFixed(1)}`);
    const bottom = rows
      .slice()
      .reverse()
      .map((r) => `${x(r.year).toFixed(1)},${y(r[loKey] as number).toFixed(1)}`);
    return `M${top.join('L')}L${bottom.join('L')}Z`;
  };
  const medianPath = `M${rows.map((r) => `${x(r.year).toFixed(1)},${y(r.p50).toFixed(1)}`).join('L')}`;

  const xTickStep = maxYear <= 10 ? 1 : maxYear <= 20 ? 5 : 5;
  const xTicks = [0];
  for (let t = xTickStep; t <= maxYear; t += xTickStep) xTicks.push(t);
  if (xTicks[xTicks.length - 1] !== maxYear) {
    // Drop the previous tick if the final year would crowd it.
    if (maxYear - xTicks[xTicks.length - 1] < (width < 520 ? 4 : 2)) xTicks.pop();
    xTicks.push(maxYear);
  }

  const yearFromPointer = (clientX: number, rect: DOMRect) => {
    const px = ((clientX - rect.left) / rect.width) * width;
    return Math.min(maxYear, Math.max(1, Math.round(((px - M.left) / plotW) * maxYear)));
  };

  const active = hover ?? selectedYear;
  const row = data[active - 1];
  const tipLeft = Math.min(Math.max(x(active) + 12, 8), width - 220);

  const onKey = (e: KeyboardEvent) => {
    let next: number;
    if (e.key === 'ArrowRight') next = Math.min(maxYear, active + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(1, active - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = maxYear;
    else return;
    e.preventDefault();
    setHover(null);
    onSelectYear?.(next);
  };

  const clipAbove = `${id}-above`;
  const clipBelow = `${id}-below`;

  return (
    <figure class="chart" ref={ref}>
      <div
        {...(interactive
          ? {
              class: 'chart-focus',
              tabIndex: 0,
              role: 'group',
              'aria-roledescription': 'interactive chart',
              'aria-label': `${summary} Use the left and right arrow keys to move between years.`,
              onKeyDown: onKey,
              onPointerLeave: () => setHover(null),
              onPointerMove: (e: PointerEvent) => setHover(yearFromPointer(e.clientX, (e.currentTarget as HTMLElement).getBoundingClientRect())),
              onClick: (e: MouseEvent) => onSelectYear?.(yearFromPointer(e.clientX, (e.currentTarget as HTMLElement).getBoundingClientRect())),
            }
          : { role: 'img', 'aria-label': summary })}
      >
        <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
          <defs>
            <clipPath id={clipAbove}>
              <rect x={0} y={0} width={width} height={Math.max(0, y0)} />
            </clipPath>
            <clipPath id={clipBelow}>
              <rect x={0} y={y0} width={width} height={Math.max(0, H - y0)} />
            </clipPath>
          </defs>
          <g class="grid">
            {ticks.map((t) => (
              <line key={t} x1={M.left} x2={M.left + plotW} y1={y(t)} y2={y(t)} />
            ))}
          </g>
          <g class="axis">
            {ticks.map((t) => (
              <text key={t} x={M.left - 8} y={y(t) + 4} text-anchor="end">
                {moneyCompact(t)}
              </text>
            ))}
            {xTicks.map((t) => (
              <text key={t} x={x(t)} y={H - 10} text-anchor="middle">
                {t === 0 ? 'Now' : `${t}y`}
              </text>
            ))}
          </g>
          <g clip-path={`url(#${clipAbove})`}>
            <path class="band-b-outer" d={area('p10', 'p90')} />
            <path class="band-b-inner" d={area('p25', 'p75')} />
          </g>
          <g clip-path={`url(#${clipBelow})`}>
            <path class="band-a-outer" d={area('p10', 'p90')} />
            <path class="band-a-inner" d={area('p25', 'p75')} />
          </g>
          <line class="zero" x1={M.left} x2={M.left + plotW} y1={y0} y2={y0} />
          <path class="median" d={medianPath} />
          {/* Words on each side of zero. */}
          <g>
            <rect class="swatch-b" x={M.left + 8} y={M.top + 2} width={10} height={10} rx={2} />
            <text class="label halo" x={M.left + 24} y={M.top + 11}>
              ↑ {aboveLabel}
            </text>
            <rect class="swatch-a" x={M.left + 8} y={H - M.bottom - 16} width={10} height={10} rx={2} />
            <text class="label halo" x={M.left + 24} y={H - M.bottom - 7}>
              ↓ {belowLabel}
            </text>
          </g>
          <line class="selected-line" x1={x(selectedYear)} x2={x(selectedYear)} y1={M.top} y2={H - M.bottom} />
          {hover !== null && hover !== selectedYear && (
            <line class="crosshair" x1={x(hover)} x2={x(hover)} y1={M.top} y2={H - M.bottom} />
          )}
          {row && <circle class="marker" cx={x(active)} cy={y(row.p50)} r={5} />}
        </svg>
        {hover !== null && row && (
          <div class="tooltip" style={{ left: `${tipLeft}px`, top: '8px' }} aria-hidden="true">
            <div class="t-title">After {active} year{active === 1 ? '' : 's'}</div>
            <div class="t-row">
              <span>Best 10% of futures</span>
              <strong>{moneySigned(row.p90)}+</strong>
            </div>
            <div class="t-row">
              <span>Middle half</span>
              <strong>
                {moneyCompact(row.p25)} to {moneyCompact(row.p75)}
              </strong>
            </div>
            <div class="t-row">
              <span>Median</span>
              <strong>{moneySigned(row.p50)}</strong>
            </div>
            <div class="t-row">
              <span>Worst 10%</span>
              <strong>{moneySigned(row.p10)} or less</strong>
            </div>
            <div class="t-row">
              <span>{probabilityLabel}</span>
              <strong>{chance(row.probPositive)}</strong>
            </div>
          </div>
        )}
      </div>
      <ul class="legend" aria-label="Key">
        <li>
          <span class="key median" /> Median (middle outcome)
        </li>
        <li>
          <span class="key band-b" />
          <span class="key band-a" /> Darker: middle 50% of futures · lighter: 80%
        </li>
      </ul>
    </figure>
  );
}
