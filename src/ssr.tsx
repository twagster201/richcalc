/**
 * Server-side rendering for the static build. Each page is rendered to HTML at build time so it
 * reads well before (or without) JavaScript. The tool page also embeds a real default result,
 * computed here with the same engine the browser uses.
 */
import { renderToString } from 'preact-render-to-string';
import { mortgageVsIsaSensitivity, summariseMortgageVsIsa } from '../engine/tools/mortgageVsIsaAnalysis';
import { AboutPage } from './pages/About';
import { AssumptionsPage } from './pages/Assumptions';
import { Home } from './pages/Home';
import { HowItWorks } from './pages/HowItWorks';
import { MortgagePage } from './pages/MortgagePage';
import { PAGES } from './pages/registry';
import { SourcesPage } from './pages/Sources';
import { SITE } from './site';
import type { InitialData } from './tools/mortgage/MortgageTool';
import { assumptionValues, currentMonth, defaultState, toInputs } from './tools/mortgage/state';
import { simKey } from './tools/mortgage/useSimulation';
import { MAIN_RUNS, SENSITIVITY_RUNS } from './worker/protocol';

export interface RenderedPage {
  file: string;
  head: string;
  html: string;
  data?: string;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function head(path: string): string {
  const p = PAGES.find((x) => x.path === path)!;
  const url = `${SITE.url}${p.path}`;
  return [
    `<title>${esc(p.title)}</title>`,
    `<meta name="description" content="${esc(p.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:title" content="${esc(p.title)}">`,
    `<meta property="og:description" content="${esc(p.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="RichCalc">`,
  ].join('\n    ');
}

export function renderAll(now = new Date()): RenderedPage[] {
  const startDate = currentMonth(now);
  const state = defaultState(startDate);
  const inputs = toInputs(state.form, startDate);
  const values = assumptionValues({});
  const main = summariseMortgageVsIsa(inputs, values, { seed: state.seed, runs: MAIN_RUNS });
  const sensitivity = mortgageVsIsaSensitivity(inputs, values, { seed: state.seed, runs: SENSITIVITY_RUNS, horizonYear: state.horizon });
  const initial: InitialData = { startDate, key: simKey(inputs, values, state.seed), main, sensitivity, horizon: state.horizon };

  const json = JSON.stringify(initial).replace(/</g, '\\u003c');
  return [
    { file: 'index.html', head: head('/'), html: renderToString(<Home example={main} />) },
    { file: 'mortgage-or-isa/index.html', head: head('/mortgage-or-isa/'), html: renderToString(<MortgagePage initial={initial} />), data: json },
    { file: 'how-it-works/index.html', head: head('/how-it-works/'), html: renderToString(<HowItWorks />) },
    { file: 'assumptions/index.html', head: head('/assumptions/'), html: renderToString(<AssumptionsPage />) },
    { file: 'sources/index.html', head: head('/sources/'), html: renderToString(<SourcesPage />) },
    { file: 'about/index.html', head: head('/about/'), html: renderToString(<AboutPage />) },
  ];
}
