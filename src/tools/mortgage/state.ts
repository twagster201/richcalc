import { RISK_MIXES, type RiskLevel } from '../../../assumptions/economic';
import { ECONOMIC } from '../../../assumptions/economic';
import type { AssumptionValues } from '../../../assumptions/types';
import { addMonths } from '../../../engine/core/dates';
import type { MortgageVsIsaInputs, TaxBand } from '../../../engine/tools/mortgageVsIsa';
import { decodeOverrides, encodeOverrides, num, oneOf, URL_VERSION } from '../../state/url';

export interface MortgageForm {
  balance: number;
  /** Interest rate in percent, e.g. 4.5. */
  rate: number;
  term: number;
  /** 'YYYY-MM' when the fixed deal ends, or 'none' for a variable or tracker rate. */
  fixEnd: string;
  spare: number;
  isa: 'ss' | 'cash';
  risk: RiskLevel;
  band: TaxBand;
  people: 1 | 2;
  under65: boolean;
}

export interface MortgageState {
  form: MortgageForm;
  overrides: AssumptionValues;
  horizon: number;
  seed: number;
}

export const RISKS = Object.keys(RISK_MIXES) as RiskLevel[];
export const BANDS: TaxBand[] = ['basic', 'higher', 'additional'];
export const DEFAULT_SEED = 1;

export function currentMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function defaultFixEnd(startDate: string): string {
  const { year, month } = addMonths(startDate, 24);
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function defaultForm(startDate: string): MortgageForm {
  return {
    balance: 200_000,
    rate: 4.5,
    term: 22,
    fixEnd: defaultFixEnd(startDate),
    spare: 300,
    isa: 'ss',
    risk: 'adventurous',
    band: 'basic',
    people: 2,
    under65: true,
  };
}

export function defaultHorizon(term: number): number {
  return Math.max(1, Math.min(10, Math.ceil(term)));
}

export function defaultState(startDate: string): MortgageState {
  const form = defaultForm(startDate);
  return { form, overrides: {}, horizon: defaultHorizon(form.term), seed: DEFAULT_SEED };
}

export function toInputs(form: MortgageForm, startDate: string): MortgageVsIsaInputs {
  return {
    startDate,
    balance: form.balance,
    rate: form.rate / 100,
    termYears: form.term,
    fixEnd: form.fixEnd === 'none' ? null : form.fixEnd,
    spare: form.spare,
    isaType: form.isa,
    risk: form.risk,
    taxBand: form.band,
    people: form.people,
    under65: form.under65,
  };
}

export function decodeState(search: string, startDate: string): MortgageState {
  const p = new URLSearchParams(search);
  const d = defaultForm(startDate);
  const fixRaw = p.get('fix');
  const fixEnd = fixRaw === 'none' || (fixRaw !== null && /^\d{4}-\d{2}$/.test(fixRaw)) ? fixRaw : d.fixEnd;
  const form: MortgageForm = {
    balance: num(p, 'bal', d.balance, 1_000, 5_000_000),
    rate: num(p, 'rate', d.rate, 0, 20),
    term: num(p, 'term', d.term, 1, 40),
    fixEnd,
    spare: num(p, 'spare', d.spare, 0, 50_000),
    isa: oneOf(p, 'isa', ['ss', 'cash'] as const, d.isa),
    risk: oneOf(p, 'risk', RISKS, d.risk),
    band: oneOf(p, 'band', BANDS, d.band),
    people: p.get('people') === '1' ? 1 : 2,
    under65: p.get('u65') !== '0',
  };
  return {
    form,
    overrides: decodeOverrides(p, ECONOMIC),
    horizon: Math.round(num(p, 'h', defaultHorizon(form.term), 1, Math.ceil(form.term))),
    seed: Math.round(num(p, 'seed', DEFAULT_SEED, 0, 4_294_967_295)),
  };
}

export function encodeState(s: MortgageState, startDate: string): string {
  const d = defaultForm(startDate);
  const p = new URLSearchParams();
  const f = s.form;
  const set = (k: string, v: string | number, dv: string | number) => {
    if (v !== dv) p.set(k, String(v));
  };
  set('bal', f.balance, d.balance);
  set('rate', f.rate, d.rate);
  set('term', f.term, d.term);
  set('fix', f.fixEnd, d.fixEnd);
  set('spare', f.spare, d.spare);
  set('isa', f.isa, d.isa);
  set('risk', f.risk, d.risk);
  set('band', f.band, d.band);
  set('people', f.people, d.people);
  set('u65', f.under65 ? 1 : 0, 1);
  encodeOverrides(p, ECONOMIC, s.overrides);
  set('h', s.horizon, defaultHorizon(f.term));
  set('seed', s.seed, DEFAULT_SEED);
  if ([...p.keys()].length > 0) p.set('v', URL_VERSION);
  const q = p.toString();
  return q ? `?${q}` : '';
}

export function assumptionValues(overrides: AssumptionValues): AssumptionValues {
  const out: AssumptionValues = {};
  for (const a of Object.values(ECONOMIC)) out[a.key] = overrides[a.key] ?? a.value;
  return out;
}
