# RichCalc

Friendly calculators for money, health and everyday life. React + Vite + Tailwind, no backend, no tracking.

## Commands

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests for all the maths (src/lib/*.test.js)
npm run lint
npm run build    # production build into dist/ (+ static page per route)
SITE_URL=https://your-domain.com npm run build   # also adds canonical URLs, sitemap.xml and robots.txt
```

## How it's organised

| Path | What's there |
| --- | --- |
| `src/calculators/meta.js` | **The registry**: every calculator's slug, title, emoji, category and SEO description. |
| `src/calculators/index.js` | Maps each slug to its (lazy-loaded) component. |
| `src/calculators/{money,health,everyday}/` | One file per calculator. |
| `src/lib/finance.js`, `health.js`, `dates.js` | Pure, tested maths. Keep formulas here, not in components. |
| `src/lib/settings.jsx` | Currency, units and theme (auto-detected from the browser, saved in localStorage) plus `money()`, `number()`, `date()` formatters. |
| `src/components/ui.jsx` | Shared inputs (money/percent/height/weight fields), result cards and layout. |
| `src/components/charts.jsx` | Lightweight SVG charts: donut, area chart, band gauge. |
| `scripts/prerender.mjs` | After build, writes `dist/<slug>/index.html` for every route with the right title/description. |

## Adding a calculator

1. Add an entry to `CALCULATORS` in `src/calculators/meta.js`.
2. Put any formulas in `src/lib/` with a test.
3. Create the component in the right category folder using `CalcLayout`, fields from `ui.jsx` and `About`.
4. Register it in `src/calculators/index.js`.

It then appears automatically on the home page, category page, footer, search and in the build output.

## Hosting

The build is fully static. Every route has its own `index.html`, so it works on any static host (Netlify, Vercel,
Cloudflare Pages, GitHub Pages at a root domain) without rewrite rules. `404.html` is generated for unknown URLs, and
the old `/faq.html` link still works.
