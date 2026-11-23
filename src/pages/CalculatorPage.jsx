import { Suspense } from 'react';
import { CALCULATORS, categoryById } from '../calculators/meta';
import { CALCULATOR_COMPONENTS } from '../calculators';
import CalculatorCard from '../components/CalculatorCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useSeo } from '../lib/useSeo';

function Loading() {
  return (
    <div className="grid place-items-center py-24" role="status">
      <span className="animate-bounce text-5xl" aria-hidden>
        🧮
      </span>
      <span className="sr-only">Loading calculator…</span>
    </div>
  );
}

export default function CalculatorPage({ calc }) {
  const category = categoryById(calc.category);
  const Component = CALCULATOR_COMPONENTS[calc.slug];
  useSeo({ title: `${calc.title} – RichCalc`, description: calc.description });

  const related = CALCULATORS.filter((c) => c.category === calc.category && c.slug !== calc.slug).slice(0, 3);

  return (
    <div className={`theme-${calc.category}`}>
      <Breadcrumbs items={[{ label: category.name, to: `/${category.id}` }, { label: calc.title }]} />
      <header className="relative mb-8 flex items-start gap-4">
        <div className="blob -left-24 -top-24 h-72 w-72 bg-accent" aria-hidden />
        <span
          className="relative grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-accent-soft text-4xl shadow-soft sm:h-20 sm:w-20 sm:text-5xl"
          aria-hidden
        >
          {calc.emoji}
        </span>
        <div className="relative">
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">{calc.title}</h1>
          <p className="mt-2 max-w-2xl text-lg font-semibold text-muted">{calc.description}</p>
        </div>
      </header>

      {/* key resets calculator state when navigating between calculators */}
      <Suspense fallback={<Loading />}>
        <Component key={calc.slug} />
      </Suspense>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-black text-ink">
            More {category.name.toLowerCase()} calculators {category.emoji}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CalculatorCard key={c.slug} calc={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
