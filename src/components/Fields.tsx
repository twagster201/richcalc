/** Accessible form controls with sensible mobile keyboards. */
import { useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

export function NumberField(props: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: ComponentChildren;
  decimals?: number;
}) {
  const { id, label, value, onChange, min = -Infinity, max = Infinity, prefix, suffix, hint, step } = props;
  const show = (v: number) => (prefix === '£' ? v.toLocaleString('en-GB', { maximumFractionDigits: 2 }) : String(v));
  const [draft, setDraft] = useState(show(value));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setDraft(show(value)), [value]);

  const commit = (raw: string) => {
    const v = Number(raw.replace(/[,£%\s]/g, ''));
    if (raw.trim() === '' || !Number.isFinite(v)) {
      setError('Enter a number');
      return;
    }
    if (v < min || v > max) {
      setError(`Enter a number between ${min.toLocaleString('en-GB')} and ${max.toLocaleString('en-GB')}`);
      return;
    }
    setError(null);
    if (v !== value) onChange(v);
  };
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div class={`field${error ? ' has-error' : ''}`}>
      <label for={id}>{label}</label>
      {hint && <div class="hint" id={hintId}>{hint}</div>}
      <div class="input-wrap">
        {prefix && <span class="affix">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? true : undefined}
          data-step={step}
          onInput={(e) => {
            const raw = (e.currentTarget as HTMLInputElement).value;
            setDraft(raw);
            const v = Number(raw.replace(/[,£%\s]/g, ''));
            if (raw.trim() !== '' && Number.isFinite(v) && v >= min && v <= max) {
              setError(null);
              if (v !== value) onChange(v);
            }
          }}
          onBlur={(e) => commit((e.currentTarget as HTMLInputElement).value)}
          onKeyDown={(e) => e.key === 'Enter' && commit((e.currentTarget as HTMLInputElement).value)}
        />
        {suffix && <span class="affix">{suffix}</span>}
      </div>
      {error && <div class="error" id={errId} role="alert">{error}</div>}
    </div>
  );
}

export function Choice<T extends string | number>(props: {
  name: string;
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: ComponentChildren;
}) {
  const { name, legend, value, options, onChange, hint } = props;
  return (
    <fieldset class="field choice">
      <legend>{legend}</legend>
      {hint && <div class="hint">{hint}</div>}
      <div class="segmented">
        {options.map((o) => (
          <label key={String(o.value)} class={o.value === value ? 'on' : ''}>
            <input type="radio" name={name} value={String(o.value)} checked={o.value === value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SelectField<T extends string>(props: {
  id: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: ComponentChildren;
}) {
  const { id, label, value, options, onChange, hint } = props;
  return (
    <div class="field">
      <label for={id}>{label}</label>
      {hint && <div class="hint">{hint}</div>}
      <select id={id} value={value} onChange={(e) => onChange((e.currentTarget as HTMLSelectElement).value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
