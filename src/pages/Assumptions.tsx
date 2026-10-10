import { ECONOMIC, SHOCK_CORRELATION } from '../../assumptions/economic';
import { LATEST_RULES, SCHEDULED_CHANGES } from '../../rules';
import { ruleEntries } from '../../rules/catalogue';
import { SourceLinks, StatusBadge } from '../components/AssumptionsPanel';
import { Page } from '../components/Layout';
import { formatAssumption } from '../lib/assumptionFormat';

export function AssumptionsPage() {
  const groups = new Map<string, (typeof ECONOMIC)[string][]>();
  for (const a of Object.values(ECONOMIC)) {
    if (!groups.has(a.group)) groups.set(a.group, []);
    groups.get(a.group)!.push(a);
  }
  const rules = ruleEntries(LATEST_RULES);
  return (
    <Page current="/assumptions/">
      <div class="container">
        <header class="page-intro">
          <div class="kicker">Assumptions</div>
          <h1>Every number we rely on</h1>
          <p class="lede">
            Economic assumptions are our best estimates of the future; you can change any of them inside each tool. Tax
            rules come from official sources and change only when the law does.
          </p>
        </header>

        <h2>Economic assumptions</h2>
        {[...groups].map(([group, items]) => (
          <section key={group} class="card">
            <h3>{group}</h3>
            <div class="table-scroll">
              <table class="data catalogue">
                <thead>
                  <tr>
                    <th scope="col">Assumption</th>
                    <th scope="col">Default</th>
                    <th scope="col">Plausible range</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.key}>
                      <td>
                        <strong>{a.label}</strong>
                        <div class="small muted">{a.note}</div>
                        <div class="small muted">
                          Source: <SourceLinks a={a} />. Checked {a.verified}.
                        </div>
                      </td>
                      <td>{formatAssumption(a, a.value)}</td>
                      <td>
                        {formatAssumption(a, a.range.low)} to {formatAssumption(a, a.range.high)}
                      </td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        <p class="note">{SHOCK_CORRELATION.note}</p>

        <h2>Tax rules: {LATEST_RULES.taxYear}</h2>
        <section class="card">
          <div class="table-scroll">
            <table class="data catalogue">
              <thead>
                <tr>
                  <th scope="col">Rule</th>
                  <th scope="col">Value</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.path}>
                    <td>
                      <strong>{r.label}</strong>
                      {r.sourced.note && <div class="small muted">{r.sourced.note}</div>}
                      <div class="small muted">
                        Source: <SourceLinks a={r.sourced} />. Checked {r.sourced.verified}.
                      </div>
                    </td>
                    <td>{r.value}</td>
                    <td>
                      <StatusBadge status={r.sourced.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <h2>Announced changes we apply</h2>
        <section class="card">
          <ul>
            {SCHEDULED_CHANGES.map((c) => (
              <li key={c.summary}>
                <strong>From {new Date(`${c.effectiveFrom}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}:</strong>{' '}
                {c.summary} <StatusBadge status={c.status} />
                <div class="small muted">
                  Source: <SourceLinks a={c} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
}
