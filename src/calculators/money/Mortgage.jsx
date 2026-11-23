import { useMemo, useState } from 'react';
import { useSettings } from '../../lib/settings';
import { amortize, loanPayment, yearlySummary } from '../../lib/finance';
import { addMonths, parseDate, toInputDate, today } from '../../lib/dates';
import { C } from '../../lib/colors';
import {
  About, CalcLayout, DateField, EmptyState, Formula, MoneyField, Notice, NumberField, Panel, PercentField,
  ResultHero, Row, Segmented, Stat, StatGrid, num,
} from '../../components/ui';
import { AreaChart, Donut } from '../../components/charts';
import { YearlySchedule, formatDuration, useMoneyAxis } from './shared';

export default function Mortgage() {
  const { money, date } = useSettings();
  const axis = useMoneyAxis();
  const [price, setPrice] = useState('350000');
  const [depositMode, setDepositMode] = useState('percent');
  const [deposit, setDeposit] = useState('10');
  const [years, setYears] = useState('25');
  const [rate, setRate] = useState('4.5');
  const [start, setStart] = useState(toInputDate(today()));
  const [overpay, setOverpay] = useState('');
  const [costs, setCosts] = useState('');

  const r = useMemo(() => {
    const p = num(price);
    const d = depositMode === 'percent' ? (p * (num(deposit) || 0)) / 100 : num(deposit) || 0;
    const loan = p - d;
    const months = Math.round(num(years) * 12);
    const payment = loanPayment(loan, num(rate), months);
    if (!Number.isFinite(payment) || loan <= 0) return { deposit: d, loan };
    const base = amortize({ principal: loan, annualRate: num(rate), payment });
    const extra = num(overpay) || 0;
    const withExtra = extra > 0 ? amortize({ principal: loan, annualRate: num(rate), payment, extra }) : null;
    const plan = withExtra ?? base;
    const startDate = parseDate(start);
    return {
      deposit: d,
      loan,
      payment,
      base,
      plan,
      withExtra,
      years: yearlySummary(plan.rows),
      payoff: startDate ? addMonths(startDate, plan.months) : null,
      chart: yearlySummary(base.rows).map((y, i) => ({
        x: y.year,
        balance: y.balance,
        ...(withExtra ? { overpay: yearlySummary(withExtra.rows)[i]?.balance ?? 0 } : {}),
      })),
    };
  }, [price, depositMode, deposit, years, rate, overpay, start]);

  const other = num(costs) || 0;
  const extra = num(overpay) || 0;

  const inputs = (
    <>
      <MoneyField label="Property price" value={price} onChange={setPrice} />
      <div className="grid gap-2">
        <Segmented
          value={depositMode}
          onChange={(m) => {
            const p = num(price);
            if (p > 0 && deposit !== '') {
              setDeposit(String(m === 'percent' ? +((num(deposit) / p) * 100).toFixed(2) : Math.round((p * num(deposit)) / 100)));
            }
            setDepositMode(m);
          }}
          label="Deposit (down payment)"
          options={[
            { value: 'percent', label: '% of price' },
            { value: 'amount', label: 'Amount' },
          ]}
        />
        {depositMode === 'percent' ? (
          <PercentField label="Deposit" value={deposit} onChange={setDeposit} hint={money(r.deposit, { decimals: 0 })} />
        ) : (
          <MoneyField label="Deposit" value={deposit} onChange={setDeposit} />
        )}
      </div>
      <Row>
        <NumberField label="Term" suffix="years" value={years} onChange={setYears} max={50} />
        <PercentField label="Interest rate" hint="per year" value={rate} onChange={setRate} />
      </Row>
      <DateField label="Start date" value={start} onChange={setStart} />
      <Row>
        <MoneyField label="Overpayment" hint="per month, optional" value={overpay} onChange={setOverpay} placeholder="0" />
        <MoneyField label="Other costs" hint="tax, insurance…" value={costs} onChange={setCosts} placeholder="0" />
      </Row>
    </>
  );

  const results = !r.payment ? (
    <EmptyState>
      {r.loan <= 0 ? 'Your deposit covers the whole price, so no mortgage is needed. 🎉' : undefined}
    </EmptyState>
  ) : (
    <>
      <ResultHero
        label="Monthly repayment"
        value={money(r.payment + extra + other)}
        sub={
          extra || other
            ? `${money(r.payment)} mortgage${extra ? ` + ${money(extra)} overpayment` : ''}${other ? ` + ${money(other)} other costs` : ''}`
            : `for ${formatDuration(r.plan.months)}`
        }
      />
      <StatGrid>
        <Stat label="Loan amount" value={money(r.loan, { decimals: 0 })} />
        <Stat label="Total interest" value={money(r.plan.totalInterest, { decimals: 0 })} dot={C.interest} />
        <Stat label="Total repaid" value={money(r.plan.totalPaid, { decimals: 0 })} />
        <Stat label="Loan to value" value={`${((r.loan / num(price)) * 100).toFixed(1)}%`} />
        <Stat label="Mortgage-free" value={r.payoff ? date(r.payoff, { month: 'short', year: 'numeric' }) : '—'} />
        <Stat label="Deposit" value={money(r.deposit, { decimals: 0 })} dot={C.deposit} />
      </StatGrid>
      {r.withExtra && (
        <Notice tone="good">
          Overpaying {money(extra)} a month saves you{' '}
          <strong>{money(r.base.totalInterest - r.withExtra.totalInterest, { decimals: 0 })}</strong> in interest and
          clears the mortgage <strong>{formatDuration(r.base.months - r.withExtra.months)}</strong> early.
        </Notice>
      )}
      <Panel title="Where your money goes">
        <Donut
          segments={[
            { label: 'Principal', value: r.loan, color: C.principal, display: money(r.loan, { decimals: 0 }) },
            { label: 'Interest', value: r.plan.totalInterest, color: C.interest, display: money(r.plan.totalInterest, { decimals: 0 }) },
          ]}
          centerLabel="Total"
          centerValue={money(r.plan.totalPaid, { compact: true })}
        />
      </Panel>
      <Panel title="Balance over time">
        <AreaChart
          data={[{ x: 0, balance: r.loan, overpay: r.loan }, ...r.chart]}
          series={[
            { key: 'balance', label: 'Remaining balance', color: C.principal },
            ...(r.withExtra ? [{ key: 'overpay', label: 'With overpayments', color: C.extra }] : []),
          ]}
          yFormat={axis}
          xLabel="Year"
        />
      </Panel>
      <YearlySchedule years={r.years} />
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What deposit do I need?', 'Many lenders want at least 5–20% of the property price. A bigger deposit usually means a lower interest rate and a smaller loan.'],
          ['Do overpayments always help?', 'Overpaying reduces the balance that interest is charged on, so it shortens the term and cuts total interest. Check whether your lender limits overpayments or charges early repayment fees.'],
          ['What should go in “other costs”?', 'Anything you pay every month on top of the mortgage: property tax or council tax, home insurance, service charges or HOA fees. These are added to your monthly total but don’t affect the loan.'],
        ]}
      >
        <p>
          We use the standard repayment (amortization) formula. Each month you pay the same amount; at first most of it
          is <strong>interest</strong>, and over time more goes towards the <strong>principal</strong> (the amount you
          borrowed).
        </p>
        <Formula>M = P × r(1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)</Formula>
        <p>
          Here <strong>P</strong> is the loan amount, <strong>r</strong> the monthly interest rate (annual rate ÷ 12) and{' '}
          <strong>n</strong> the number of monthly payments. Interest-only, variable-rate and offset mortgages work
          differently, so treat results as an estimate.
        </p>
      </About>
    </>
  );
}
