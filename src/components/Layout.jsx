import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import { CURRENCIES } from '../lib/settings-data';
import { CALCULATORS, CATEGORIES } from '../calculators/meta';
import { Segmented, SelectField } from './ui';

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="RichCalc home">
      <img src="/richcalc.svg" alt="" className="h-9 w-9 drop-shadow-sm transition-transform hover:-rotate-6" />
      <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 bg-clip-text text-2xl font-black tracking-tight text-transparent">
        RichCalc
      </span>
    </Link>
  );
}

function SettingsMenu() {
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border-2 border-line bg-surface px-3 py-1.5 text-sm font-extrabold text-ink transition hover:border-violet-400"
      >
        <span aria-hidden>🌍</span>
        <span>{s.currency}</span>
        <span className="text-muted">·</span>
        <span>{s.imperial ? 'lb/ft' : 'kg/cm'}</span>
        <span className="sr-only">Change currency, units and theme</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          className="absolute right-0 top-full z-50 mt-2 grid w-[min(20rem,calc(100vw-2rem))] gap-4 rounded-3xl border border-line bg-surface p-5 shadow-pop"
        >
          <SelectField
            label="Currency"
            value={s.currency}
            onChange={s.setCurrency}
            options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} – ${c.name}` }))}
          />
          <Segmented
            label="Units"
            value={s.units}
            onChange={s.setUnits}
            options={[
              { value: 'metric', label: 'Metric' },
              { value: 'imperial', label: 'Imperial' },
            ]}
          />
          <Segmented
            label="Theme"
            value={s.theme}
            onChange={s.setTheme}
            options={[
              { value: 'light', label: '☀️ Light' },
              { value: 'dark', label: '🌙 Dark' },
              { value: 'system', label: 'Auto' },
            ]}
          />
          <p className="text-xs font-semibold text-muted">Saved in this browser only.</p>
        </div>
      )}
    </div>
  );
}

const NAV_COLORS = {
  money: 'hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-200 [&.active]:bg-emerald-100 [&.active]:text-emerald-800 dark:[&.active]:bg-emerald-900/50 dark:[&.active]:text-emerald-200',
  health: 'hover:bg-pink-100 hover:text-pink-800 dark:hover:bg-pink-900/50 dark:hover:text-pink-200 [&.active]:bg-pink-100 [&.active]:text-pink-800 dark:[&.active]:bg-pink-900/50 dark:[&.active]:text-pink-200',
  everyday: 'hover:bg-violet-100 hover:text-violet-800 dark:hover:bg-violet-900/50 dark:hover:text-violet-200 [&.active]:bg-violet-100 [&.active]:text-violet-800 dark:[&.active]:bg-violet-900/50 dark:[&.active]:text-violet-200',
};

function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-line/60 backdrop-blur-lg"
      style={{ background: 'color-mix(in srgb, var(--page) 80%, transparent)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav aria-label="Categories" className="hidden items-center gap-1 md:flex">
          {CATEGORIES.map((c) => (
            <NavLink
              key={c.id}
              to={`/${c.id}`}
              className={`rounded-full px-4 py-2 font-extrabold text-muted transition ${NAV_COLORS[c.id]}`}
            >
              <span aria-hidden>{c.emoji}</span> {c.name}
            </NavLink>
          ))}
        </nav>
        <SettingsMenu />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm font-semibold text-muted">
            Free, friendly calculators. No sign-up, no cookies, no tracking. Your numbers never leave your device.
          </p>
        </div>
        {CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <h2 className="mb-3 font-black text-ink">
              <Link to={`/${cat.id}`} className="hover:underline">
                {cat.emoji} {cat.name}
              </Link>
            </h2>
            <ul className="space-y-1.5">
              {CALCULATORS.filter((c) => c.category === cat.id).map((c) => (
                <li key={c.slug}>
                  <Link to={`/${c.slug}`} className="text-sm font-semibold text-muted hover:text-ink hover:underline">
                    {c.title.replace(' Calculator', '')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm font-semibold text-muted">
          <span>© {new Date().getFullYear()} RichCalc. Results are estimates for information only.</span>
          <Link to="/faq" className="hover:text-ink hover:underline">
            FAQ & privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 font-bold text-surface focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="relative mx-auto w-full max-w-6xl flex-1 px-4 pt-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
