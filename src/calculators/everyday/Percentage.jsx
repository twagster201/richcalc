import { useId, useState } from 'react';
import { useSettings } from '../../lib/settings';
import { About, num } from '../../components/ui';

function Inline({ value, onChange, label, suffix }) {
  const id = useId();
  return (
    <span className="inline-flex items-center rounded-xl border-2 border-line bg-surface px-1 align-middle transition-colors focus-within:border-accent">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-transparent px-2 py-1.5 text-center text-lg font-black text-ink focus:outline-none"
      />
      {suffix && <span className="pr-2 font-black text-muted">{suffix}</span>}
    </span>
  );
}

function Card({ emoji, title, children, answer, note }) {
  return (
    <section className="card flex flex-col p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-ink">
        <span aria-hidden>{emoji}</span> {title}
      </h2>
      <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-muted">{children}</div>
      <div className="mt-5 rounded-2xl bg-gradient-to-br from-accent to-accent-deep px-5 py-4 text-white" aria-live="polite">
        <span className="block text-3xl font-black">{answer}</span>
        {note && <span className="text-sm font-bold text-white/85">{note}</span>}
      </div>
    </section>
  );
}

export default function Percentage() {
  const { number } = useSettings();
  const fmt = (v, d = 2) => (Number.isFinite(v) ? number(v, Number.isInteger(+v.toFixed(d)) ? 0 : d) : '—');

  const [a1, setA1] = useState('15');
  const [b1, setB1] = useState('80');
  const [a2, setA2] = useState('30');
  const [b2, setB2] = useState('120');
  const [a3, setA3] = useState('80');
  const [b3, setB3] = useState('100');
  const [a4, setA4] = useState('250');
  const [b4, setB4] = useState('20');

  const r1 = (num(a1) / 100) * num(b1);
  const r2 = num(b2) ? (num(a2) / num(b2)) * 100 : NaN;
  const r3 = num(a3) ? ((num(b3) - num(a3)) / Math.abs(num(a3))) * 100 : NaN;
  const r4 = num(a4) * (1 + num(b4) / 100);
  const r4down = num(a4) * (1 - num(b4) / 100);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Card emoji="🔢" title="Percent of a number" answer={fmt(r1)}>
          What is <Inline label="Percent" value={a1} onChange={setA1} suffix="%" /> of{' '}
          <Inline label="Number" value={b1} onChange={setB1} />?
        </Card>
        <Card emoji="🥧" title="What percent is it?" answer={`${fmt(r2)}%`}>
          <Inline label="Part" value={a2} onChange={setA2} /> is what % of{' '}
          <Inline label="Whole" value={b2} onChange={setB2} />?
        </Card>
        <Card
          emoji={r3 < 0 ? '📉' : '📈'}
          title="Percentage change"
          answer={Number.isFinite(r3) ? `${r3 > 0 ? '+' : ''}${fmt(r3)}%` : '—'}
          note={Number.isFinite(r3) ? (r3 > 0 ? 'increase' : r3 < 0 ? 'decrease' : 'no change') : 'Starting value can’t be 0'}
        >
          From <Inline label="Starting value" value={a3} onChange={setA3} /> to{' '}
          <Inline label="New value" value={b3} onChange={setB3} />
        </Card>
        <Card
          emoji="↕️"
          title="Add or take off a percentage"
          answer={`${fmt(r4)} / ${fmt(r4down)}`}
          note="plus the percentage / minus the percentage"
        >
          <Inline label="Number" value={a4} onChange={setA4} /> ± <Inline label="Percent" value={b4} onChange={setB4} suffix="%" />
        </Card>
      </div>
      <About
        faqs={[
          ['How do I work out a percentage of a number?', 'Divide the percentage by 100 and multiply by the number. 15% of 80 = 0.15 × 80 = 12.'],
          ['Why isn’t a 50% rise undone by a 50% fall?', 'Because the second change is a percentage of a different (bigger) number. 100 + 50% = 150, but 150 − 50% = 75.'],
        ]}
      >
        <p>
          <strong>Percent</strong> means “per hundred”. Percentage change is (new − old) ÷ old × 100, so it’s always
          relative to where you started.
        </p>
      </About>
    </>
  );
}
