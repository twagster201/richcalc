import { useMemo, useState } from 'react';
import { useSettings } from '../../lib/settings';
import { amortize, loanPayment, yearlySummary } from '../../lib/finance';
import { C } from '../../lib/colors';
import {
  About, CalcLayout, EmptyState, Formula, MoneyField, Notice, NumberField, Panel, PercentField, ResultHero, Row,
  Segmented, Stat, StatGrid, num,
} from '../../components/ui';
import { Donut } from '../../components/charts';
import { YearlySchedule, formatDuration } from './shared';

export default function Loan() {
  const { money } = useSettings();
  const [mode, setMode] = useState('term');
  const [amount, setAmount] = useState('10000');
  const [rate, setRate] = useState('7.5');
  const [years, setYears] = useState('3');
  const [monthly, setMonthly] = useState('300');

  const r = useMemo(() => {
    const P = num(amount);
    const rt = num(rate);
    if (!(P > 0) || !(rt >= 0)) return null;
    if (mode === 'term') {
      const n = Math.round(num(years) * 12);
      const payment = loanPayment(P, rt, n);
      if (!Number.isFinite(payment)) return null;
      return { payment, plan: amortize({ principal: P, annualRate: rt, payment }) };
    }
    const payment = num(monthly);
    if (!(payment > 0)) return null;
    return { payment, plan: amortize({ principal: P, annualRate: rt, payment }) };
  }, [mode, amount, rate, years, monthly]);

  const inputs = (
    <>
      <Segmented
        label="What do you want to know?"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'term', label: 'Monthly payment' },
          { value: 'payment', label: 'Time to pay off' },
        ]}
      />
      <MoneyField label="Loan amount" value={amount} onChange={setAmount} />
      <Row>
        <PercentField label="Interest rate" hint="APR" value={rate} onChange={setRate} />
        {mode === 'term' ? (
          <NumberField label="Term" suffix="years" value={years} onChange={setYears} />
        ) : (
          <MoneyField label="Monthly payment" value={monthly} onChange={setMonthly} />
        )}
      </Row>
    </>
  );

  let results;
  if (!r) results = <EmptyState />;
  else if (r.plan.neverPaysOff)
    results = (
      <Notice tone="warn">
        A payment of {money(r.payment)} doesn’t cover the monthly interest of{' '}
        {money((num(amount) * num(rate)) / 1200)}, so this loan would never be paid off. Try a bigger payment.
      </Notice>
    );
  else
    results = (
      <>
        {mode === 'term' ? (
          <ResultHero label="Monthly payment" value={money(r.payment)} sub={`for ${formatDuration(r.plan.months)}`} />
        ) : (
          <ResultHero
            label="Paid off in"
            value={formatDuration(r.plan.months)}
            sub={`${r.plan.months} payments of ${money(r.payment)}`}
          />
        )}
        <StatGrid>
          <Stat label="Borrowed" value={money(num(amount), { decimals: 0 })} dot={C.principal} />
          <Stat label="Total interest" value={money(r.plan.totalInterest, { decimals: 0 })} dot={C.interest} />
          <Stat label="Total repaid" value={money(r.plan.totalPaid, { decimals: 0 })} />
        </StatGrid>
        <Panel title="Principal vs interest">
          <Donut
            segments={[
              { label: 'Principal', value: num(amount), color: C.principal, display: money(num(amount), { decimals: 0 }) },
              { label: 'Interest', value: r.plan.totalInterest, color: C.interest, display: money(r.plan.totalInterest, { decimals: 0 }) },
            ]}
            centerLabel="Total"
            centerValue={money(r.plan.totalPaid, { compact: true })}
          />
        </Panel>
        <YearlySchedule years={yearlySummary(r.plan.rows)} />
      </>
    );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What is APR?', 'The Annual Percentage Rate is the yearly cost of borrowing. Some lenders include fees in the APR, so it can be a little higher than the headline interest rate.'],
          ['How do I pay a loan off faster?', 'Pay more than the minimum each month. Use “Time to pay off” mode to see how a bigger monthly payment shortens the loan and cuts interest.'],
        ]}
      >
        <p>
          In <strong>Monthly payment</strong> mode we work out the fixed payment that clears the loan over your chosen
          term. In <strong>Time to pay off</strong> mode we simulate each month until the balance reaches zero.
        </p>
        <Formula>n = −log(1 − rP ÷ M) ÷ log(1 + r)</Formula>
        <p>
          <strong>P</strong> is the amount borrowed, <strong>M</strong> the monthly payment and <strong>r</strong> the
          monthly rate. If the payment is less than the monthly interest, the balance never goes down.
        </p>
      </About>
    </>
  );
}
