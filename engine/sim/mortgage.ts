/** Repayment mortgage arithmetic. Interest is charged monthly at the annual rate divided by 12. */

/** Level monthly payment that clears `balance` over `months` at `annualRate`. */
export function monthlyPayment(balance: number, annualRate: number, months: number): number {
  if (balance <= 0) return 0;
  if (months <= 0) return balance;
  const i = annualRate / 12;
  if (Math.abs(i) < 1e-12) return balance / months;
  return (balance * i) / (1 - Math.pow(1 + i, -months));
}

/** Balance remaining after `paid` months of level payments. */
export function balanceAfter(balance: number, annualRate: number, months: number, paid: number): number {
  const pmt = monthlyPayment(balance, annualRate, months);
  const i = annualRate / 12;
  if (Math.abs(i) < 1e-12) return Math.max(0, balance - pmt * paid);
  const g = Math.pow(1 + i, paid);
  return Math.max(0, balance * g - pmt * ((g - 1) / i));
}
