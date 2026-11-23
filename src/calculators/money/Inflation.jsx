import { useMemo, useState } from 'react';
import { useSettings } from '../../lib/settings';
import { inflation } from '../../lib/finance';
import { C } from '../../lib/colors';
import {
  About, CalcLayout, EmptyState, Formula, MoneyField, NumberField, Panel, PercentField, ResultHero, Row, Stat,
  StatGrid, num,
} from '../../components/ui';
import { AreaChart } from '../../components/charts';
import { useMoneyAxis } from './shared';

export default function Inflation() {
  const { money } = useSettings();
  const axis = useMoneyAxis();
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('10');

  const r = useMemo(() => {
    const a = num(amount);
    const y = num(years);
    const rt = num(rate);
    if (!(a > 0) || !(y > 0) || y > 200 || !Number.isFinite(rt)) return null;
    const res = inflation({ amount: a, annualRate: rt, years: y });
    const rows = Array.from({ length: Math.floor(y) + 1 }, (_, i) => ({
      x: i,
      cost: inflation({ amount: a, annualRate: rt, years: i }).futureCost,
      value: inflation({ amount: a, annualRate: rt, years: i }).purchasingPower,
    }));
    return { ...res, rows };
  }, [amount, rate, years]);

  const inputs = (
    <>
      <MoneyField label="Amount today" value={amount} onChange={setAmount} />
      <Row>
        <PercentField label="Inflation rate" hint="per year" value={rate} onChange={setRate} min={-20} />
        <NumberField label="Years" suffix="years" value={years} onChange={setYears} />
      </Row>
    </>
  );

  const results = !r ? (
    <EmptyState />
  ) : (
    <>
      <ResultHero
        label={`In ${years} years, the same things will cost`}
        value={money(r.futureCost)}
        sub={`Prices up ${r.totalIncreasePct.toFixed(1)}% 🎈`}
      />
      <StatGrid>
        <Stat label="Your money will buy" value={money(r.purchasingPower)} dot={C.costs} />
        <Stat label="Value lost" value={money(num(amount) - r.purchasingPower)} />
        <Stat label="Price rise" value={`${r.totalIncreasePct.toFixed(1)}%`} dot={C.interest} />
      </StatGrid>
      <Panel title="Cost vs. what your money buys">
        <AreaChart
          data={r.rows}
          series={[
            { key: 'cost', label: 'Cost of the same things', color: C.interest },
            { key: 'value', label: 'What your cash is worth', color: C.costs },
          ]}
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
          ['What inflation rate should I use?', 'Many central banks target around 2% a year. Recent rates in your country are published by your national statistics office.'],
          ['How do I beat inflation?', 'Your savings need to earn more than the inflation rate after tax to keep their buying power. Cash under the mattress loses value every year.'],
        ]}
      >
        <p>
          Inflation is the rate at which prices rise. We compound your chosen rate each year to show what the same
          basket of goods will <strong>cost</strong>, and how much the same amount of cash will really{' '}
          <strong>buy</strong>.
        </p>
        <Formula>Future cost = Amount × (1 + inflation)^years</Formula>
      </About>
    </>
  );
}
