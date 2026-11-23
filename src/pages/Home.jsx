import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CALCULATORS, CATEGORIES, SITE } from '../calculators/meta';
import CalculatorCard from '../components/CalculatorCard';
import { useSeo } from '../lib/useSeo';

const CATEGORY_STYLE = {
  money: 'from-emerald-400 to-teal-500',
  health: 'from-pink-400 to-rose-500',
  everyday: 'from-violet-400 to-indigo-500',
};

export default function Home() {
  const [query, setQuery] = useState('');
  useSeo({ title: `${SITE.name} – ${SITE.tagline}`, description: SITE.description });

  const q = query.trim().toLowerCase();
  const matches = (c) => !q || `${c.title} ${c.short} ${c.keywords}`.toLowerCase().includes(q);
  const results = CALCULATORS.filter(matches);

  return (
    <>
      {/* Hero */}
      <section className="relative mb-12 pt-6 text-center sm:pt-12">
        <div className="blob -left-24 -top-10 h-72 w-72 bg-pink-300" aria-hidden />
        <div className="blob -right-20 top-10 h-72 w-72 bg-amber-200" aria-hidden />
        <div className="blob left-1/3 top-40 h-60 w-60 bg-violet-300" aria-hidden />
        <div className="relative">
          <p className="chip mb-5 bg-surface text-muted shadow-soft">
            <span aria-hidden>👋</span> {CALCULATORS.length} free calculators · any currency · metric or imperial
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-black leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Friendly calculators for{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
              money, health
            </span>{' '}
            & everyday life
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg font-semibold text-muted">
            Clear answers in seconds. No sign-up, no cookies, and your numbers never leave your device.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <label htmlFor="search" className="sr-only">
              Search calculators
            </label>
            <div className="flex items-center rounded-full border-2 border-line bg-surface px-5 shadow-pop transition focus-within:border-violet-400">
              <span aria-hidden className="text-xl">
                🔍
              </span>
              <input
                id="search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “mortgage”, “BMI” or “tip”…"
                className="w-full bg-transparent px-3 py-4 text-lg font-bold text-ink placeholder:text-muted/60 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {q ? (
        <section aria-label="Search results">
          <h2 className="mb-4 text-xl font-black text-ink">
            {results.length} {results.length === 1 ? 'match' : 'matches'}
          </h2>
          {results.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((c) => (
                <CalculatorCard key={c.slug} calc={c} />
              ))}
            </div>
          ) : (
            <p className="card p-8 text-center font-bold text-muted">
              No calculators match “{query}”. Try a shorter word.
            </p>
          )}
        </section>
      ) : (
        <div className="space-y-14">
          {CATEGORIES.map((cat) => (
            <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-soft ${CATEGORY_STYLE[cat.id]}`}
                    aria-hidden
                  >
                    {cat.emoji}
                  </span>
                  <div>
                    <h2 id={`cat-${cat.id}`} className="text-2xl font-black text-ink">
                      {cat.name}
                    </h2>
                    <p className="font-semibold text-muted">{cat.tagline}</p>
                  </div>
                </div>
                <Link to={`/${cat.id}`} className="font-extrabold text-muted hover:text-ink">
                  See all →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CALCULATORS.filter((c) => c.category === cat.id).map((c) => (
                  <CalculatorCard key={c.slug} calc={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
