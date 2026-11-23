import { useMemo, useState } from 'react';
import { useSettings } from '../../lib/settings';
import { growth, savingsNeeded } from '../../lib/finance';
import { addMonths, today } from '../../lib/dates';
import { C } from '../../lib/colors';
import {
  About, CalcLayout, EmptyState, MoneyField, Notice, NumberField, Panel, PercentField, ResultHero, Row, Stat,
  StatGrid, num,
} from '../../components/ui';
import { AreaChart } from '../../components/charts';
import { useMoneyAxis } from './shared';

export default function SavingsGoal() {
  const { money, date } = useSettings();
  const axis = useMoneyAxis();
  const [target, setTarget] = useState('15000');
  const [current, setCurrent] = useState('2000');
  const [years, setYears] = useState('3');
  const [rate, setRate] = useState('4');

  const r = useMemo(() => {
    const y = num(years);
    const monthly = savingsNeeded({ target: num(target), current: num(current) || 0, annualRate: num(rate) || 0, years: y });
    if (!Number.isFinite(monthly)) return null;
    const rows = growth({ initial: num(current) || 0, monthly, annualRate: num(rate) || 0, years: y, perYear: 12 });
    return { monthly, rows, last: rows.at(-1) };
  }, [target, current, years, rate]);

  const inputs = (
    <>
      <MoneyField label="Savings goal" value={target} onChange={setTarget} />
      <MoneyField label="Already saved" value={current} onChange={setCurrent} placeholder="0" />
      <Row>
        <NumberField label="Time to save" suffix="years" value={years} onChange={setYears} step="0.25" />
        <PercentField label="Interest rate" hint="per year" value={rate} onChange={setRate} placeholder="0" />
      </Row>
    </>
  );

  const results = !r ? (
    <EmptyState />
  ) : r.monthly === 0 ? (
    <Notice tone="good">
      Great news: with interest, what you’ve already saved will grow to your goal without adding anything more.
    </Notice>
  ) : (
    <>
      <ResultHero
        label="Save each month"
        value={money(r.monthly)}
        sub={`to reach ${money(num(target), { decimals: 0 })} by ${date(addMonths(today(), Math.round(num(years) * 12)), { month: 'long', year: 'numeric' })} 🎯`}
      />
      <StatGrid>
        <Stat label="Each week" value={money((r.monthly * 12) / 52)} />
        <Stat label="You’ll pay in" value={money(r.last.contributed, { decimals: 0 })} dot={C.contributions} />
        <Stat label="Interest earned" value={money(r.last.interest, { decimals: 0 })} dot={C.growth} />
      </StatGrid>
      <Panel title="Your path to the goal">
        <AreaChart
          data={r.rows.map((x) => ({ x: x.year, contributed: x.contributed, interest: x.interest }))}
          series={[
            { key: 'contributed', label: 'Saved', color: C.contributions },
            { key: 'interest', label: 'Interest', color: C.growth },
          ]}
          stacked
          yFormat={axis}
          xLabel="Year"
        />
      </Panel>
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['How can I reach my goal faster?', 'Save a little more each month, start with a bigger lump sum, or find an account with a higher interest rate. Setting up an automatic transfer on payday makes it easier to stick to.'],
          ['Should I include interest?', 'If your savings are in an interest-paying account, yes. Leave it at 0% for a cautious estimate.'],
        ]}
      >
        <p>
          We work out the fixed monthly amount that, together with what you’ve <strong>already saved</strong> and
          monthly compound interest, adds up to your <strong>goal</strong> by the end of the period.
        </p>
        <p>Great for emergency funds, house deposits, holidays, weddings or a new car.</p>
      </About>
    </>
  );
}
