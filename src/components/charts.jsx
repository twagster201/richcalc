import { useState } from 'react';

/* ------------------------------------------------------------------ */
/* Donut                                                               */
/* ------------------------------------------------------------------ */

export function Donut({ segments, centerLabel, centerValue, size = 180 }) {
  const total = segments.reduce((s, x) => s + Math.max(x.value, 0), 0);
  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label="Breakdown chart">
          <circle cx="90" cy="90" r={r} fill="none" strokeWidth="22" className="stroke-line" />
          {total > 0 &&
            segments.map((s) => {
              const len = (Math.max(s.value, 0) / total) * c;
              const el = (
                <circle
                  key={s.label}
                  cx="90"
                  cy="90"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="22"
                  strokeDasharray={`${Math.max(len - 2, 0)} ${c}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-extrabold uppercase tracking-wide text-muted">{centerLabel}</span>
            <span className="text-lg font-black text-ink">{centerValue}</span>
          </div>
        )}
      </div>
      <ul className="grid w-full gap-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 rounded-xl bg-accent-soft/30 px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-bold text-muted">
              <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="text-right font-black text-ink">
              {s.display}
              {total > 0 && (
                <span className="ml-1.5 text-xs font-bold text-muted">{Math.round((s.value / total) * 100)}%</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Area / line chart with hover tooltip                                */
/* ------------------------------------------------------------------ */

function niceMax(v) {
  if (!(v > 0)) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * exp;
}

/**
 * data: [{ x, [seriesKey]: number }]
 * series: [{ key, label, color }]
 * stacked: draw series on top of each other (e.g. contributions + interest)
 */
export function AreaChart({ data, series, stacked = false, yFormat, xFormat = (x) => x, xLabel }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = 260;
  const P = { l: 64, r: 16, t: 16, b: 32 };
  const iw = W - P.l - P.r;
  const ih = H - P.t - P.b;
  if (data.length < 2) return null;

  const tops = data.map((d) =>
    stacked ? series.reduce((s, k) => s + (d[k.key] || 0), 0) : Math.max(...series.map((k) => d[k.key] || 0)),
  );
  const yMax = niceMax(Math.max(...tops));
  const x = (i) => P.l + (i / (data.length - 1)) * iw;
  const y = (v) => P.t + ih - (v / yMax) * ih;

  const layers = [];
  const base = data.map(() => 0);
  for (const s of series) {
    const top = data.map((d, i) => (stacked ? base[i] : 0) + (d[s.key] || 0));
    const bottom = stacked ? [...base] : data.map(() => 0);
    const line = top.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('');
    const area =
      line +
      bottom
        .map((v, i) => [i, v])
        .reverse()
        .map(([i, v]) => `L${x(i)},${y(v)}`)
        .join('') +
      'Z';
    layers.push({ ...s, line, area });
    if (stacked) top.forEach((v, i) => (base[i] = v));
  }

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const xTickEvery = Math.max(1, Math.ceil(data.length / 7));

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - P.l) / iw) * (data.length - 1));
    setHover(Math.min(Math.max(i, 0), data.length - 1));
  };

  const h = hover !== null ? data[hover] : null;
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-pan-y"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Chart of ${series.map((s) => s.label).join(' and ')}`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} className="stroke-line" strokeDasharray="4 4" />
            <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="fill-muted text-[11px] font-bold">
              {yFormat(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          (i % xTickEvery === 0 && data.length - 1 - i >= xTickEvery / 2) || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 10} textAnchor="middle" className="fill-muted text-[11px] font-bold">
              {xFormat(d.x)}
            </text>
          ) : null,
        )}
        {layers.map((l) => (
          <g key={l.key}>
            <path d={l.area} fill={l.color} opacity={stacked ? 0.85 : 0.18} />
            <path d={l.line} fill="none" stroke={l.color} strokeWidth="3" strokeLinejoin="round" />
          </g>
        ))}
        {h && (
          <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={P.t + ih} className="stroke-ink/40" strokeWidth="1.5" />
        )}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[10rem] -translate-x-1/2 rounded-2xl border border-line bg-surface p-3 text-sm shadow-pop"
          style={{ left: `${Math.min(Math.max((x(hover) / W) * 100, 18), 82)}%` }}
        >
          <p className="mb-1 font-black text-ink">
            {xLabel ? `${xLabel} ` : ''}
            {xFormat(h.x)}
          </p>
          {series.map((s) => (
            <p key={s.key} className="flex justify-between gap-3 font-bold text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="text-ink">{yFormat(h[s.key] || 0, true)}</span>
            </p>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-sm font-bold text-muted">
            <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Coloured band gauge (BMI, body fat)                                 */
/* ------------------------------------------------------------------ */

export function BandGauge({ bands, value, min, max, format = (v) => v.toFixed(1) }) {
  const pct = (v) => ((Math.min(Math.max(v, min), max) - min) / (max - min)) * 100;
  let start = min;
  const segs = bands.map((b) => {
    const s = { ...b, from: start, to: Math.min(b.max, max) };
    start = s.to;
    return s;
  });
  return (
    <div className="pt-9">
      <div className="relative">
        <div className="flex h-4 overflow-hidden rounded-full">
          {segs.map((s) => (
            <div key={s.label} style={{ width: `${pct(s.to) - pct(s.from)}%`, background: s.color }} />
          ))}
        </div>
        <div
          className="absolute -top-9 flex -translate-x-1/2 flex-col items-center transition-all duration-500"
          style={{ left: `${pct(value)}%` }}
        >
          <span className="rounded-lg bg-ink px-2 py-0.5 text-xs font-black text-surface">{format(value)}</span>
          <span className="h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-ink" />
        </div>
      </div>
      <div className="mt-2 flex">
        {segs.map((s) => (
          <div
            key={s.label}
            style={{ width: `${pct(s.to) - pct(s.from)}%` }}
            className="px-0.5 text-center text-[11px] font-bold leading-tight text-muted"
          >
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
