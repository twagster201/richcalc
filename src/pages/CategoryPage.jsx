import { CALCULATORS } from '../calculators/meta';
import CalculatorCard from '../components/CalculatorCard';
import { useSeo } from '../lib/useSeo';
import Breadcrumbs from '../components/Breadcrumbs';

export default function CategoryPage({ category }) {
  useSeo({ title: `${category.name} Calculators – RichCalc`, description: category.description });
  const calcs = CALCULATORS.filter((c) => c.category === category.id);

  return (
    <div className={`theme-${category.id}`}>
      <Breadcrumbs items={[{ label: category.name }]} />
      <header className="relative mb-10">
        <div className="blob -left-20 -top-16 h-64 w-64 bg-accent" aria-hidden />
        <div className="relative">
          <span className="text-5xl" aria-hidden>
            {category.emoji}
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">{category.name} calculators</h1>
          <p className="mt-3 max-w-2xl text-lg font-semibold text-muted">{category.description}</p>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calcs.map((c) => (
          <CalculatorCard key={c.slug} calc={c} />
        ))}
      </div>
    </div>
  );
}
