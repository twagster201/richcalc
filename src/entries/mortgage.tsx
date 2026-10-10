import { hydrate } from 'preact';
import { MortgagePage } from '../pages/MortgagePage';
import type { InitialData } from '../tools/mortgage/MortgageTool';

const el = document.getElementById('initial-data');
const initial = JSON.parse(el?.textContent ?? 'null') as InitialData;
hydrate(<MortgagePage initial={initial} />, document.getElementById('app')!);
