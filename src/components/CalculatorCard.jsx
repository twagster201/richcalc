import { Link } from 'react-router-dom';

export default function CalculatorCard({ calc }) {
  return (
    <Link
      to={`/${calc.slug}`}
      className={`theme-${calc.category} card group flex items-start gap-4 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-pop`}
    >
      <span
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-3xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
        aria-hidden
      >
        {calc.emoji}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-lg font-black text-ink">
          {calc.title.replace(' Calculator', '')}
          <span className="text-accent opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" aria-hidden>
            →
          </span>
        </span>
        <span className="mt-0.5 block text-sm font-semibold leading-snug text-muted">{calc.short}</span>
      </span>
    </Link>
  );
}
