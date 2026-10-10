/**
 * Student and postgraduate loan repayments, annual basis.
 *
 * Repayments are a percentage of earnings above the plan threshold. Someone with an undergraduate
 * plan and a postgraduate loan repays both. Earnings here are pay after salary sacrifice, which is
 * what payroll uses.
 */
import type { RuleSet, StudentLoanPlan } from '../../rules/schema';

export type StudentLoanChoice = 'none' | StudentLoanPlan;

export interface StudentLoanResult {
  undergraduate: number;
  postgraduate: number;
  total: number;
}

export function studentLoanRepayment(
  rules: RuleSet,
  earnings: number,
  plan: StudentLoanChoice,
  hasPostgraduate = false,
): StudentLoanResult {
  let undergraduate = 0;
  if (plan !== 'none') {
    const p = rules.studentLoans.plans.value[plan];
    undergraduate = Math.max(0, earnings - p.threshold) * p.rate;
  }
  let postgraduate = 0;
  if (hasPostgraduate) {
    const pg = rules.studentLoans.postgraduate.value;
    postgraduate = Math.max(0, earnings - pg.threshold) * pg.rate;
  }
  return { undergraduate, postgraduate, total: undergraduate + postgraduate };
}
