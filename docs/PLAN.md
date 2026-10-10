# RichCalc v1 plan

Status: **approved 10 October 2026.** Steps 2 (engine and rules) and 3 (mortgage vs ISA) are built. See “Changes during the build” at the end.
Drafted 10 October 2026.

---

## 0. Summary

- **Stack:** Vite, Preact with signals, and TypeScript. Charts are hand-written SVG. Every page is pre-rendered to static HTML. The Monte Carlo runs in a Web Worker. There's no backend and no cookies.
- **Engine:** a pure TypeScript package (`engine/`) with no DOM or framework imports, enforced by lint rules. It's split into tax rules, a shared economic scenario generator, cash-flow models and per-tool comparators. It's tested with Vitest, plus property-based tests for things that must always hold.
- **Rules:** one versioned file per tax year (`rules/2026-27.ts`). Every value is wrapped as `{ value, source, verified, status }`. Announced future changes go on a dated timeline in the same file. `SOURCES.md` and `ASSUMPTIONS.md` are generated from the code, so they can't drift out of date.
- **Uncertainty model:** one shared, correlated scenario generator covering inflation, Bank Rate (and so mortgage and cash rates), equity and bond returns, house prices and rents. It runs yearly; cash flows are worked out monthly. The central paths are tied to published Bank of England projections and market expectations in the near term, and drift back to long-run levels calibrated from free historical data.
- **Signature visual:** a fan chart over time, plus a quantile dot plot at the year you pick, in which 50 dots each stand for 2% of outcomes. Research shows lay readers judge chances better from these than from shaded bands.
- **Timing risk:** the **Autumn Budget is on 28 October 2026**, 18 days away. I'll build against the rules as they stand plus changes already announced. The config is designed so the Budget can be absorbed by editing one file (see §10).

---

## 1. Site structure

```
/                          Home: the idea ("a range, not a number"), the four tools, one live mini fan chart
/mortgage-or-isa/          Tool 1
/salary-sacrifice/         Tool 2
/100k-tax-trap/            Tool 3
/rent-or-buy/              Tool 4
/how-it-works/             Monte Carlo in plain English, each distribution explained, how to read a fan chart
/assumptions/              Every default, with its value, source, rationale and range (generated)
/sources/                  Every source, with URL, publisher and last-verified date (generated)
/about/                    Who, why, the not-advice note, privacy ("no cookies, no tracking"), corrections policy
```

### Anatomy of a tool page (mobile-first, top to bottom)

1. **The question**, one line, e.g. "Overpay your mortgage or invest the money?"
2. **Your situation:** a short form with sensible defaults. Advanced inputs are folded away.
3. **Headline sentence**, written from the results. For example: *"In 7 of 10 simulated futures, investing ends up ahead after 10 years. The typical gap is £14,000 in today's money, but the range runs from −£9,000 to +£41,000."* The wording is generated from the numbers, and its framing is an illustration, never a recommendation.
4. **Fan chart:** the net-worth difference (B minus A) over time, with 10–90 and 25–75 bands, the median line and a zero line labelled with which option is ahead on each side.
5. **"Chance A is ahead" strip:** a probability for each year, labelled with numbers directly on the chart.
6. **Horizon picker plus dot plot:** 50 dots at the chosen year. Each dot is one 2% slice of outcomes, and dots are filled or hollow depending on which side wins, so the meaning never rests on colour alone.
7. **What changes the answer:** a tornado chart of the 2–3 assumptions that matter most, each with a flip point ("investing stays ahead unless average equity returns fall below 3.1% a year").
8. **Assumptions panel:** every assumption, its value, its source, why it was chosen and its plausible range. Each is editable, values that differ from the default are highlighted, and there's a reset button. Changes recompute live.
9. **"What this does and doesn't include":** the honest limits.
10. **Data tables:** a toggle under every chart gives the full table, and there's a CSV download.
11. **Share or bookmark:** the URL always reflects the current state, and a "Copy link" button sits next to it.
12. **Not-advice note:** one calm paragraph, not a wall of disclaimers.

---

## 2. Technical stack, and why

| Choice | Why |
|---|---|
| **Vite + Preact (+ @preact/signals)** | Preact is about 4 kB gzipped and works like React, so future maintainers will find it familiar. Signals give fine-grained live recompute without re-rendering whole forms. I chose it over Svelte mainly because the hard part, the engine, is plain TypeScript anyway, and Preact's JSX keeps the UI layer thin and conventional. |
| **Pre-rendered HTML** (a small `scripts/prerender.ts` using `preact-render-to-string`) | Explanations, methodology and assumptions are readable before or without JavaScript. It's good for SEO, gives fast first paint, and deploys to any static host. |
| **Hand-written SVG charts** (no chart library) | No 40–100 kB chart library. I get full control over accessibility (roles, labels, tables) and a distinctive look rather than library defaults. There are only four chart types: fan, dot plot, probability strip and tornado. |
| **Web Worker** for simulation | The UI never blocks. Results stream in stages (main result first, then sensitivity). Runs are cancelled if inputs change mid-run. |
| **Vitest + fast-check** | Unit tests, worked-example tests and property tests (e.g. net pay never exceeds gross, tax never decreases as income rises). |
| **ESLint + `tsc --noEmit` + size-limit** in CI | The engine is blocked from importing `preact`, the DOM or anything in `src/`. The bundle budget is enforced. |
| **Self-hosted fonts** | No calls to Google Fonts or any third party, so nobody's IP address leaks to anyone. |

**Performance budget:** at most 35 kB gzipped of JS on first load for a tool page (UI plus Preact). The worker bundle (engine) is at most 30 kB gzipped and loads in parallel. A full result (5,000 runs) should be visible in under 300 ms on a mid-range phone. Sensitivity follows within about 1 s.

**Hosting:** the build output is `dist/`, with relative asset paths and clean URLs via `dir/index.html`. That works on Cloudflare Pages, Netlify, GitHub Pages or S3 without changes. I'll add a deploy workflow once you tell me where it's hosted.

---

## 3. Repository layout

```
engine/                     # Pure TS. No DOM, no framework. Runs in Node (tests) and in the worker.
  core/      prng.ts (sfc32, seeded), normal.ts (Box–Muller, Student-t), quantiles.ts, money.ts
  tax/       incomeTax.ts (rUK + Scotland), nationalInsurance.ts, studentLoan.ts, childBenefit.ts (HICBC),
             childcare.ts (Tax-Free Childcare + funded hours by nation), pensionRelief.ts,
             propertyTax.ts (SDLT / LBTT / LTT), isa.ts
  sim/       esg.ts (economic scenario generator), mortgage.ts (amortisation, ERC, remortgage), portfolio.ts
  tools/     mortgageVsIsa.ts, salarySacrifice.ts, taxTrap.ts, rentVsBuy.ts
  analysis/  summarise.ts (percentiles, P(ahead) by year), sensitivity.ts (tornado), flip.ts (root-finding)
rules/
  schema.ts                 # Types for Sourced<T>, RuleSet, Timeline
  sources.ts                # Source registry: id → { title, publisher, url, accessed }
  2026-27.ts                # The rule set for the 2026/27 tax year, plus the announced-changes timeline
  index.ts                  # rulesFor(date): resolves base year + timeline for any future date
assumptions/
  economic.ts               # Default ESG parameters (Sourced, with rationale + plausible range)
  regions.ts                # Regional house price / rent levels and growth parameters (ITL1 regions)
  costs.ts                  # Buying/selling costs, maintenance, fund fees, ERC conventions
src/                        # Preact UI
  components/ FanChart, DotPlot, ProbabilityStrip, Tornado, AssumptionsPanel, DataTable, NumberField…
  tools/      one folder per tool (form, results, copy)
  pages/      home, how-it-works, assumptions, sources, about
  worker/     sim.worker.ts + typed message protocol
  state/      url.ts (encode/decode, versioned)
scripts/    prerender.ts, gen-docs.ts (writes SOURCES.md + ASSUMPTIONS.md), check-rules.ts
tests/      engine unit tests, HMRC worked examples, golden snapshots, property tests
```

One package, not a monorepo. The engine boundary is enforced by lint and by a separate `tsconfig` with `lib` excluding the DOM.

---

## 4. Engine architecture

```
inputs (from URL) ─┐
rules (dated)  ────┼─► tool model ──► per-run, per-year outcomes ──► summarise ──► view model
assumptions    ────┤        ▲                                        (P10/P25/P50/P75/P90,
seed           ────┘        │                                         P(A ahead) by year,
                    ESG paths (shared, seeded)                        dot-plot quantiles)
                                                                           │
                                         sensitivity / flip-point ◄────────┘ (re-runs with common random numbers)
```

**Determinism.** The `sfc32` PRNG is seeded from a 32-bit seed carried in the URL. The default seed is fixed, so a shared link reproduces exactly; a "Reshuffle futures" button changes it. Each economic variable draws from its own sub-stream, so adding a variable later doesn't change the others.

**Common random numbers.** Option A and option B in the same run see *the same* economy. Sensitivity re-runs also reuse the same shocks. This removes most of the noise from comparisons and makes flip points smooth and monotone, so they're solvable by bisection.

**Time step.** Economic shocks are drawn once a year. Cash flows (mortgage payments, contributions, rent) are worked out monthly within each year. That's accurate enough for these decisions, and 5,000 runs × 40 years stays well under 100 ms.

**Rules over time.** `rulesFor(date)` applies the base year plus any announced changes in force on that date. For years beyond anything announced, there's an explicit, editable **projection policy**. The default is "thresholds stay at their last announced value until the announced freeze ends, then rise with the simulated CPI path". So inflation-linked uprating uses each run's own inflation, which keeps fiscal drag consistent within every simulated future.

**Real vs nominal.** Results are shown in today's money by default (deflated by each run's simulated CPI), with a toggle for nominal.

**Sensitivity (tornado).** For each candidate assumption, I set it to its documented low and high values (roughly its plausible 10th and 90th percentile, stored next to the default) and re-run with common random numbers (2,000 runs). I then rank by how much the headline metric moves. The headline metric is the median difference at the chosen horizon, and P(A ahead) is shown alongside. The top 2–3 are shown, and the rest are available behind "show all".

**Flip points.** For each top assumption, I bisect for the value at which the median difference crosses zero (and, separately, where P(A ahead) crosses 50%). If no flip exists within a wide range, I say so plainly ("investing stays ahead across every value we tried, from 0% to 10%").

**Worker protocol.** It sends `{ tool, inputs, assumptionOverrides, seed, runs, stage }` and gets back staged results (`main`, then `sensitivity`). Each request carries an id, so stale results are dropped.

---

## 5. Probability model

**Principle:** central paths and spreads come from named public data. The parameter values below are **indicative**. Step 2 calibrates each one from the cited dataset, records the calculation and source in `assumptions/*.ts`, and generates ASSUMPTIONS.md from that. Anything I can't source to official data is labelled as a convention or judgement, with a reason, never passed off as fact.

### 5.1 Shared economic scenario generator (ESG)

Each year, a vector of correlated standard-normal shocks is drawn (Cholesky decomposition of a documented correlation matrix). Equities use a Student-t shock for fat tails.

| Variable | Model | Central path | Spread | Calibration source |
|---|---|---|---|---|
| **CPI inflation** | AR(1) mean-reverting: π_t = μ_t + φ(π_{t−1} − μ_{t−1}) + σε | Bank of England Monetary Policy Report projection for the first 2–3 years, then the 2% target | σ about 1.2 pp, φ about 0.6 (to be fitted) | ONS CPI (series D7G7) since 1997, BoE MPR fan-chart widths |
| **Bank Rate** | Mean-reverting (discrete Vasicek), floored at 0 | BoE market-implied path (from the MPR / BoE yield curve data) for about 5 years, then a long-run neutral nominal rate | σ about 0.8 pp/yr, fitted | BoE Bank Rate history, BoE yield curves |
| **Mortgage rate on remortgage** | Bank Rate + spread by LTV tier (60/75/85/90/95%) and fix length | — | Spread is fixed at its historical median; an editable assumption | BoE Bankstats quoted rates (e.g. series IUMBV34 2-yr 75% LTV, IUMBV42 5-yr 75%) minus Bank Rate, 2010–present |
| **Cash ISA rate** | Bank Rate − spread | — | — | BoE Bankstats quoted ISA rates vs Bank Rate |
| **Equity returns** (global, in GBP) | Log real return = μ + σ·t₅ (scaled to unit variance) | Long-run historical real return | σ about 17%/yr | Jordà–Schularick–Taylor Macrohistory database (free, CC-BY); ONS / BoE "Millennium of macroeconomic data" for UK history |
| **Bond returns** (gilts / global aggregate hedged) | Log real return, normal | Long-run historical | σ about 7%/yr | Same as above |
| **House prices** (per region) | AR(1) on real annual growth (house prices have momentum) | Regional long-run real growth | Regional σ about 5–9%, φ about 0.5 | ONS / HM Land Registry UK HPI (regions, 1995–), Nationwide regional series (1973–) for long run |
| **Private rents** (per region) | Real growth AR(1), positively correlated with house prices and CPI | Long-run real rent growth | σ about 2% | ONS Price Index of Private Rents (PIPR) and its predecessor IPHRP |
| **Wages** (tools 2–3 projections) | CPI + real wage growth, normal | OBR long-run real earnings growth | σ about 1.5 pp | ONS AWE, OBR Fiscal Risks & Sustainability report |

**Proposed correlations** (signs justified, magnitudes fitted): equities vs inflation slightly negative; rates vs house prices negative; house prices vs rents positive; inflation vs Bank Rate positive (captured mostly through mean-reversion targets).

**Plain-English versions** of each go on `/how-it-works/`. For example: *"Each simulated year, shares can do well or badly. Most years land within about 17% either side of the typical 5% real return, but roughly one year in twenty is a crash worse than −25%, which is about how often that has happened historically."*

**Known simplifications** (stated on the site): returns are independent year to year (no long-run mean reversion); no sequence-of-employment risk; no tax-policy uncertainty beyond what's announced (although the projection policy is editable).

**Judgement call: historical vs forward-looking returns.** By default I'd use long-run *historical* real returns, because that's the most neutral, sourceable choice. Many professional forecasters currently expect lower equity returns than the historical average. Since the sensitivity panel will almost certainly flag the return assumption as a top driver, the flip point makes this visible either way. (See question Q4.)

### 5.2 Tool 1: Overpay the mortgage or invest in an ISA?

- **Option A, overpay:** each month the spare cash goes to the mortgage. By default this shortens the term and keeps the payment the same. During a fixed period, overpayments are capped at the **ERC-free allowance**, by default 10% of the balance per year. This is a market convention, labelled as such and editable, and the user can also choose "my lender allows unlimited". Any excess goes to the ISA (the default) or pays the ERC (the user chooses). At the fix end, the remaining balance is remortgaged at the *simulated* rate for that date. A lower LTV may fall into a cheaper tier, which needs the optional property-value input. Once the mortgage is cleared, the old payment plus the spare cash goes into the ISA.
- **Option B, invest:** the same spare cash goes into the chosen ISA. S&S uses a risk mix (cautious 40/60, balanced 60/40, adventurous 80/20, all equity 100/0) minus a fund-plus-platform fee. Cash uses the simulated cash ISA rate. The same remortgage path applies.
- **Fairness rule:** both options always have identical cash outflows. That's the only way the comparison is honest.
- **Tax band and limits:** inside an ISA, investments are tax-free, so the tax band matters only where contributions exceed the ISA allowance (£20k a year). In that case the overflow goes to a general investment account taxed at the user's band (dividend tax, CGT and the personal savings allowance). From 6 April 2027 there's a **£12k cash ISA cap for under-65s** (announced; see the flags in §10), so the tool asks "under 65?" when cash ISA is chosen.
- **Outputs:** fan chart of (B − A) net worth; P(investing ahead) by year; dot plot at the chosen horizons (by default 5 and 10 years, and the original mortgage end). A **liquidity line** shows "money you could get at within a month" for each option, because overpayments are locked in the house, and that difference is real even when net worth is similar. Panels cover the ERC cap's effect and how much was diverted.
- **Likely key sensitivities:** equity return mean, remortgage spread / future Bank Rate, fee level, horizon.

### 5.3 Tool 2: Salary sacrifice vs take-home pay

- **Deterministic core (the current year):** gross-to-net with and without the sacrifice. That covers income tax (rUK or Scotland), employee NI, student loan (all plans plus postgraduate), and the effect on adjusted net income, which affects HICBC, the personal allowance taper and childcare eligibility, all reused from tool 3's tax core. **Employer NI passthrough** is yes, partial (a percentage) or none. Outputs: change in take-home pay, pension contribution added, and the **cost per £1 in the pension**. That cost is shown both before and after an assumed tax rate on withdrawal: 25% tax-free and the rest at an editable expected retirement band, with a basic-rate default.
- **Announced change:** from **6 April 2029**, sacrifice above **£2,000 a year** loses NI relief (both employee and employer Class 1). This is in the HMRC policy paper; regulations are still to come. The engine applies it from that date in projections, so the "cost per £1" chart visibly steps up in 2029/30.
- **Guard rails:** a warning if the sacrifice takes pay below National Minimum Wage / National Living Wage, or below the NI lower earnings limit (which can affect State Pension qualifying years).
- **Stochastic part:** the pot projection to a chosen retirement age, using simulated returns, wage growth and inflation, with thresholds following the projection policy. Output: a fan chart of the pot in today's money, and the extra pot per £1 of take-home pay given up.
- **Likely key sensitivities:** retirement tax band, employer passthrough, equity returns.

### 5.4 Tool 3: The £100k tax trap (deterministic, and says so)

- **Inputs:** gross income, pension contributions and their method (salary sacrifice, net pay or relief at source), **partner's income** (needed: child benefit charge applies to the higher earner, while childcare schemes test each parent), children's ages, childcare hours and cost, and nation.
- **Model:** "net household resources" = take-home pay + child benefit − HICBC + Tax-Free Childcare value + funded-hours value − student loan. The **marginal effective rate** is 1 − Δnet/Δgross, worked out on a £100 grid from £0 to £200k.
- **Cliff edges** (such as losing Tax-Free Childcare at £100,000.01) show as infinite spikes on a marginal-rate chart, so the tool draws **two charts**: the marginal rate (with cliffs annotated as "£X lost at once") and net resources against gross income, where cliffs show up as visible drops.
- **The way out:** for each trap (HICBC at £60–80k, the personal allowance taper at £100–125,140k, and the childcare cliffs at £100k), it shows the pension contribution needed to get back under the threshold, its net cost under each method, and the effective relief rate (which can exceed 100% when crossing a cliff).
- **Nations differ, and this matters:**
  - **England:** working-parent funded hours and Tax-Free Childcare both have a £100k adjusted net income limit.
  - **Scotland:** 1,140 funded hours for 3–4-year-olds are *not* income-tested, so only Tax-Free Childcare is at risk.
  - **Wales:** the Childcare Offer reportedly tests **gross pay before pension or salary sacrifice**, so pension contributions may *not* get someone back under the Welsh limit. To verify.
  - **NI:** a different scheme, to research.
- **Uncertainty:** none simulated. The page says plainly that this is arithmetic, not a forecast. An optional "next year" view applies announced changes.

### 5.5 Tool 4: Rent vs buy

- **Buyer:** pays the deposit, property tax by nation (SDLT in England and NI with first-time-buyer relief, LBTT in Scotland, LTT in Wales), buying costs, mortgage payments (fixed then remortgaged at simulated rates), maintenance as a % of value, and buildings insurance. At each year, buyer's net worth = house value − mortgage − selling costs + any invested surplus.
- **Renter:** invests the deposit plus everything the buyer spent up front in an S&S ISA (respecting allowances; "buying as 1 or 2 people" doubles them). Each month, whichever option is cheaper invests the difference, so cash outflows match, as in tool 1.
- **Region** sets the default house price, rent level and the growth / volatility parameters (12 ITL1 regions: the 9 English regions, Wales, Scotland and NI).
- **Outputs:** fan chart of (buy − rent) net worth over time; P(buying ahead) by year; a **break-even year distribution** shown as a dot plot of the first year buying is ahead in each run, with a "never within N years" bucket and a note on how often buying falls back behind after break-even.
- **Likely key sensitivities:** house price growth, equity returns, how long they stay, rent growth.

---

## 6. Rules and assumptions schema

```ts
// rules/schema.ts
export type Status =
  | 'confirmed'     // in force / legislated, checked against the primary source
  | 'announced'     // government announcement for a future date, legislation pending or partial
  | 'convention'    // market practice, not set by government (e.g. 10% ERC-free overpayment)
  | 'judgement'     // our modelling choice, with rationale
  | 'unverified';   // could not be verified; UI shows a visible badge, CI lists them

export interface SourceRef { id: SourceId; locator?: string } // locator = section/table/para

export interface Sourced<T> {
  value: T;
  source: SourceRef[];
  verified: string;          // ISO date last checked against the source
  status: Status;
  note?: string;             // plain-English "why this value"
}

export interface Assumption<T = number> extends Sourced<T> {
  key: string;               // stable id used in URLs: 'eq.realReturn'
  label: string;             // "Average yearly return on shares, after inflation"
  unit: '%' | '£' | 'years' | 'ratio' | 'count';
  range: { low: T; high: T; basis: string }; // used for sensitivity + input validation
  explain: string;           // shown in the assumptions panel
}

export interface Band { from: number; rate: number }

export interface RuleSet {
  taxYear: '2026-27';
  validFrom: '2026-04-06';
  validTo: '2027-04-05';
  incomeTax: {
    personalAllowance: Sourced<number>;
    taperThreshold: Sourced<number>;      // 100_000
    taperRate: Sourced<number>;           // 0.5
    rUK: Sourced<Band[]>;
    scotland: Sourced<Band[]>;
  };
  nationalInsurance: { employee: Sourced<Band[]>; employer: Sourced<Band[]>; lel: Sourced<number> };
  studentLoan: Record<'plan1'|'plan2'|'plan4'|'plan5'|'postgrad', Sourced<{ threshold: number; rate: number }>>;
  childBenefit: { weeklyEldest: Sourced<number>; weeklyAdditional: Sourced<number>;
                  hicbcStart: Sourced<number>; hicbcEnd: Sourced<number> };
  childcare: { taxFree: Sourced<{ maxPerChild: number; incomeLimit: number }>;
               funded: Record<'england'|'scotland'|'wales'|'ni', Sourced<FundedHoursRule>> };
  isa: { overall: Sourced<number>; cashCapUnder65?: Sourced<number> };
  pension: { annualAllowance: Sourced<number>; taperedThreshold: Sourced<number>; /* … */ };
  propertyTax: { sdlt: Sourced<PropertyTaxSchedule>; lbtt: Sourced<PropertyTaxSchedule>;
                 ltt: Sourced<PropertyTaxSchedule> };
  minimumWage: Sourced<Record<'21plus'|'18to20'|'under18', number>>;
}

// Announced future changes, applied by rulesFor(date)
export interface ScheduledChange {
  effectiveFrom: string;     // '2029-04-06'
  path: string;              // 'nationalInsurance.salarySacrificeCap'
  value: unknown;            // 2000
  source: SourceRef[];
  status: 'announced' | 'confirmed';
  summary: string;           // "NI relief on salary sacrifice capped at £2,000/yr"
}

export interface ProjectionPolicy {   // what happens after announced rules run out (editable assumption)
  thresholds: 'frozen' | 'cpi' | 'cpi-after-announced-freeze';
}
```

```ts
// rules/2026-27.ts (excerpt, illustrative of shape only)
incomeTax: {
  personalAllowance: {
    value: 12_570,
    source: [{ id: 'govuk-income-tax-rates' }, { id: 'hmrc-pp-thresholds-2031' }],
    verified: '2026-10-10', status: 'confirmed',
    note: 'Frozen until 5 April 2031 (policy paper, 26 Nov 2025).',
  },
  ...
}
```

- `sources.ts` holds each source once: `{ id, title, publisher, url, accessed }`. Preference order: GOV.UK / HMRC / legislation.gov.uk / gov.scot / gov.wales / ONS / BoE / OBR, then authoritative secondary sources (IFS, LITRG), then industry sources only where there is no official one (marked `convention`).
- `scripts/gen-docs.ts` writes **SOURCES.md** and **ASSUMPTIONS.md** from the code. A test fails if the committed docs are stale. Human-written prose (the "why" and the caveats) lives in the `note` / `explain` fields, so there's one place to edit.
- `scripts/check-rules.ts` (also run in CI) fails if a rule set is used past its `validTo` with no successor. It warns when any `verified` date is more than 6 months old and lists every `unverified` item.

---

## 7. Shareable URL state

- Human-readable query parameters, so people can see what a link contains: `/mortgage-or-isa/?bal=250000&rate=4.29&term=22&fixEnd=2028-06&spare=400&isa=ss&risk=bal&band=higher&v=1&seed=1&r=2026-27`.
- **Only non-default values** are encoded, which keeps links short. Assumption overrides use a prefix: `a.eq.realReturn=3.5`.
- `v` (schema version) means old links keep working through migrations. `r` (rule set) means a shared result says which rules it used. If newer rules exist, a banner offers "Recalculate with 2027/28 rules".
- The URL updates with `history.replaceState` (debounced). Nothing is stored in cookies or localStorage.

---

## 8. Design direction

- **Mood:** calm, precise and a little editorial, like a good statistics bureau crossed with a well-set book. Warm off-white "paper" background, deep ink-blue text, one warm accent (amber) for option B and ink for option A. Patterns, shapes and direct labels carry meaning too. There's a dark mode.
- **Type:** a sturdy serif for headings and numbers in the results sentence, a clean sans for UI, tabular figures throughout. Self-hosted subsets only, to keep the payload small.
- **Signature:** the fan chart's bands are drawn as soft layered "ink washes". The dot plot puts 50 dots on a number line, filled for "A ahead" and ringed for "B ahead". On load the dots fall into place once, a deliberate quiet animation that shows each dot is one possible future; this is disabled under `prefers-reduced-motion`.
- **Accessibility (WCAG 2.2 AA):** contrast at least 4.5:1, focus styles, full keyboard use. Charts have `role="img"` plus a text summary, a data table toggle and keyboard scrubbing across years with a live-region readout. Touch targets are at least 44 px. Charts are readable at 320 px width, simplifying the axes rather than shrinking text.
- I'll show you the visual direction with tool 1 before applying it everywhere.

---

## 9. Testing strategy

- **Tax engine:** tables of hand-checked cases with the arithmetic shown in comments.
  - HMRC and GOV.UK worked examples: personal allowance taper, HICBC examples, student loan examples from HMRC's employer guidance, and the NI tables.
  - Edge cases: exactly £12,570, £50,270, £60,000, £80,000, £100,000, £100,001, £125,140 and £125,141.
  - Every Scottish band boundary: £16,537 / £16,538, £29,526 / £29,527, £43,662 / £43,663, £75,000 / £75,001.
  - Every student loan threshold ±£1, the NI UEL, and the SDLT / LBTT / LTT band edges plus the first-time-buyer cliff.
- **Property tests:** take-home pay never exceeds gross; tax is monotone non-decreasing in income; marginal rates match finite differences; mortgage balances never go negative; P(A ahead) + P(B ahead) + P(tie) = 1.
- **Simulation tests:** the same seed gives identical output; sample moments match the specified parameters within tolerance (e.g. mean and sd of 100k equity draws); correlations are recovered; with volatility set to zero, results match a hand-written deterministic spreadsheet case.
- **Golden snapshots:** a small set of full tool scenarios with seeded outputs, so unintended changes show up in review.
- **UI:** Playwright smoke tests (load each tool, change an input, check results update and the URL round-trips) and axe-core accessibility checks.

---

## 10. Research done so far, and flags

Spot-checked while drafting this plan. Everything will be fully re-verified against primary sources in step 2.

| Item | Finding | Status |
|---|---|---|
| Scottish bands 2026/27 | Starter 19% to £16,537; basic 20% to £29,526; intermediate 21% to £43,662; higher 42% to £75,000; advanced 45% to £125,140; top 48%. The Scottish Rate Resolution passed on 19 Feb 2026. | Confirmed (gov.scot) |
| PA / basic rate limit / higher and additional thresholds | £12,570 / £37,700 / £50,270 / £125,140, frozen to 5 April 2031. NI primary threshold frozen on the same timetable. | Confirmed (GOV.UK policy paper) |
| Salary sacrifice NI cap | £2,000 a year from 6 April 2029, with Class 1 NICs (employee and employer) on the excess. The Act reportedly received Royal Assent in April 2026, but **regulations are pending**. | Announced; the detail needs verifying |
| Student loan thresholds 2026/27 | Plan 1 £26,900 and Plan 5 £25,000 are confirmed on GOV.UK. Plan 2 £29,385, Plan 4 £33,795 and postgraduate £21,000 come from secondary sources only so far. **Sources conflict** on whether the Plan 2 freeze at £29,385 starts in 2026/27 or 2027/28. | Partly unverified |
| Cash ISA cap | £12,000 for under-65s from 6 April 2027 (overall £20k unchanged). **The rule for people turning 65 in-year is unsettled.** | Announced; secondary sources only so far |
| Wales Childcare Offer | Reportedly tests gross pay *before* pension or salary sacrifice, which changes the "escape the trap" answer in Wales. | To verify on gov.wales |
| Dividend tax | +2 pp for basic and higher rate from April 2026. This is used only for overflow above the ISA allowance. | To verify |
| Bank Rate / CPI starting point | Reported Bank Rate 3.75% (held 17 Sept 2026) and CPI 3.1% (August 2026). | To verify with BoE / ONS |
| **Autumn Budget 2026** | **Wednesday 28 October 2026** (secondary sources; new Chancellor). It may change thresholds, ISA rules, salary sacrifice, SDLT or the student loan terms. | Upcoming event |
| No official source exists | ERC-free overpayment allowance (10%), maintenance % of property value, estate agent and conveyancing fees, platform fees, cash ISA spread. | Will be labelled `convention` with the best available evidence |

---

## 11. Decisions I've made (tell me if you disagree)

1. **All four UK nations** are supported where the rules differ: income tax (Scotland vs the rest of the UK), property tax (SDLT / LBTT / LTT) and childcare schemes. Your brief said "Scotland or rUK", but tools 3 and 4 would give wrong answers in Wales and NI without this.
2. **Tool 3 asks for partner's income** (optional). Without it, the child benefit charge and childcare cliffs can't be modelled correctly.
3. **Results are in today's money by default**, with a nominal toggle.
4. **The default seed is fixed**, so identical URLs reproduce identical charts. A "Reshuffle futures" button changes it.
5. **Runs:** 5,000 for the main result and 2,000 per sensitivity variant (with common random numbers), with an advanced setting to raise this to 20,000.
6. **The default horizon for tool 1** is the mortgage's remaining term, with 5 and 10 years highlighted.
7. **Fair comparisons:** both options always spend the same cash each month, and the surplus is invested.
8. **No analytics at all** in v1, unless you say otherwise (Q3).
9. **The engine works in pounds as floats**, and tax is rounded only where HMRC rounds (e.g. whole pounds for income tax bands in payroll contexts). This is documented in the tests.
10. **Unverified values are never hidden:** they show an "unverified" badge in the assumptions panel, and CI lists them.

---

## 12. Questions for you

1. **Autumn Budget (28 Oct).** I suggest building now against current and announced rules, then doing a rules-update pass after the Budget. That's mostly a one-file change and becomes the first real test of the April update process. Is that OK?
2. **Brand.** Should the site present itself as "RichCalc"? Do you have a tagline, logo or colour preferences? If not, I'll propose a simple wordmark.
3. **Analytics.** Do you want none at all (my default), or cookieless aggregate page counts (e.g. Cloudflare Web Analytics or Plausible)?
4. **Return assumptions.** Should the default use long-run historical real returns (my default: neutral and well-sourced), or a more cautious forward-looking figure? Either way it's editable, and the flip point will show how much it matters.
5. **Hosting.** You said you'd tell me. Nothing blocks on this until deployment.

---

## 13. Milestones

1. **This plan**, for approval.
2. **Engine and rules:** scaffold (Vite, Preact, TS, lint, Vitest, CI), PRNG and statistics, the tax modules (income tax, NI, student loan, HICBC, childcare, property tax, ISA), the ESG, mortgage and portfolio models, sensitivity and flip points, `rules/2026-27.ts` fully sourced, generated SOURCES.md and ASSUMPTIONS.md, and the README.
3. **Tool 1 end to end:** UI shell, design system, the chart components, the worker, URL state, the assumptions panel, sensitivity, the how-it-works page. I'll stop here for your review.
4. **Tools 2, 3 and 4**, reusing the components, then a full accessibility and performance pass, and deployment once the host is known.

---

## 14. Answers and changes during the build

**Answers to the questions in §12:** build now and update after the Autumn Budget; brand is “RichCalc”, modern; cookie-free page counts (Netlify Web Analytics, which uses server logs and needs no code); long-run historical returns as the default; hosting on Netlify.

**Changes from the plan, and why:**

- **Bank Rate's long run is set as a margin above inflation** (`rate.longRunReal` = 1.25 points, from the BoE survey's 3.25% less the 2% target), not as a fixed nominal level. Otherwise, changing long-run inflation on its own produced negative real rates and misleading sensitivity results.
- **Overpayers keep their monthly payment at each remortgage** and take a shorter term. The first version recalculated the payment over the original term, which wrongly pushed overpayments into the 10% allowance.
- **Lower rates for a lower loan-to-value are not modelled.** We couldn't source the tier spreads, and inventing them would break the “no invented numbers” rule. This slightly understates the benefit of overpaying, and the page says so.
- **Early repayment charges are never paid.** Overpayments stop at the allowance and the excess is invested.
- **Preact signals were dropped** in favour of plain hooks, which saves about 2 kB.
- **Body text uses the system UI font**, and only headings use self-hosted Fraunces. That keeps the font payload to 37 kB.
- **The childcare engine modules move to tool 3.** The rules for every UK nation are already in the config.

**Still to verify** (flagged in the UI and in ASSUMPTIONS.md):

- The long-run equity and bond return and volatility figures (UBS / Dimson–Marsh–Staunton Yearbook).
- A formal fit of the inflation and Bank Rate volatility and persistence parameters to ONS and BoE data. Our research environment couldn't download datasets (only web search worked), so these are labelled as judgement for now.
