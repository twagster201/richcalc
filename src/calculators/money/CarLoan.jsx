import { useMemo, useState } from 'react';
import { useSettings } from '../../lib/settings';
import { amortize, loanPayment, yearlySummary } from '../../lib/finance';
import { addMonths, parseDate, toInputDate, today } from '../../lib/dates';
import { C } from '../../lib/colors';
import {
  About, CalcLayout, DateField, EmptyState, MoneyField, Notice, Panel, PercentField, ResultHero, Row, Segmented,
  Stat, StatGrid, num,
} from '../../components/ui';
import { Donut } from '../../components/charts';
import { YearlySchedule } from './shared';

const TERMS = ['24', '36', '48', '60', '72', '84'];

export default function CarLoan() {
  const { money, date } = useSettings();
  const [price, setPrice] = useState('28000');
  const [deposit, setDeposit] = useState('3000');
  const [tradeIn, setTradeIn] = useState('');
  const [rate, setRate] = useState('6.9');
  const [term, setTerm] = useState('48');
  const [balloon, setBalloon] = useState('');
  const [start, setStart] = useState(toInputDate(today()));

  const r = useMemo(() => {
    const financed = num(price) - (num(deposit) || 0) - (num(tradeIn) || 0);
    const months = Number(term);
    const b = num(balloon) || 0;
    if (!(financed > 0)) return { financed };
    if (b >= financed) return { financed, balloonTooBig: true };
    const payment = loanPayment(financed, num(rate), months, b);
    if (!Number.isFinite(payment)) return { financed };
    const plan = amortize({ principal: financed, annualRate: num(rate), payment, months });
    const s = parseDate(start);
    return { financed, payment, plan, balloon: b, end: s ? addMonths(s, months) : null };
  }, [price, deposit, tradeIn, rate, term, balloon, start]);

  const upfront = (num(deposit) || 0) + (num(tradeIn) || 0);

  const inputs = (
    <>
      <MoneyField label="Car price" value={price} onChange={setPrice} />
      <Row>
        <MoneyField label="Deposit" value={deposit} onChange={setDeposit} placeholder="0" />
        <MoneyField label="Trade-in value" hint="optional" value={tradeIn} onChange={setTradeIn} placeholder="0" />
      </Row>
      <PercentField label="Interest rate" hint="APR" value={rate} onChange={setRate} />
      <Segmented label="Term (months)" value={term} onChange={setTerm} options={TERMS.map((t) => ({ value: t, label: t }))} />
      <Row>
        <MoneyField label="Balloon / final payment" hint="optional" value={balloon} onChange={setBalloon} placeholder="0" />
        <DateField label="First payment" value={start} onChange={setStart} />
      </Row>
    </>
  );

  let results;
  if (r.financed <= 0) results = <EmptyState>Your deposit and trade-in cover the whole price. No finance needed! 🎉</EmptyState>;
  else if (r.balloonTooBig) results = <Notice tone="warn">The balloon payment must be smaller than the amount you finance ({money(r.financed)}).</Notice>;
  else if (!r.payment) results = <EmptyState />;
  else {
    const regular = r.payment * (Number(term) - 1);
    const lastPayment = r.plan.rows.at(-1)?.payment ?? 0;
    results = (
      <>
        <ResultHero
          label="Monthly payment"
          value={money(r.payment)}
          sub={
            r.balloon
              ? `${term} months, then a final payment of ${money(lastPayment)}`
              : `for ${term} months${r.end ? `, finishing ${date(r.end, { month: 'short', year: 'numeric' })}` : ''}`
          }
        />
        <StatGrid>
          <Stat label="Amount financed" value={money(r.financed, { decimals: 0 })} dot={C.principal} />
          <Stat label="Total interest" value={money(r.plan.totalInterest, { decimals: 0 })} dot={C.interest} />
          <Stat label="Total cost of car" value={money(r.plan.totalPaid + upfront, { decimals: 0 })} />
        </StatGrid>
        <Panel title="Total cost breakdown">
          <Donut
            segments={[
              ...(upfront ? [{ label: 'Deposit & trade-in', value: upfront, color: C.deposit, display: money(upfront, { decimals: 0 }) }] : []),
              { label: 'Monthly payments', value: regular + r.payment, color: C.principal, display: money(regular + r.payment, { decimals: 0 }) },
              ...(r.balloon ? [{ label: 'Final payment', value: lastPayment - r.payment, color: C.balloon, display: money(lastPayment - r.payment, { decimals: 0 }) }] : []),
            ]}
            centerLabel="Interest"
            centerValue={money(r.plan.totalInterest, { compact: true })}
          />
        </Panel>
        <YearlySchedule years={yearlySummary(r.plan.rows)} />
      </>
    );
  }

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What is a balloon payment?', 'A larger lump sum due at the end of the agreement (common with PCP deals). It lowers your monthly payments, but you pay more interest overall because the balance stays higher for longer.'],
          ['Is a longer term better?', 'A longer term lowers the monthly payment but increases the total interest you pay. Cars also lose value, so a long loan can leave you owing more than the car is worth.'],
        ]}
      >
        <p>
          We subtract your <strong>deposit</strong> and <strong>trade-in</strong> from the price to get the amount
          financed, then calculate a fixed monthly payment that leaves exactly the <strong>balloon</strong> amount to
          pay at the end.
        </p>
        <p>Dealer fees, insurance and taxes aren’t included. Check the full agreement before you sign.</p>
      </About>
    </>
  );
}
