import { Page } from '../components/Layout';
import { SITE } from '../site';

export function AboutPage() {
  return (
    <Page current="/about/">
      <div class="container prose">
        <header class="page-intro">
          <div class="kicker">About</div>
          <h1>About RichCalc</h1>
          <p class="lede">
            Honest calculators for UK money decisions: a range of outcomes instead of false precision, with every
            assumption on the table.
          </p>
        </header>

        <h2>Why</h2>
        <p>
          Most online calculators take a guess about the future (a 5% return, a 3% mortgage rate) and give you one
          confident number. Real decisions are made under uncertainty. RichCalc shows how often each option comes out
          ahead, by how much, and which assumptions decide it, so you can judge the trade-off yourself.
        </p>

        <h2>This isn’t financial advice</h2>
        <p>
          Results are illustrations based on the assumptions shown. They can’t take account of everything about your
          situation: your job security, emergency savings, other debts, pensions, plans or attitude to risk. RichCalc
          doesn’t recommend products or tell you what to do. If you want personal advice, a regulated financial adviser
          can help; <a href="https://www.moneyhelper.org.uk/" rel="noopener" target="_blank">MoneyHelper</a> offers free,
          impartial guidance.
        </p>

        <h2>Privacy</h2>
        <ul>
          <li>No cookies, no tracking scripts, no account.</li>
          <li>Your numbers never leave your device. Every calculation runs in your browser.</li>
          <li>
            Your inputs are kept in the page address (URL) so you can bookmark or share a result. Anyone you share the
            link with will see those inputs.
          </li>
          <li>
            We count page views using our host’s server logs, without cookies or any script in your browser, so we can
            see which tools are used.
          </li>
        </ul>

        <h2>Keeping it accurate</h2>
        <p>
          Tax rules are updated each April and after each Budget. Every figure shows when it was last checked against
          its source. If you spot something wrong, we want to know.
          {SITE.contactEmail && (
            <>
              {' '}Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
            </>
          )}
        </p>
      </div>
    </Page>
  );
}
