/** Plain-English sentences generated from the results. Illustrations, never recommendations. */
import type { MortgageVsIsaSensitivity, MortgageVsIsaSummary } from '../../../engine/tools/mortgageVsIsaAnalysis';
import type { FlipPoint } from '../../../engine/analysis/sensitivity';
import { ECONOMIC } from '../../../assumptions/economic';
import { chance, inTen, money, years } from '../../lib/format';
import { formatAssumption } from '../../lib/assumptionFormat';
import type { MortgageForm } from './state';

export const A_NAME = 'Overpaying';
export const B_NAME = 'Investing';

export function headline(s: MortgageVsIsaSummary, horizon: number): { lead: string; detail: string } {
  const row = s.diff[horizon - 1];
  const p = row.probPositive;
  const after = `after ${years(horizon)}`;
  const lead =
    Math.abs(p - 0.5) < 0.05
      ? `It’s close to a coin toss: ${after}, investing comes out ahead in ${chance(p)} of simulated futures.`
      : p > 0.5
        ? `In ${inTen(p)} simulated futures, investing ends up ahead of overpaying ${after}.`
        : `In ${inTen(1 - p)} simulated futures, overpaying ends up ahead of investing ${after}.`;
  const side = (v: number) => (v >= 0 ? `investing ahead by ${money(v)}` : `overpaying ahead by ${money(-v)}`);
  const low =
    row.p10 < 0
      ? `in 1 future in 10, overpaying comes out at least ${money(-row.p10)} ahead`
      : `even in the worst 1 future in 10, investing is still at least ${money(row.p10)} ahead`;
  const high =
    row.p90 > 0
      ? `in another 1 in 10, investing comes out at least ${money(row.p90)} ahead`
      : `even in the best 1 in 10 for investing, overpaying is still at least ${money(-row.p90)} ahead`;
  const detail = `The middle outcome is ${side(row.p50)}, in today’s money. The range is wide: ${low}; ${high}.`;
  return { lead, detail };
}

export function considerations(s: MortgageVsIsaSummary, form: MortgageForm, horizon: number): string[] {
  const out: string[] = [];
  const free = s.mortgageFreeOverpay;
  if (form.spare > 0 && free.p50 < free.contractualYears - 0.05) {
    out.push(
      `Overpaying ${money(form.spare)} a month would clear the mortgage in about ${years(free.p50)} rather than ${years(free.contractualYears)}` +
        (free.p90 - free.p10 >= 0.5 ? ` (between ${years(free.p10)} and ${years(free.p90)} depending on future rates).` : '.'),
    );
  }
  const h = horizon - 1;
  const liquidB = s.accessibleInvest[h].p50;
  const liquidA = s.accessibleOverpay[h].p50;
  out.push(
    `Money you could get at quickly after ${years(horizon)} (typical future, today’s money): about ${money(liquidB)} if you invest, ` +
      `${money(liquidA)} if you overpay. Overpayments are locked in your home until you sell or remortgage, so investing keeps more options open if your income drops.`,
  );
  if (s.allowance.shareOfRunsCapped > 0.05 && s.allowance.medianDiverted > 50) {
    out.push(
      `Lenders usually cap penalty-free overpayments at a share of the balance each year. Once your balance is small, that cap ` +
        `can’t take the whole ${money(form.spare)} a month, so the rest is invested instead: typically ${money(s.allowance.medianDiverted)} over the whole mortgage.`,
    );
  }
  if (s.overflow.shareOfRunsOverflowing > 0.05) {
    out.push(
      `In ${chance(s.overflow.shareOfRunsOverflowing)} of futures more money went in than the ISA allowance allows, so the excess went into an ordinary, taxable account (taxed at your ${form.band} rate).`,
    );
  }
  out.push(`Your current monthly payment works out at about ${money(s.startingPayment)}. Both options keep paying this; only the spare ${money(form.spare)} is treated differently.`);
  return out;
}

/** Flip points are estimates, so show them to one decimal place. */
function flipValue(key: string, v: number): string {
  const a = ECONOMIC[key];
  if (a.unit === 'percent') return `${(v * 100).toFixed(1).replace('-', '−')}%`;
  if (a.unit === 'pp') return `${(v * 100).toFixed(1).replace('-', '−')} percentage points`;
  return formatAssumption(a, Math.round(v * 10) / 10);
}

export function flipSentence(f: FlipPoint): string {
  const a = ECONOMIC[f.key];
  const label = a.phrase;
  if (f.value === null) {
    const winner = f.currentSign > 0 ? B_NAME : A_NAME;
    return `${winner} stays ahead in the typical future whatever ${label}, across everything we tried from ${formatAssumption(a, f.searched.min)} to ${formatAssumption(a, f.searched.max)}.`;
  }
  const v = flipValue(f.key, f.value);
  if (f.currentSign > 0) {
    return f.direction > 0
      ? `Investing stays ahead in the typical future unless ${label} falls below ${v}.`
      : `Investing stays ahead in the typical future unless ${label} rises above ${v}.`;
  }
  return f.direction > 0
    ? `Overpaying stays ahead in the typical future unless ${label} rises above ${v}.`
    : `Overpaying stays ahead in the typical future unless ${label} falls below ${v}.`;
}

export function sensitivityLead(sens: MortgageVsIsaSensitivity): string {
  const top = sens.tornado.slice(0, 3).map((t) => ECONOMIC[t.key].phrase);
  if (top.length === 0) return '';
  return `For these inputs, the answer after ${years(sens.horizonYear)} depends most on ${top.slice(0, -1).join(', ')}${top.length > 1 ? ' and ' : ''}${top[top.length - 1]}.`;
}
