// Pure finance maths. All rates are annual percentages (e.g. 5 for 5%).

const monthlyRate = (annualRate) => annualRate / 100 / 12;

/** Regular monthly payment for a loan, optionally leaving a balloon (final) payment. */
export function loanPayment(principal, annualRate, months, balloon = 0) {
  if (!(principal > 0) || !(months > 0) || !(annualRate >= 0) || !(balloon >= 0)) return NaN;
  if (balloon >= principal) return 0;
  const r = monthlyRate(annualRate);
  if (r === 0) return (principal - balloon) / months;
  const f = Math.pow(1 + r, months);
  return ((principal - balloon / f) * r) / (1 - 1 / f);
}

/**
 * Month-by-month amortization schedule.
 * `months` (optional) is the contractual term: any balance left then is paid as a final (balloon) payment.
 */
export function amortize({ principal, annualRate, payment, extra = 0, months, maxMonths = 1200 }) {
  const r = monthlyRate(annualRate);
  const rows = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  if (!months && payment + extra <= principal * r) {
    return { rows, totalInterest: Infinity, totalPaid: Infinity, months: Infinity, neverPaysOff: true };
  }

  for (let m = 1; balance > 0.005 && m <= maxMonths; m++) {
    const interest = balance * r;
    let pay = Math.min(payment + extra, balance + interest);
    const isFinal = months && m === months;
    if (isFinal) pay = balance + interest; // final / balloon payment
    const principalPaid = pay - interest;
    balance -= principalPaid;
    totalInterest += interest;
    totalPaid += pay;
    rows.push({ month: m, payment: pay, interest, principal: principalPaid, balance: Math.max(balance, 0) });
    if (isFinal) break;
  }
  return { rows, totalInterest, totalPaid, months: rows.length, neverPaysOff: false };
}

/** Collapse monthly rows into yearly totals. */
export function yearlySummary(rows) {
  const years = [];
  for (const row of rows) {
    const y = Math.ceil(row.month / 12);
    if (!years[y - 1]) years[y - 1] = { year: y, interest: 0, principal: 0, payment: 0, balance: 0 };
    const yr = years[y - 1];
    yr.interest += row.interest;
    yr.principal += row.principal;
    yr.payment += row.payment;
    yr.balance = row.balance;
  }
  return years;
}

/**
 * Growth of an investment with monthly contributions (made at the end of each month).
 * `perYear` is the compounding frequency (1, 4, 12, 365).
 * Returns one row per year, starting with year 0.
 */
export function growth({ initial = 0, monthly = 0, annualRate = 0, years, perYear = 12, annualIncrease = 0 }) {
  const i = Math.pow(1 + annualRate / 100 / perYear, perYear / 12) - 1;
  let balance = initial;
  let contributed = initial;
  let contribution = monthly;
  const rows = [{ year: 0, balance, contributed, interest: 0 }];
  const wholeYears = Math.ceil(years);
  for (let y = 1; y <= wholeYears; y++) {
    const monthsThisYear = Math.min(12, Math.round((years - (y - 1)) * 12));
    for (let m = 0; m < monthsThisYear; m++) {
      balance = balance * (1 + i) + contribution;
      contributed += contribution;
    }
    rows.push({ year: y, balance, contributed, interest: balance - contributed });
    contribution *= 1 + annualIncrease / 100;
  }
  return rows;
}

/** Monthly saving needed to reach `target` in `years`, given what you already have. */
export function savingsNeeded({ target, current = 0, annualRate = 0, years }) {
  const n = Math.round(years * 12);
  if (!(n > 0) || !(target > 0)) return NaN;
  const i = monthlyRate(annualRate);
  const f = Math.pow(1 + i, n);
  const fromCurrent = current * f;
  if (fromCurrent >= target) return 0;
  if (i === 0) return (target - current) / n;
  return ((target - fromCurrent) * i) / (f - 1);
}

/** What `amount` today costs after `years` of inflation, and what it is worth then. */
export function inflation({ amount, annualRate, years }) {
  const f = Math.pow(1 + annualRate / 100, years);
  return { futureCost: amount * f, purchasingPower: amount / f, totalIncreasePct: (f - 1) * 100 };
}

/** Express `value` (in future money) in today's money. */
export const toTodaysMoney = (value, inflationRate, years) => value / Math.pow(1 + inflationRate / 100, years);
