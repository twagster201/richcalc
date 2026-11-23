import { Link } from 'react-router-dom';
import { useSeo } from '../lib/useSeo';

export default function NotFound() {
  useSeo({ title: 'Page not found – RichCalc', description: 'This page could not be found.' });
  return (
    <div className="py-20 text-center">
      <p className="text-7xl" aria-hidden>
        🤔
      </p>
      <h1 className="mt-4 text-4xl font-black text-ink">We couldn’t find that page</h1>
      <p className="mt-3 font-semibold text-muted">It may have moved. Try one of our calculators instead.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-violet-500 px-6 py-3 font-black text-white shadow-pop transition hover:bg-violet-600"
      >
        See all calculators
      </Link>
    </div>
  );
}
