import type { ComponentChildren } from 'preact';

export const NAV = [
  { href: '/mortgage-or-isa/', label: 'Mortgage or ISA' },
  { href: '/how-it-works/', label: 'How it works' },
  { href: '/assumptions/', label: 'Assumptions' },
  { href: '/about/', label: 'About' },
];

/** The RichCalc mark: a small fan of outcomes opening out from a single point. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg class="logo" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path class="logo-outer" d="M4 16 L28 5 L28 27 Z" />
      <path class="logo-inner" d="M4 16 L28 10 L28 22 Z" />
      <path class="logo-median" d="M4 16 L28 15" />
      <circle class="logo-dot" cx="4" cy="16" r="3" />
    </svg>
  );
}

export function Header({ current }: { current: string }) {
  return (
    <header class="site-header">
      <a class="skip-link" href="#main">Skip to content</a>
      <div class="container">
        <a class="brand" href="/" aria-label="RichCalc home">
          <Logo />
          <span>RichCalc</span>
        </a>
        <nav class="site-nav" aria-label="Main">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} aria-current={current === n.href ? 'page' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer class="site-footer">
      <div class="container cols">
        <div>
          <p>
            <strong>RichCalc</strong> shows a range of possible outcomes, not a single answer. Every
            result is an illustration based on assumptions you can see and change. It isn’t financial
            advice: it can’t know your full circumstances. For personal advice, speak to a regulated
            financial adviser.
          </p>
          <p>No cookies, no tracking, no account. Everything is calculated in your browser.</p>
        </div>
        <ul aria-label="Tools">
          <li><a href="/mortgage-or-isa/">Overpay or invest?</a></li>
          <li>Salary sacrifice (coming soon)</li>
          <li>The £100k tax trap (coming soon)</li>
          <li>Rent or buy (coming soon)</li>
        </ul>
        <ul aria-label="About RichCalc">
          <li><a href="/how-it-works/">How it works</a></li>
          <li><a href="/assumptions/">Assumptions</a></li>
          <li><a href="/sources/">Sources</a></li>
          <li><a href="/about/">About and privacy</a></li>
        </ul>
      </div>
    </footer>
  );
}

export function Page({ current, children }: { current: string; children: ComponentChildren }) {
  return (
    <>
      <Header current={current} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
