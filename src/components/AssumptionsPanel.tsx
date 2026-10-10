/**
 * Every assumption behind a result: value, source, status, reasoning. Each is editable; changes
 * recompute the result. Changed values are highlighted and can be reset individually or together.
 */
import type { Assumption, AssumptionSet, AssumptionValues } from '../../assumptions/types';
import { SOURCES } from '../../rules/sources';
import { formatAssumption, unitSuffix } from '../lib/assumptionFormat';
import { fromDisplay, toDisplay } from '../state/url';
import { NumberField } from './Fields';

const STATUS_TEXT: Record<Assumption['status'], string> = {
  confirmed: 'Published figure',
  announced: 'Announced',
  convention: 'Market practice',
  judgement: 'Our judgement',
  unverified: 'Unverified',
};

export function StatusBadge({ status }: { status: Assumption['status'] }) {
  return <span class={`badge ${status}`}>{STATUS_TEXT[status]}</span>;
}

export function SourceLinks({ a }: { a: Pick<Assumption, 'source'> }) {
  return (
    <>
      {a.source.map((ref, i) => {
        const s = SOURCES[ref.id];
        return (
          <span key={ref.id}>
            {i > 0 && '; '}
            <a href={s.url} rel="noopener" target="_blank">
              {s.title}
            </a>
            {` (${s.publisher})`}
          </span>
        );
      })}
    </>
  );
}

export function AssumptionsPanel(props: {
  set: AssumptionSet;
  keys: string[];
  overrides: AssumptionValues;
  onChange: (key: string, value: number | undefined) => void;
  onResetAll: () => void;
}) {
  const { set, keys, overrides, onChange, onResetAll } = props;
  const groups = new Map<string, Assumption[]>();
  for (const k of keys) {
    const a = set[k];
    if (!groups.has(a.group)) groups.set(a.group, []);
    groups.get(a.group)!.push(a);
  }
  const changed = keys.filter((k) => overrides[k] !== undefined && overrides[k] !== set[k].value).length;

  return (
    <div class="assumptions">
      <div class="assumptions-bar">
        <p>
          {changed === 0
            ? 'All assumptions are at their defaults.'
            : `${changed} assumption${changed === 1 ? '' : 's'} changed from the default.`}
        </p>
        {changed > 0 && (
          <button type="button" class="btn" onClick={onResetAll}>
            Reset all to defaults
          </button>
        )}
      </div>
      {[...groups].map(([group, items]) => (
        <details key={group} class="assumption-group" open={items.some((a) => overrides[a.key] !== undefined)}>
          <summary>
            <h3>{group}</h3>
            <span class="group-values">
              {items
                .slice(0, 4)
                .map((a) => `${a.phrase.charAt(0).toUpperCase()}${a.phrase.slice(1)} ${formatAssumption(a, overrides[a.key] ?? a.value)}`)
                .join(' · ')}
              {items.length > 4 ? ` · and ${items.length - 4} more` : ''}
            </span>
          </summary>
          {items.map((a) => {
            const current = overrides[a.key] ?? a.value;
            const isChanged = current !== a.value;
            return (
              <div key={a.key} class={`assumption${isChanged ? ' changed' : ''}`}>
                <div class="assumption-main">
                  <NumberField
                    id={`a-${a.key}`}
                    label={a.label}
                    value={toDisplay(a, current)}
                    min={toDisplay(a, a.bounds.min)}
                    max={toDisplay(a, a.bounds.max)}
                    step={a.step}
                    suffix={unitSuffix(a)}
                    onChange={(d) => onChange(a.key, fromDisplay(a, d))}
                  />
                  <div class="assumption-meta">
                    <StatusBadge status={a.status} />
                    {isChanged ? (
                      <button type="button" class="btn link" onClick={() => onChange(a.key, undefined)}>
                        Reset to {formatAssumption(a, a.value)}
                      </button>
                    ) : (
                      <span class="muted">Default</span>
                    )}
                  </div>
                </div>
                <p class="assumption-explain">{a.explain}</p>
                <details class="assumption-why">
                  <summary>Why {formatAssumption(a, a.value)}, and the source</summary>
                  {a.note && <p>{a.note}</p>}
                  <p class="muted">
                    Source: <SourceLinks a={a} />. Last checked {a.verified}. Plausible range used for sensitivity:{' '}
                    {formatAssumption(a, a.range.low)} to {formatAssumption(a, a.range.high)}.
                  </p>
                </details>
              </div>
            );
          })}
        </details>
      ))}
    </div>
  );
}
