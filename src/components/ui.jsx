import { useId } from 'react';
import { useSettings } from '../lib/settings';
import { CM_PER_IN, LB_PER_KG } from '../lib/health';

/* ------------------------------------------------------------------ */
/* Parsing helpers                                                     */
/* ------------------------------------------------------------------ */

/** Parse an input string to a number (NaN when blank/invalid). */
export const num = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));
const round = (v, d) => String(Math.round(v * 10 ** d) / 10 ** d);

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/** Two-column calculator layout: inputs on the left, live results on the right. */
export function CalcLayout({ inputs, results }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section aria-label="Inputs" className="card p-5 sm:p-6">
        <div className="grid gap-5">{inputs}</div>
      </section>
      <section aria-label="Results" aria-live="polite" className="grid gap-5 lg:sticky lg:top-24">
        {results}
      </section>
    </div>
  );
}

export function Row({ children }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

const boxClass =
  'flex items-center rounded-2xl border-2 border-line bg-surface transition-colors focus-within:border-accent hover:border-accent/50';
const inputClass =
  'w-full min-w-0 bg-transparent px-4 py-3 text-lg font-bold text-ink placeholder:font-semibold placeholder:text-muted/50 focus:outline-none';

function Label({ htmlFor, children, hint, as: Tag = 'label' }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <Tag htmlFor={htmlFor} className="text-sm font-extrabold text-ink">
        {children}
      </Tag>
      {hint && <span className="text-xs font-semibold text-muted">{hint}</span>}
    </div>
  );
}

export function NumberField({ label, hint, value, onChange, prefix, suffix, min = 0, max, step = 'any', placeholder }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <div className={boxClass}>
        {prefix && <span className="pl-4 text-lg font-extrabold text-muted">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {suffix && <span className="whitespace-nowrap pr-4 font-bold text-muted">{suffix}</span>}
      </div>
    </div>
  );
}

export function MoneyField(props) {
  const { currencySymbol } = useSettings();
  return <NumberField prefix={currencySymbol} {...props} />;
}

export function PercentField(props) {
  return <NumberField suffix="%" max={100} {...props} />;
}

export function SelectField({ label, hint, value, onChange, options }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <div className={boxClass}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} cursor-pointer appearance-none bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a3a0c8'%3E%3Cpath d='M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E\")",
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function DateField({ label, hint, value, onChange, min, max }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <div className={boxClass}>
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

/** Pill-style radio group. */
export function Segmented({ label, value, onChange, options }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-labelledby={label ? id : undefined}>
      {label && (
        <Label as="span" htmlFor={undefined}>
          <span id={id}>{label}</span>
        </Label>
      )}
      <div className="flex flex-wrap gap-1 rounded-2xl bg-accent-soft/60 p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-extrabold transition-all ${
                active ? 'bg-surface text-accent-strong shadow-soft' : 'text-muted hover:text-ink'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SexField({ value, onChange }) {
  return (
    <Segmented
      label="Sex"
      value={value}
      onChange={onChange}
      options={[
        { value: 'male', label: '♂ Male' },
        { value: 'female', label: '♀ Female' },
      ]}
    />
  );
}

/** Global metric/imperial switch, shown inside health calculators. */
export function UnitsToggle() {
  const { units, setUnits } = useSettings();
  return (
    <Segmented
      label="Units"
      value={units}
      onChange={setUnits}
      options={[
        { value: 'metric', label: 'Metric (cm, kg)' },
        { value: 'imperial', label: 'Imperial (ft, lb)' },
      ]}
    />
  );
}

/* ---- Unit-aware measurement fields --------------------------------
 * Each value object keeps both metric and imperial strings in sync, so
 * switching units never loses what the user typed.
 */

export const makeHeight = (cm) => {
  const totalIn = cm / CM_PER_IN;
  const ft = Math.floor(totalIn / 12);
  return { cm: String(cm), ft: String(ft), in: round(totalIn - ft * 12, 1) };
};
export const makeWeight = (kg) => ({ kg: String(kg), lb: round(kg * LB_PER_KG, 1) });
export const makeLength = (cm) => ({ cm: String(cm), in: round(cm / CM_PER_IN, 1) });

export function HeightField({ value, onChange, label = 'Height' }) {
  const { imperial } = useSettings();
  if (!imperial) {
    return (
      <NumberField
        label={label}
        suffix="cm"
        value={value.cm}
        onChange={(cm) => onChange(cm === '' ? { cm, ft: '', in: '' } : makeHeight(Number(cm)))}
      />
    );
  }
  const fromImperial = (ft, inch) => ({
    ft,
    in: inch,
    cm: ft === '' && inch === '' ? '' : round(((Number(ft) || 0) * 12 + (Number(inch) || 0)) * CM_PER_IN, 1),
  });
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberField label={label} suffix="ft" value={value.ft} onChange={(ft) => onChange(fromImperial(ft, value.in))} />
      <NumberField label="Inches" suffix="in" value={value.in} onChange={(i) => onChange(fromImperial(value.ft, i))} />
    </div>
  );
}

export function WeightField({ value, onChange, label = 'Weight' }) {
  const { imperial } = useSettings();
  return imperial ? (
    <NumberField
      label={label}
      suffix="lb"
      value={value.lb}
      onChange={(lb) => onChange({ lb, kg: lb === '' ? '' : round(Number(lb) / LB_PER_KG, 2) })}
    />
  ) : (
    <NumberField
      label={label}
      suffix="kg"
      value={value.kg}
      onChange={(kg) => onChange(kg === '' ? { kg, lb: '' } : { ...makeWeight(Number(kg)), kg })}
    />
  );
}

export function LengthField({ value, onChange, label, hint }) {
  const { imperial } = useSettings();
  return imperial ? (
    <NumberField
      label={label}
      hint={hint}
      suffix="in"
      value={value.in}
      onChange={(i) => onChange({ in: i, cm: i === '' ? '' : round(Number(i) * CM_PER_IN, 2) })}
    />
  ) : (
    <NumberField
      label={label}
      hint={hint}
      suffix="cm"
      value={value.cm}
      onChange={(cm) => onChange(cm === '' ? { cm, in: '' } : { ...makeLength(Number(cm)), cm })}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

/** The big headline result. */
export function ResultHero({ label, value, sub, color, children }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent-deep p-6 text-white shadow-pop sm:p-7"
      style={color ? { background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, #1e1b4b))` } : undefined}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" aria-hidden />
      <div className="absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-white/10" aria-hidden />
      <p className="relative text-sm font-extrabold uppercase tracking-wider text-white/85">{label}</p>
      <p className="relative mt-1 break-words text-4xl font-black tracking-tight sm:text-5xl">{value}</p>
      {sub && <p className="relative mt-2 font-bold text-white/90">{sub}</p>}
      {children && <div className="relative mt-4">{children}</div>}
    </div>
  );
}

export function StatGrid({ children }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}

export function Stat({ label, value, dot }) {
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-muted">
        {dot && <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />}
        {label}
      </p>
      <p className="mt-1 break-words text-xl font-black text-ink">{value}</p>
    </div>
  );
}

export function Panel({ title, children, className = '' }) {
  return (
    <div className={`card p-5 sm:p-6 ${className}`}>
      {title && <h3 className="mb-4 text-lg font-black text-ink">{title}</h3>}
      {children}
    </div>
  );
}

export function EmptyState({ children = 'Fill in the details to see your results.' }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-10 text-center">
      <span className="text-5xl" aria-hidden>
        🧮
      </span>
      <p className="font-bold text-muted">{children}</p>
    </div>
  );
}

export function Notice({ tone = 'info', children }) {
  const tones = {
    info: 'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/40 dark:text-sky-100 dark:border-sky-900',
    warn: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-900',
    good: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-900',
  };
  const icon = { info: '💡', warn: '⚠️', good: '🎉' }[tone];
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 text-sm font-semibold ${tones[tone]}`}>
      <span aria-hidden>{icon}</span>
      <div>{children}</div>
    </div>
  );
}

/** Collapsible data table (e.g. amortization schedules). */
export function DataTable({ summary, columns, rows }) {
  return (
    <details className="card group overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-black text-ink">
        {summary}
        <span className="text-accent transition-transform group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="max-h-96 overflow-auto border-t border-line">
        <table className="w-full text-right text-sm">
          <thead className="sticky top-0 bg-accent-soft text-accent-strong">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-2 font-extrabold first:text-left">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line/60 odd:bg-accent-soft/20">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2 font-semibold tabular-nums first:text-left">
                    {c.format ? c.format(r[c.key], r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Explainer content under each calculator                             */
/* ------------------------------------------------------------------ */

export function About({ children, faqs = [] }) {
  return (
    <section className="mt-12 grid gap-6 lg:grid-cols-2">
      <div className="card p-6 sm:p-8">
        <h2 className="mb-3 text-2xl font-black text-ink">How it works</h2>
        <div className="space-y-3 font-semibold leading-relaxed text-muted [&_strong]:text-ink">{children}</div>
      </div>
      {faqs.length > 0 && (
        <div className="card p-6 sm:p-8">
          <h2 className="mb-3 text-2xl font-black text-ink">Questions</h2>
          <div className="divide-y divide-line">
            {faqs.map(([q, a]) => (
              <details key={q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-ink">
                  {q}
                  <span className="text-xl text-accent transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-2 font-semibold leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function Formula({ children }) {
  return (
    <code className="block overflow-x-auto rounded-xl bg-accent-soft/60 px-4 py-3 text-sm font-bold text-accent-strong">
      {children}
    </code>
  );
}
