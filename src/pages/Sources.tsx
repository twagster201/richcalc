import { SOURCES } from '../../rules/sources';
import { Page } from '../components/Layout';

export function SourcesPage() {
  const list = Object.entries(SOURCES).sort((a, b) => a[1].publisher.localeCompare(b[1].publisher));
  return (
    <Page current="/sources/">
      <div class="container prose">
        <header class="page-intro">
          <div class="kicker">Sources</div>
          <h1>Where the numbers come from</h1>
          <p class="lede">
            We use official sources wherever possible: GOV.UK, HMRC, legislation.gov.uk, the Scottish and Welsh
            Governments, the ONS and the Bank of England.
          </p>
        </header>
        <ul class="sources-list">
          {list.map(([id, s]) => (
            <li key={id}>
              <a href={s.url} rel="noopener" target="_blank">
                {s.title}
              </a>
              <div class="small muted">
                {s.publisher} · {s.kind === 'primary' ? 'Primary source' : s.kind === 'data' ? 'Data' : 'Secondary source'} · accessed {s.accessed}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
