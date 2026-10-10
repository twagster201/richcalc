import { ECONOMIC, EQUITY_TAIL_DF, RISK_MIXES, SHOCK_CORRELATION } from '../../assumptions/economic';
import { Page } from '../components/Layout';
import { formatAssumption } from '../lib/assumptionFormat';

const f = (k: string) => formatAssumption(ECONOMIC[k], ECONOMIC[k].value);

export function HowItWorks() {
  return (
    <Page current="/how-it-works/">
      <div class="container prose">
        <header class="page-intro">
          <div class="kicker">Method</div>
          <h1>How RichCalc works</h1>
          <p class="lede">
            Nobody knows what interest rates, inflation or markets will do. So instead of guessing one future, RichCalc
            simulates thousands of plausible ones and shows you the spread.
          </p>
        </header>

        <h2>Simulating many futures</h2>
        <p>
          Each tool runs your numbers through 5,000 simulated futures (a “Monte Carlo” simulation). In each one, the
          economy follows a different path, year by year: some futures have high inflation, some have a market crash
          early on, some have cheap mortgages for decades. The results show how your decision plays out across all of
          them.
        </p>
        <p>
          The simulations are <strong>seeded</strong>: the same inputs and seed always give exactly the same numbers,
          so a shared link reproduces the result exactly. “Reshuffle the futures” picks a new seed. If the answer
          changes a lot when you reshuffle, it’s genuinely uncertain.
        </p>
        <p>
          Both options in a comparison face <strong>the same futures</strong>. If shares crash in year 3 of future
          #1,234, they crash for both. That way, differences come from the decision, not from luck.
        </p>

        <h2>What gets simulated, in plain English</h2>
        <h3>Inflation</h3>
        <p>
          Starts at {f('infl.start')} for the next year, in line with the Bank of England’s latest projections, then
          drifts back towards {f('infl.longRun')}. Each year there’s a surprise: about two years in three land within{' '}
          {f('infl.vol')} of the expected path. Surprises tend to last (a high year is usually followed by another
          above-target year).
        </p>
        <h3>Bank Rate, mortgages and cash</h3>
        <p>
          Bank Rate starts at {f('rate.start')} and drifts towards long-run inflation plus {f('rate.longRunReal')} (in
          line with what financial markets expect). It moves gradually, rises when inflation surprises upwards, and
          has its own surprises too, so some futures see sharp rate rises like 2022. When a fixed mortgage deal ends,
          the new rate is the simulated Bank Rate plus {f('mort.spread')}. Cash ISAs pay about Bank Rate.
        </p>
        <h3>Shares and bonds</h3>
        <p>
          A global share fund grows by a typical {f('eq.return')} a year after inflation, but individual years vary a
          lot: about two years in three are within {f('eq.vol')} either side. We use a “fat-tailed” distribution (a
          Student-t with {EQUITY_TAIL_DF} degrees of freedom) so that crashes happen more often than a bell curve
          would suggest. In the model, a fall of more than 25% after inflation happens in roughly 1 year in 40.
          Bonds grow by a typical {f('bond.return')} a year with smaller swings ({f('bond.vol')}). Fees of{' '}
          {f('fees')} a year come off.
        </p>
        <p>
          The investment mixes are{' '}
          {Object.values(RISK_MIXES)
            .map((r) => r.label.toLowerCase())
            .join('; ')}
          , with the rest in bonds. They’re rebalanced every year.
        </p>
        <h3>How things move together</h3>
        <p>{SHOCK_CORRELATION.note}</p>

        <h2>Reading the charts</h2>
        <p>
          <strong>Fan charts</strong> show the difference between two options over time. The dark middle band holds
          half of all futures; the lighter band holds 80%. The line is the median: half of futures do better, half
          worse. Where the fan crosses zero, either option could come out ahead.
        </p>
        <p>
          <strong>Dot plots</strong> show 50 dots for a single year. Each dot stands for 2% of futures. Counting dots
          is a reliable way to judge chances: if 35 of 50 dots are on one side, that side wins in about 70% of
          futures. Research on how people read uncertainty (Kay and colleagues, 2016; Fernandes and colleagues, 2018)
          found this works better than shaded curves.
        </p>

        <h2>What changes the answer</h2>
        <p>
          For the assumptions that matter most, each tool re-runs the simulation with the assumption set to the low and
          high end of its plausible range, keeping the same futures, to see how much the middle outcome moves. It then
          searches for the value at which the answer flips, for example “investing stays ahead unless share returns
          fall below 2.7%”.
        </p>

        <h2>Rules and assumptions</h2>
        <p>
          Tax rates, thresholds and allowances come from one rules file for each tax year, with a source for every
          number, and announced changes applied from their start dates. Economic assumptions are listed separately,
          each with a source, a status and the reason for the value. See <a href="/assumptions/">all assumptions</a>{' '}
          and <a href="/sources/">all sources</a>.
        </p>

        <h2>Limits</h2>
        <ul>
          <li>Models are simplifications. Real markets can do things no model includes.</li>
          <li>
            Each year is independent of the last for shares and bonds. In reality, very long runs of good or bad years
            may be a little more or less common.
          </li>
          <li>
            Tax rules are held at announced values. The model doesn’t guess future Budgets beyond what has been
            announced.
          </li>
          <li>Results are illustrations, not advice. They don’t know your whole situation.</li>
        </ul>
      </div>
    </Page>
  );
}
