/**
 * Overpay the mortgage (option A) or invest the same money in an ISA (option B)?
 *
 * Both households have exactly the same money going out each month: the normal mortgage payment
 * plus the spare cash. A sends the spare cash to the mortgage, up to the overpayment allowance
 * during fixed deals; anything above the allowance, and everything once the mortgage is cleared,
 * goes into the ISA. B pays the normal mortgage and puts the spare cash in the ISA.
 *
 * When the overpaying household remortgages, it keeps paying the same monthly amount as the
 * other household and takes a shorter term, rather than letting its payment fall. That is what
 * most overpayers do, and it means only the spare cash counts against the overpayment allowance.
 *
 * Both face the same simulated economy: the same remortgage rates, inflation and returns. Net
 * worth here is investments minus the mortgage; the home's value is the same in both and cancels.
 */
import { rulesFor } from '../../rules';
import type { RuleSet } from '../../rules/schema';
import { RISK_MIXES, type RiskLevel } from '../../assumptions/economic';
import type { AssumptionValues } from '../../assumptions/types';
import { addMonths, isoMidMonth, monthsBetween } from '../core/dates';
import type { EsgPaths } from '../sim/esg';
import { monthlyPayment } from '../sim/mortgage';

export type TaxBand = 'basic' | 'higher' | 'additional';

export interface MortgageVsIsaInputs {
  /** First simulated month, 'YYYY-MM' (normally the current month). */
  startDate: string;
  balance: number;
  /** Current mortgage interest rate, as a fraction. */
  rate: number;
  termYears: number;
  /** 'YYYY-MM' the current fixed deal ends, or null if on a variable/tracker rate. */
  fixEnd: string | null;
  /** Spare cash per month, in pounds. */
  spare: number;
  isaType: 'ss' | 'cash';
  risk: RiskLevel;
  taxBand: TaxBand;
  /** People whose ISA allowances can be used (1 or 2). */
  people: 1 | 2;
  under65: boolean;
}

export interface MortgageVsIsaResult {
  runs: number;
  years: number;
  /** Net worth of "invest" minus "overpay", today's money, [run][year] at each year end. */
  diffReal: Float64Array;
  /** Money you could get at within weeks (ISA + other investments after tax), today's money. */
  accessibleOverpayReal: Float64Array;
  accessibleInvestReal: Float64Array;
  /** Years until the overpaying household is mortgage-free, per run. */
  mortgageFreeYearsOverpay: Float64Array;
  /** Per run: pounds that could not be overpaid because of the allowance and were invested instead. */
  divertedByAllowance: Float64Array;
  /** Per run: pounds that went outside the ISA because of the ISA allowance (either option). */
  overflowOutsideIsa: Float64Array;
  startingPayment: number;
  termMonths: number;
}

/** Number of simulated years needed for these inputs. */
export function yearsNeeded(inputs: MortgageVsIsaInputs): number {
  return Math.max(1, Math.ceil(Math.round(inputs.termYears * 12) / 12));
}

interface YearRules {
  isaCapPerPerson: number;
  dividendRate: number;
  dividendAllowance: number;
  savingsRate: number;
  psa: number;
  aea: number;
  cgtRate: number;
}

function yearRules(r: RuleSet, inputs: MortgageVsIsaInputs): YearRules {
  const band = inputs.taxBand;
  const overall = r.isa.overallAllowance.value;
  const cashCap = r.isa.cashCapUnder65.value;
  const isaCapPerPerson = inputs.isaType === 'cash' && inputs.under65 && cashCap !== null ? Math.min(overall, cashCap) : overall;
  return {
    isaCapPerPerson,
    dividendRate: r.savingsAndDividends.dividendRates.value[band],
    dividendAllowance: r.savingsAndDividends.dividendAllowance.value,
    savingsRate: r.savingsAndDividends.savingsRates.value[band],
    psa: r.savingsAndDividends.personalSavingsAllowance.value[band],
    aea: r.capitalGains.annualExemptAmount.value,
    cgtRate: band === 'basic' ? r.capitalGains.rates.value.basic : r.capitalGains.rates.value.higher,
  };
}

interface Pot {
  isa: number;
  gia: number;
  giaBasis: number;
  isaUsed: number;
  income: number; // dividends or interest earned outside the ISA this tax year
}

function newPot(): Pot {
  return { isa: 0, gia: 0, giaBasis: 0, isaUsed: 0, income: 0 };
}

export function runMortgageVsIsa(inputs: MortgageVsIsaInputs, a: AssumptionValues, paths: EsgPaths): MortgageVsIsaResult {
  const N = Math.round(inputs.termYears * 12);
  const years = yearsNeeded(inputs);
  if (paths.years < years) throw new Error(`Scenario paths cover ${paths.years} years; need ${years}`);
  const runs = paths.runs;

  const people = inputs.people;
  const spread = a['mort.spread'];
  const refixMonths = Math.max(1, Math.round(a['mort.refixYears'])) * 12;
  const allowancePct = a['mort.overpayAllowance'];
  const fees = a['fees'];
  const cashSpread = a['cash.spread'];
  const divYield = a['gia.dividendYield'];
  const rateStart = a['rate.start'];
  const equityShare = RISK_MIXES[inputs.risk].equity;
  const isCash = inputs.isaType === 'cash';

  // Pre-resolve the rules for each simulated month (they change only at tax-year boundaries).
  const monthRules: YearRules[] = new Array(N);
  let cached: { key: string; yr: YearRules } | null = null;
  for (let m = 0; m < N; m++) {
    const r = rulesFor(isoMidMonth(inputs.startDate, m));
    const key = `${r.id}|${r.isa.cashCapUnder65.value}|${r.savingsAndDividends.savingsRates.value.basic}`;
    if (!cached || cached.key !== key) cached = { key, yr: yearRules(r, inputs) };
    monthRules[m] = cached.yr;
  }
  const isApril = new Uint8Array(N);
  for (let m = 0; m < N; m++) isApril[m] = addMonths(inputs.startDate, m).month === 4 ? 1 : 0;

  const variable = inputs.fixEnd === null;
  const fixEndMonth = variable ? Infinity : Math.max(0, monthsBetween(inputs.startDate, inputs.fixEnd as string));
  const startingPayment = monthlyPayment(inputs.balance, inputs.rate, N);

  const diffReal = new Float64Array(runs * years);
  const accA = new Float64Array(runs * years);
  const accB = new Float64Array(runs * years);
  const freeA = new Float64Array(runs);
  const diverted = new Float64Array(runs);
  const overflow = new Float64Array(runs);

  const A = newPot();
  const B = newPot();

  const contribute = (pot: Pot, amount: number, yr: YearRules): number => {
    if (amount <= 0) return 0;
    const room = Math.max(0, yr.isaCapPerPerson * people - pot.isaUsed);
    const toIsa = Math.min(amount, room);
    pot.isa += toIsa;
    pot.isaUsed += toIsa;
    const rest = amount - toIsa;
    pot.gia += rest;
    pot.giaBasis += rest;
    return rest;
  };

  const settleTaxYear = (pot: Pot, yr: YearRules) => {
    if (pot.income > 0) {
      const tax = isCash
        ? Math.max(0, pot.income - yr.psa * people) * yr.savingsRate
        : Math.max(0, pot.income - yr.dividendAllowance * people) * yr.dividendRate;
      pot.gia = Math.max(0, pot.gia - tax);
      // Reinvested dividends add to the cost of the holding for capital gains purposes.
      if (!isCash) pot.giaBasis += pot.income - tax;
    }
    pot.income = 0;
    pot.isaUsed = 0;
  };

  const cgtIfSold = (pot: Pot, yr: YearRules) =>
    isCash ? 0 : Math.max(0, pot.gia - pot.giaBasis - yr.aea * people) * yr.cgtRate;

  for (let run = 0; run < runs; run++) {
    Object.assign(A, newPot());
    Object.assign(B, newPot());
    let balA = inputs.balance;
    let balB = inputs.balance;
    let rate = inputs.rate;
    let payB = startingPayment;
    let nextRefix = fixEndMonth;
    let fixed = !variable;
    let allowanceLeft = fixed ? allowancePct * balA : Infinity;
    let allowanceReset = 12;
    let price = 1;
    let freeAt = NaN;
    let divertedSum = 0;
    let overflowSum = 0;
    let growth = 1;
    let infMonthly = 1;

    for (let m = 0; m < N; m++) {
      const y = Math.floor(m / 12);
      const p = run * paths.years + y;
      const yr = monthRules[m];

      if (m % 12 === 0) {
        const infl = paths.inflation[p];
        infMonthly = Math.pow(1 + infl, 1 / 12);
        if (isCash) {
          growth = Math.pow(1 + Math.max(0, paths.bankRate[p] + cashSpread), 1 / 12);
        } else {
          const fe = Math.exp(paths.equityLogReal[p]) * (1 + infl);
          const fb = Math.exp(paths.bondLogReal[p]) * (1 + infl);
          growth = Math.pow((equityShare * fe + (1 - equityShare) * fb) * (1 - fees), 1 / 12);
        }
        if (variable) {
          // A variable or tracker rate moves one-for-one with Bank Rate.
          rate = Math.max(0, inputs.rate + paths.bankRate[p] - rateStart);
          payB = monthlyPayment(balB, rate, N - m);
        }
      }

      if (m > 0 && isApril[m]) {
        settleTaxYear(A, monthRules[m - 1]);
        settleTaxYear(B, monthRules[m - 1]);
      }

      if (m === nextRefix) {
        rate = Math.max(0, paths.bankRate[p] + spread);
        payB = monthlyPayment(balB, rate, N - m);
        nextRefix = m + refixMonths;
        fixed = true;
        allowanceLeft = allowancePct * balA;
        allowanceReset = m + 12;
      } else if (fixed && m === allowanceReset) {
        allowanceLeft = allowancePct * balA;
        allowanceReset = m + 12;
      }

      // Investments grow through the month, then this month's money goes in.
      for (const pot of [A, B]) {
        const before = pot.gia;
        pot.isa *= growth;
        pot.gia *= growth;
        if (pot.gia > 0) pot.income += isCash ? pot.gia - before : before * (divYield / 12);
      }
      price *= infMonthly;

      // Option B: contractual payment, spare cash invested.
      const intB = (balB * rate) / 12;
      const dueB = Math.min(payB, balB + intB);
      balB = balB + intB - dueB;
      const budget = dueB + inputs.spare;
      overflowSum += contribute(B, budget - dueB, yr);

      // Option A: contractual payment, then overpay up to the allowance, invest the rest.
      const intA = (balA * rate) / 12;
      const dueA = Math.min(payB, balA + intA); // same payment as B, shorter term
      balA = balA + intA - dueA;
      let extra = budget - dueA;
      if (balA > 0) {
        const over = Math.min(extra, balA, allowanceLeft);
        balA -= over;
        allowanceLeft -= over;
        extra -= over;
        if (balA > 0.005 && extra > 0) divertedSum += extra;
      }
      if (balA <= 0.005) {
        balA = 0;
        if (Number.isNaN(freeAt)) freeAt = (m + 1) / 12;
      }
      overflowSum += contribute(A, extra, yr);

      const isYearEnd = m % 12 === 11 || m === N - 1;
      if (isYearEnd) {
        const idx = run * years + y;
        const liquidA = A.isa + A.gia - cgtIfSold(A, yr);
        const liquidB = B.isa + B.gia - cgtIfSold(B, yr);
        diffReal[idx] = (liquidB - balB - (liquidA - balA)) / price;
        accA[idx] = liquidA / price;
        accB[idx] = liquidB / price;
      }
    }
    freeA[run] = Number.isNaN(freeAt) ? N / 12 : freeAt;
    diverted[run] = divertedSum;
    overflow[run] = overflowSum;
  }

  return {
    runs,
    years,
    diffReal,
    accessibleOverpayReal: accA,
    accessibleInvestReal: accB,
    mortgageFreeYearsOverpay: freeA,
    divertedByAllowance: diverted,
    overflowOutsideIsa: overflow,
    startingPayment,
    termMonths: N,
  };
}
