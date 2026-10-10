import { useEffect, useMemo, useState } from 'preact/hooks';
import { ECONOMIC, RISK_MIXES } from '../../../assumptions/economic';
import type { MortgageVsIsaSensitivity, MortgageVsIsaSummary } from '../../../engine/tools/mortgageVsIsaAnalysis';
import { rulesFor } from '../../../rules';
import { AssumptionsPanel, SourceLinks, StatusBadge } from '../../components/AssumptionsPanel';
import { Choice, NumberField, SelectField } from '../../components/Fields';
import { DotPlot } from '../../components/charts/DotPlot';
import { FanChart } from '../../components/charts/FanChart';
import { ProbabilityStrip } from '../../components/charts/ProbabilityStrip';
import { Tornado } from '../../components/charts/Tornado';
import { formatAssumption } from '../../lib/assumptionFormat';
import { chance, money, moneySigned, pct, years } from '../../lib/format';
import { A_NAME, B_NAME, considerations, flipSentence, headline, sensitivityLead } from './copy';
import {
  assumptionValues,
  currentMonth,
  decodeState,
  defaultHorizon,
  defaultState,
  encodeState,
  toInputs,
  type MortgageForm,
  type MortgageState,
} from './state';
import { useSimulation } from './useSimulation';

export interface InitialData {
  startDate: string;
  key: string;
  main: MortgageVsIsaSummary;
  sensitivity: MortgageVsIsaSensitivity | null;
  horizon: number;
}

const ASSUMPTION_KEYS_SS = [
  'eq.return', 'eq.vol', 'bond.return', 'bond.vol', 'fees',
  'infl.start', 'infl.longRun', 'infl.fade', 'infl.vol', 'infl.persistence',
  'rate.start', 'rate.longRunReal', 'rate.persistence', 'rate.vol', 'rate.inflationResponse',
  'mort.spread', 'mort.refixYears', 'mort.overpayAllowance', 'gia.dividendYield',
];
const ASSUMPTION_KEYS_CASH = [
  'cash.spread',
  'infl.start', 'infl.longRun', 'infl.fade', 'infl.vol', 'infl.persistence',
  'rate.start', 'rate.longRunReal', 'rate.persistence', 'rate.vol', 'rate.inflationResponse',
  'mort.spread', 'mort.refixYears', 'mort.overpayAllowance',
];

export function MortgageTool({ initial }: { initial: InitialData }) {
  const [startDate, setStartDate] = useState(initial.startDate);
  const [state, setState] = useState<MortgageState>(() => ({ ...defaultState(initial.startDate), horizon: initial.horizon }));
  const [hydrated, setHydrated] = useState(false);

  // After hydration: adopt the URL and today's month.
  useEffect(() => {
    const month = currentMonth();
    setStartDate(month);
    if (location.search) setState(decodeState(location.search, month));
    setHydrated(true);
  }, []);

  // Keep the URL in step with the state, so any result can be bookmarked or shared.
  useEffect(() => {
    if (!hydrated) return;
    const q = encodeState(state, startDate);
    if (q !== location.search) history.replaceState(null, '', `${location.pathname}${q}`);
  }, [state, startDate, hydrated]);

  const inputs = useMemo(() => toInputs(state.form, startDate), [state.form, startDate]);
  const values = useMemo(() => assumptionValues(state.overrides), [state.overrides]);
  const sim = useSimulation(inputs, values, state.seed, state.horizon, {
    key: initial.key,
    main: initial.main,
    sensitivity: initial.sensitivity,
    horizon: initial.horizon,
  });

  const setForm = (patch: Partial<MortgageForm>) =>
    setState((s) => {
      const form = { ...s.form, ...patch };
      const maxH = Math.ceil(form.term);
      const horizon = patch.term !== undefined ? Math.min(Math.max(1, s.horizon), maxH) || defaultHorizon(form.term) : s.horizon;
      return { ...s, form, horizon };
    });
  const setHorizon = (h: number) => setState((s) => ({ ...s, horizon: h }));

  const main = sim.main;
  const years_ = main?.years ?? 1;
  const horizon = Math.min(state.horizon, years_);
  const row = main?.diff[horizon - 1];
  const assumptionKeys = state.form.isa === 'cash' ? ASSUMPTION_KEYS_CASH : ASSUMPTION_KEYS_SS;
  const busy = sim.mainPending;

  return (
    <div class="container tool">
      <header class="page-intro">
        <div class="kicker">Mortgage · Saving</div>
        <h1>Overpay your mortgage, or invest the money?</h1>
        <p class="lede">
          Thousands of possible futures for interest rates, inflation and markets, run on your numbers. You’ll see how
          often each choice comes out ahead, by how much, and which assumptions decide it.
        </p>
      </header>

      <div class="tool-grid">
        <aside class="tool-inputs card" aria-labelledby="your-situation">
          <h2 id="your-situation">Your situation</h2>
          <NumberField id="bal" label="Mortgage balance" prefix="£" value={state.form.balance} min={1_000} max={5_000_000} onChange={(v) => setForm({ balance: v })} />
          <NumberField id="rate" label="Interest rate now" suffix="%" value={state.form.rate} min={0} max={20} onChange={(v) => setForm({ rate: v })} />
          <NumberField id="term" label="Years left on the mortgage" suffix="years" value={state.form.term} min={1} max={40} onChange={(v) => setForm({ term: v })} />
          <Choice
            name="fixed"
            legend="Is your rate fixed?"
            value={state.form.fixEnd === 'none' ? 'no' : 'yes'}
            options={[
              { value: 'yes', label: 'Fixed' },
              { value: 'no', label: 'Variable or tracker' },
            ]}
            onChange={(v) => setForm({ fixEnd: v === 'no' ? 'none' : defaultState(startDate).form.fixEnd })}
          />
          {state.form.fixEnd !== 'none' && (
            <div class="field">
              <label for="fixEnd">When does the fixed rate end?</label>
              <div class="hint">After this, the model remortgages you at a simulated future rate.</div>
              <input
                id="fixEnd"
                type="month"
                value={state.form.fixEnd}
                min={startDate}
                onChange={(e) => {
                  const v = (e.currentTarget as HTMLInputElement).value;
                  if (/^\d{4}-\d{2}$/.test(v)) setForm({ fixEnd: v });
                }}
              />
            </div>
          )}
          <NumberField
            id="spare"
            label="Spare cash each month"
            prefix="£"
            value={state.form.spare}
            min={0}
            max={50_000}
            hint="The amount you’d either overpay or invest."
            onChange={(v) => setForm({ spare: v })}
          />
          <Choice
            name="isa"
            legend="If you invest, where?"
            value={state.form.isa}
            options={[
              { value: 'ss', label: 'Stocks & shares ISA' },
              { value: 'cash', label: 'Cash ISA' },
            ]}
            onChange={(v) => setForm({ isa: v })}
          />
          {state.form.isa === 'ss' ? (
            <SelectField
              id="risk"
              label="Investment mix"
              value={state.form.risk}
              options={Object.entries(RISK_MIXES).map(([k, r]) => ({ value: k as keyof typeof RISK_MIXES, label: r.label }))}
              onChange={(v) => setForm({ risk: v })}
            />
          ) : (
            <Choice
              name="u65"
              legend="Are you under 65?"
              hint="From April 2027, under-65s can put at most £12,000 a year into cash ISAs."
              value={state.form.under65 ? 'yes' : 'no'}
              options={[
                { value: 'yes', label: 'Under 65' },
                { value: 'no', label: '65 or over' },
              ]}
              onChange={(v) => setForm({ under65: v === 'yes' })}
            />
          )}
          <Choice
            name="people"
            legend="ISA allowances you can use"
            value={state.form.people}
            options={[
              { value: 1, label: 'Mine (£20k a year)' },
              { value: 2, label: 'Mine and a partner’s (£40k)' },
            ]}
            onChange={(v) => setForm({ people: v })}
          />
          <Choice
            name="band"
            legend="Income tax band"
            hint="Only matters if money overflows the ISA allowance into a taxable account."
            value={state.form.band}
            options={[
              { value: 'basic', label: 'Basic' },
              { value: 'higher', label: 'Higher' },
              { value: 'additional', label: 'Additional' },
            ]}
            onChange={(v) => setForm({ band: v })}
          />
        </aside>

        <section class="tool-results" aria-labelledby="results-heading">
          <h2 id="results-heading" class="sr-only">Results</h2>
          {!main || !row ? (
            <div class="card">Calculating…</div>
          ) : (
            <>
              <div class={`card headline${busy ? ' is-updating' : ''}`} aria-live="polite" aria-busy={busy}>
                <p class="headline-lead">{headline(main, horizon).lead}</p>
                <p class="headline-detail">{headline(main, horizon).detail}</p>
                <div class="headline-stats">
                  <div>
                    <span class="stat-label">Chance investing is ahead</span>
                    <span class="stat-value">{chance(row.probPositive)}</span>
                  </div>
                  <div>
                    <span class="stat-label">Middle outcome</span>
                    <span class="stat-value">{moneySigned(row.p50)}</span>
                    <span class="stat-sub">{row.p50 >= 0 ? 'in favour of investing' : 'in favour of overpaying'}</span>
                  </div>
                  <div>
                    <span class="stat-label">Looking at</span>
                    <span class="stat-value">{years(horizon)}</span>
                  </div>
                </div>
                <p class="run-meta">
                  {main.runs.toLocaleString('en-GB')} simulated futures, in today’s money.{' '}
                  {sim.mainPending ? <span class="updating">Updating…</span> : null}
                </p>
              </div>

              <section class="result-section card">
                <h2>How the gap could grow</h2>
                <p class="section-lede">
                  Net worth if you invest, minus net worth if you overpay. Above the line, investing is ahead; below it,
                  overpaying is. The fan widens because the further ahead you look, the more could happen.
                </p>
                <FanChart
                  id="fan"
                  data={main.diff}
                  aboveLabel="Investing ahead"
                  belowLabel="Overpaying ahead"
                  selectedYear={horizon}
                  onSelectYear={setHorizon}
                  probabilityLabel="Chance investing ahead"
                  summary={`Fan chart over ${main.years} years. After ${horizon} years the middle outcome is ${moneySigned(row.p50)}, with 80% of futures between ${moneySigned(row.p10)} and ${moneySigned(row.p90)}.`}
                />
                <DiffTable main={main} />
              </section>

              <section class="result-section card">
                <h2>Chance investing comes out ahead, year by year</h2>
                <ProbabilityStrip
                  data={main.diff}
                  selectedYear={horizon}
                  onSelectYear={setHorizon}
                  bName={B_NAME}
                  aName={A_NAME}
                  summary={`Chance investing is ahead: ${chance(main.diff[0].probPositive)} after 1 year, ${chance(row.probPositive)} after ${horizon} years, ${chance(main.diff[main.years - 1].probPositive)} at the end of the mortgage.`}
                />
              </section>

              <section class="result-section card">
                <h2>After {years(horizon)}: 50 possible futures</h2>
                <div class="horizon">
                  <label for="horizon">Year to look at: <strong>{horizon}</strong></label>
                  <input
                    id="horizon"
                    type="range"
                    min={1}
                    max={main.years}
                    value={horizon}
                    onInput={(e) => setHorizon(Number((e.currentTarget as HTMLInputElement).value))}
                  />
                </div>
                <p class="section-lede">
                  Each dot is one in fifty simulated futures, placed by how far ahead investing (right) or overpaying
                  (left) ends up.
                </p>
                <DotPlot
                  values={main.dotsByYear[horizon - 1]}
                  aboveLabel="Investing ahead"
                  belowLabel="Overpaying ahead"
                  animateKey={`${horizon}-${main.seed}`}
                  summary={`Dot plot of 50 futures after ${horizon} years: ${main.dotsByYear[horizon - 1].filter((v) => v > 0).length} show investing ahead, the rest overpaying.`}
                />
              </section>

              <section class="result-section card">
                <h2>Other things to weigh</h2>
                <ul class="considerations">
                  {considerations(main, state.form, horizon).map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>

              <section class="result-section card" aria-busy={sim.sensitivityPending}>
                <h2>What changes the answer</h2>
                {sim.sensitivity ? (
                  <>
                    <p class="section-lede">{sensitivityLead(sim.sensitivity)}</p>
                    <ul class="flips">
                      {sim.sensitivity.flips.map((f) => (
                        <li key={f.key}>{flipSentence(f)}</li>
                      ))}
                    </ul>
                    <p class="muted small">
                      Each bar shows the middle outcome after {years(sim.sensitivity.horizonYear)} when one assumption is set
                      to the low and high end of its plausible range, with everything else unchanged. The vertical line is
                      your current result.
                    </p>
                    <Tornado
                      items={sim.sensitivity.tornado.slice(0, 6)}
                      baseMedian={row.p50}
                      formatValue={(k, v) => formatAssumption(ECONOMIC[k], v)}
                      summary={sim.sensitivity.tornado
                        .slice(0, 3)
                        .map((t) => `${t.label}: from ${moneySigned(t.atLow.median)} to ${moneySigned(t.atHigh.median)}`)
                        .join('. ')}
                    />
                    {sim.sensitivityPending && <p class="updating">Updating…</p>}
                  </>
                ) : (
                  <p class="updating">Working out which assumptions matter most…</p>
                )}
              </section>

              <section class="result-section card" id="assumptions">
                <h2>Assumptions behind this result</h2>
                <p class="section-lede">
                  Every number the simulation relies on. Change any of them and the results update. Values marked
                  “Unverified” are widely quoted figures we couldn’t check against the original source.
                </p>
                <AssumptionsPanel
                  set={ECONOMIC}
                  keys={assumptionKeys}
                  overrides={state.overrides}
                  onChange={(key, value) =>
                    setState((s) => {
                      const overrides = { ...s.overrides };
                      if (value === undefined || value === ECONOMIC[key].value) delete overrides[key];
                      else overrides[key] = value;
                      return { ...s, overrides };
                    })
                  }
                  onResetAll={() => setState((s) => ({ ...s, overrides: {} }))}
                />
                <TaxRulesUsed startDate={startDate} />
              </section>

              <section class="result-section card">
                <h2>What this includes, and what it doesn’t</h2>
                <ul>
                  <li>Both options spend exactly the same each month. Only where the spare cash goes differs.</li>
                  <li>
                    Your home’s value is left out because it’s the same either way. Net worth here is investments minus
                    what you owe.
                  </li>
                  <li>
                    When your fix ends, you remortgage at simulated Bank Rate plus a margin, onto new fixes of the length
                    in the assumptions. The overpayer keeps the same monthly payment and takes a shorter term.
                  </li>
                  <li>
                    Not included: early repayment charges (we never overpay beyond the allowance), lower rates for a
                    lower loan-to-value, changes to your income, and the comfort of being mortgage-free.
                  </li>
                  <li>Spare cash stays the same in pounds each month. Results are converted to today’s money using each future’s inflation.</li>
                  <li>
                    Investments are valued as if sold, after any tax due. ISAs are tax-free; anything above the allowance
                    is taxed at your band’s rates for dividends, interest and capital gains.
                  </li>
                </ul>
                <p>
                  <a href="/how-it-works/">How the simulation works</a> · <a href="/sources/">All sources</a>
                </p>
              </section>

              <div class="share card">
                <div>
                  <strong>Save or share this result.</strong> The link contains your inputs and the random seed, so it
                  reproduces exactly these numbers. Nothing is stored anywhere else.
                </div>
                <div class="share-actions">
                  <CopyLink />
                  <button
                    type="button"
                    class="btn"
                    onClick={() => setState((s) => ({ ...s, seed: Math.floor(Math.random() * 4_294_967_295) }))}
                  >
                    Reshuffle the futures
                  </button>
                </div>
              </div>

              <p class="not-advice">
                <strong>This is an illustration, not advice.</strong> It shows what could happen under the assumptions
                above, which may not suit you. It doesn’t know about your job security, emergency savings, other debts
                or pensions. If you’re unsure, a regulated financial adviser can look at your whole situation.
              </p>
            </>
          )}
          {sim.error && <p class="error" role="alert">Something went wrong: {sim.error}</p>}
        </section>
      </div>
    </div>
  );
}

function DiffTable({ main }: { main: MortgageVsIsaSummary }) {
  const csv = () => {
    const lines = ['year,p10,p25,median,p75,p90,chance_investing_ahead'];
    for (const r of main.diff) lines.push([r.year, r.p10, r.p25, r.p50, r.p75, r.p90, r.probPositive].map((v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v)).join(','));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'richcalc-overpay-or-invest.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <details class="show-data">
      <summary>Show the numbers as a table</summary>
      <div class="table-scroll">
        <table class="data">
          <caption class="sr-only">Investing minus overpaying, in today’s money, by year</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Worst 10%</th>
              <th scope="col">25th</th>
              <th scope="col">Median</th>
              <th scope="col">75th</th>
              <th scope="col">Best 10%</th>
              <th scope="col">Chance investing ahead</th>
            </tr>
          </thead>
          <tbody>
            {main.diff.map((r) => (
              <tr key={r.year}>
                <th scope="row">{r.year}</th>
                <td>{moneySigned(r.p10)}</td>
                <td>{moneySigned(r.p25)}</td>
                <td>{moneySigned(r.p50)}</td>
                <td>{moneySigned(r.p75)}</td>
                <td>{moneySigned(r.p90)}</td>
                <td>{chance(r.probPositive)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" class="btn" onClick={csv}>
        Download CSV
      </button>
    </details>
  );
}

function TaxRulesUsed({ startDate }: { startDate: string }) {
  const now = rulesFor(`${startDate}-15`);
  const later = rulesFor('2027-04-06');
  const items = [
    { label: 'ISA allowance per person', value: money(now.isa.overallAllowance.value), s: now.isa.overallAllowance },
    { label: 'Cash ISA limit for under-65s from 6 April 2027', value: money(later.isa.cashCapUnder65.value ?? 0), s: later.isa.cashCapUnder65 },
    {
      label: 'Dividend tax (basic / higher / additional)',
      value: Object.values(now.savingsAndDividends.dividendRates.value).map((v) => pct(v)).join(' / '),
      s: now.savingsAndDividends.dividendRates,
    },
    { label: 'Dividend allowance', value: money(now.savingsAndDividends.dividendAllowance.value), s: now.savingsAndDividends.dividendAllowance },
    {
      label: 'Savings interest tax from April 2027 (basic / higher / additional)',
      value: Object.values(later.savingsAndDividends.savingsRates.value).map((v) => pct(v)).join(' / '),
      s: later.savingsAndDividends.savingsRates,
    },
    { label: 'Capital gains tax (basic / higher)', value: Object.values(now.capitalGains.rates.value).map((v) => pct(v)).join(' / '), s: now.capitalGains.rates },
    { label: 'Capital gains annual exempt amount', value: money(now.capitalGains.annualExemptAmount.value), s: now.capitalGains.annualExemptAmount },
  ];
  return (
    <details class="assumption-group">
      <summary>
        <h3>Tax rules used</h3>
        <span class="group-values">ISA allowance {money(now.isa.overallAllowance.value)} · dividend, savings and capital gains tax for anything outside the ISA</span>
      </summary>
      <p class="muted small">
        These come from RichCalc’s {now.taxYear} rules file and aren’t editable here; they change only when the law does.
      </p>
      <ul class="rules-list">
        {items.map((i) => (
          <li key={i.label}>
            <span>{i.label}</span> <strong>{i.value}</strong> <StatusBadge status={i.s.status} />
            <div class="muted small">
              <SourceLinks a={i.s} />
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}

function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      class="btn primary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          prompt('Copy this link', location.href);
        }
      }}
    >
      <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
    </button>
  );
}

