import { Link } from 'react-router-dom';
import { FAQS } from './faqs';
import { useSeo } from '../lib/useSeo';
import Breadcrumbs from '../components/Breadcrumbs';


export default function Faq() {
  useSeo({
    title: 'FAQ & Privacy – RichCalc',
    description: 'Frequently asked questions about RichCalc: currencies, units, accuracy and privacy.',
  });
  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      <h1 className="mb-8 text-4xl font-black tracking-tight text-ink">Frequently asked questions</h1>
      <div className="space-y-4">
        {FAQS.map(([q, a]) => (
          <section key={q} className="card p-6">
            <h2 className="mb-2 text-lg font-black text-ink">{q}</h2>
            <p className="font-semibold leading-relaxed text-muted">{a}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 text-center font-bold text-muted">
        <Link to="/" className="text-violet-600 hover:underline dark:text-violet-300">
          ← Back to all calculators
        </Link>
      </p>
    </div>
  );
}
