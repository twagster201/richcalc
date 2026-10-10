# RichCalc

UK personal-finance decision tools built around honest uncertainty. Each tool shows a range of likely
outcomes, how often each option comes out ahead, and every assumption behind the result. You can
change all of those assumptions.

Domain: <https://richcalc.com> (static site, deployed on Netlify).

| Tool | Status |
|---|---|
| Overpay the mortgage or invest in an ISA? (`/mortgage-or-isa/`) | Built |
| Salary sacrifice vs take-home pay | Planned |
| The £100k tax trap | Planned |
| Rent vs buy | Planned |

The design and modelling plan is in [`docs/PLAN.md`](docs/PLAN.md). The numbers live in [`ASSUMPTIONS.md`](ASSUMPTIONS.md)
and [`SOURCES.md`](SOURCES.md), both generated from the code.

## Quick start

```bash
npm install
npm run dev          # local dev server at http://localhost:5173
npm test             # engine, rules and docs unit tests (Vitest)
npm run build        # static site in dist/
npm run test:e2e     # browser tests and accessibility checks (Playwright + axe), against the built site
npm run check        # typecheck + lint + unit tests + rules health check
```

Node 22 is recommended (Node 20 or later is required).

## How it's built

- **Vite + Preact + TypeScript.** Preact is about 4 kB, and the interesting work is in the framework-free
  engine anyway. Every page is pre-rendered to static HTML at build time (`src/ssr.tsx`,
  `scripts/prerender.ts`), so content reads before JavaScript loads. The tool page embeds a real default
  result computed at build time.
- **Engine** (`engine/`): pure TypeScript with no DOM or framework imports, enforced by ESLint and a
  separate `engine/tsconfig.json`. It contains:
  - `core/`: seeded PRNG (sfc32), statistics, dates.
  - `tax/`: income tax (rUK and Scotland, savings and dividends), NI, student loans, child benefit and the
    charge (HICBC), SDLT/LBTT/LTT, CGT.
  - `sim/`: economic scenario generator, mortgage maths.
  - `tools/`: one model per tool.
  - `analysis/`: percentiles, dot-plot quantiles, sensitivity, flip points.
- **Rules** (`rules/`): one file per tax year (`rules/2026-27.ts`). Every value carries its source, the
  date it was last verified and a status. Announced changes sit in `scheduledChanges` with effective dates,
  and `rulesFor(date)` applies them.
- **Assumptions** (`assumptions/economic.ts`): economic defaults, each with a source, status, reasoning,
  plausible range (used for sensitivity) and hard bounds.
- **Simulation** runs in a Web Worker (`src/worker/`). The default is 5,000 runs, plus 1,000 runs per
  sensitivity variant. Results are reproducible from the seed in the URL.
- **Charts** are hand-written SVG (`src/components/charts/`): fan chart, probability strip, quantile dot
  plot and tornado. Every chart has a text summary, and the fan chart has a data table and CSV download.
  Meaning is never carried by colour alone.
- **URL state:** all inputs and assumption overrides are in the query string, readable, with only
  non-default values written. `v=1` versions the format.

### Performance budget

`npm run build` fails if any page's JavaScript is over 40 kB gzipped, or the worker is over 35 kB. As of the
first build, the tool page is about 28 kB and the worker about 11 kB.

### Design

The two options in a comparison use a blue/copper pair:

- Light: `#0f72a0` and `#d0621f`.
- Dark: `#3a9ccc` and `#d86a2a`.

This pair passes colour-vision-deficiency separation, lightness and contrast checks in both modes. Shape
also distinguishes the options (filled dots vs rings, labelled sides of the zero line).

Headings use Fraunces (self-hosted, 37 kB, SIL Open Font License); body text uses the system UI font.
There are no third-party requests of any kind.

## Testing

- `tests/engine/`: tax calculations against GOV.UK worked examples and hand-checked edge cases. These cover
  exactly £100,000, £125,140, every Scottish band boundary, every student loan threshold ±£1, the SDLT
  first-time buyer cliff and the HICBC steps. Simulation tests cover reproducibility, moments, correlations
  and fat tails, plus deterministic checks for the mortgage model (e.g. investing at exactly the mortgage
  rate breaks even). Property-based tests (fast-check) check that tax never decreases with income and
  slices add up.
- `tests/unit/`: URL round-trips and formatting.
- `tests/docs/`: fails if `ASSUMPTIONS.md` or `SOURCES.md` is out of date (fix with `npm run docs`).
- `tests/e2e/`: Playwright tests, at desktop and phone sizes. They cover:
  - results without JavaScript, live recompute, shared links and the assumption editing round-trip
  - no horizontal scrolling
  - axe WCAG 2.2 AA checks on every page
  - a run under the exact production Content-Security-Policy

If Playwright can't download its own browser, point it at an existing Chromium with
`PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm run test:e2e`.

## Deploying to Netlify

`netlify.toml` contains everything Netlify needs: the build command, the publish directory, Node version,
strict security headers (CSP allows only same-origin), long caching for hashed assets, and a www → apex
redirect.

1. In Netlify: **Add new site → Import an existing project** and choose this repository. The build settings
   are read from `netlify.toml`.
2. **Domain management:** add `richcalc.com` (and `www.richcalc.com`), then follow Netlify's DNS
   instructions. HTTPS is automatic.
3. **Page counts without cookies:** in the site's dashboard, go to **Analytics & metrics → Analytics →
   Enable**. Netlify Web Analytics works from server logs, with no script and no cookies, so the site
   needs no code changes. It may be a paid add-on depending on your plan, so check *Usage & billing*
   first.

The privacy page says page views are counted from server logs. If you decide not to enable analytics,
remove that bullet from `src/pages/About.tsx`.

## Updating the rules (every April, and after each Budget)

All tax numbers live in `rules/`. Nothing else should contain a rate, threshold or allowance.

**After a Budget or fiscal event** (e.g. the Autumn Budget on 28 October 2026):

1. Read the Budget documents. The "Overview of tax legislation and rates" (OOTLAR) and its Annex A are the
   most useful.
2. For changes to the current tax year, edit the value in `rules/2026-27.ts`. Update `verified`, `status`
   and `note`.
3. For announced future changes, add an entry to `scheduledChanges` with its `effectiveFrom` date,
   sources and an `apply` function.
4. Add any new sources to `rules/sources.ts`.
5. Run `npm run docs && npm run check`. Fix any hand-checked test whose expected value changed, and say
   why in the commit.

**Each April (new tax year):**

1. Copy `rules/2026-27.ts` to `rules/2027-28.ts`. Set `id`, `taxYear`, `validFrom` and `validTo`.
2. Fold in the scheduled changes that take effect on 6 April, and remove them from the timeline (the
   loader only applies changes dated after a rule set's `validFrom`).
3. Re-verify every value against GOV.UK, HMRC, gov.scot (Scottish Rate Resolution) and gov.wales. In
   particular, check:
   - the employer rates and thresholds page
   - student loan thresholds
   - Child Benefit rates
   - National Minimum Wage
   - LBTT and LTT rates
4. Set each `verified` date.
5. Register the new file in `rules/index.ts` (`RULE_SETS`).
6. Add tests for the new year's edge cases (copy the 2026/27 tables and update the expected values).
7. Run `npm run docs && npm run check && npm run build`.

`npm run check:rules` fails once today is past the latest rule set's `validTo`. It also warns about values
not verified in six months, and lists everything still marked `unverified`.

**Economic assumptions** (`assumptions/economic.ts`) should be refreshed when the Bank of England publishes
a new Monetary Policy Report: starting inflation, Bank Rate, and the market-implied long-run rate.

## Adding a tool

1. Write the model in `engine/tools/` as pure functions taking inputs, assumption values and scenario paths.
   Test it, including a zero-volatility case you can check by hand.
2. Add an analysis wrapper (summaries plus sensitivity candidates) alongside it.
3. Add the page under `src/tools/<tool>/`, an HTML shell at `<path>/index.html`, an entry in
   `src/entries/`, a row in `src/pages/registry.ts`, the input in `vite.config.ts`, and a render in
   `src/ssr.tsx`.
