import type { MortgageVsIsaSummary } from '../../engine/tools/mortgageVsIsaAnalysis';
import { FanChart } from '../components/charts/FanChart';
import { Page } from '../components/Layout';
import { chance } from '../lib/format';

const TOOLS = [
  {
    href: '/mortgage-or-isa/',
    title: 'Overpay the mortgage or invest?',
    text: 'Compare overpaying with a stocks and shares or cash ISA across thousands of futures for rates, inflation and markets.',
    ready: true,
  },
  {
    href: null,
    title: 'Salary sacrifice vs take-home pay',
    text: 'What each £1 in your pension really costs you, including the NI changes due in April 2029.',
    ready: false,
  },
  {
    href: null,
    title: 'The £100k tax trap',
    text: 'Marginal rates at every income, the childcare cliffs, and how much pension contribution gets you back out.',
    ready: false,
  },
  {
    href: null,
    title: 'Rent or buy?',
    text: 'Net worth either way, and the break-even year as a range of likely years rather than one confident number.',
    ready: false,
  },
];

export function Home({ example }: { example: MortgageVsIsaSummary }) {
  const y10 = example.diff[9];
  return (
    <Page current="/">
      <div class="container">
        <section class="hero">
          <div>
            <div class="kicker">UK personal finance · 2026/27 rules</div>
            <h1>Money decisions, with the uncertainty left in.</h1>
            <p class="lede">
              Most calculators give you one confident number and hide how they got it. RichCalc shows the range of
              likely outcomes, how often each option comes out ahead, and every assumption behind the result, all of
              which you can change.
            </p>
            <p>
              <a class="btn primary" href="/mortgage-or-isa/">Try: overpay or invest?</a>{' '}
              <a class="btn" href="/how-it-works/">How it works</a>
            </p>
          </div>
          <div class="card">
            <FanChart
              id="home-fan"
              interactive={false}
              initialWidth={440}
              data={example.diff}
              aboveLabel="Investing ahead"
              belowLabel="Overpaying ahead"
              selectedYear={10}
              probabilityLabel="Chance investing ahead"
              summary={`Example fan chart: investing comes out ahead of overpaying in ${chance(y10.probPositive)} of simulated futures after 10 years.`}
            />
            <p class="small muted">
              An example: £300 a month on a £200,000, 4.5% mortgage. After 10 years, investing is ahead in{' '}
              {chance(y10.probPositive)} of 5,000 simulated futures, but the fan shows how wide the range is.
            </p>
          </div>
        </section>

        <h2>Tools</h2>
        <div class="tools-grid">
          {TOOLS.map((t) =>
            t.ready && t.href ? (
              <a key={t.title} class="card tool-card" href={t.href}>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </a>
            ) : (
              <div key={t.title} class="card tool-card">
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <span class="soon">Coming soon</span>
              </div>
            ),
          )}
        </div>

        <div class="principles">
          <div>
            <h3>A range, not a number</h3>
            <p>
              Thousands of simulated futures show what’s likely, what’s possible, and how often each option wins.
            </p>
          </div>
          <div>
            <h3>Every assumption visible</h3>
            <p>
              Each rate, threshold and forecast is listed with its source and the reason we chose it. You can change any
              of them.
            </p>
          </div>
          <div>
            <h3>What would change the answer</h3>
            <p>
              Each tool shows which assumptions matter most and the value at which the answer flips.
            </p>
          </div>
        </div>
      </div>
    </Page>
  );
}
