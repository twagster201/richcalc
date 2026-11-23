import { useMemo, useState } from 'react';
import { useSettings } from '../../lib/settings';
import { growth } from '../../lib/finance';
import { C } from '../../lib/colors';
import {
  About, CalcLayout, DataTable, EmptyState, Formula, MoneyField, NumberField, Panel, PercentField, ResultHero, Row,
  SelectField, Stat, StatGrid, num,
} from '../../components/ui';
import { AreaChart } from '../../components/charts';
import { useMoneyAxis } from './shared';

const FREQUENCIES = [
  { value: '1', label: 'Yearly' },
  { value: '4', label: 'Quarterly' },
  { value: '12', label: 'Monthly' },
  { value: '365', label: 'Daily' },
];

export default function CompoundInterest() {
  const { money } = useSettings();
  const axis = useMoneyAxis();
  const [initial, setInitial] = useState('5000');
  const [monthly, setMonthly] = useState('200');
  const [rate, setRate] = useState('6');
  const [years, setYears] = useState('20');
  const [freq, setFreq] = useState('12');
  const [increase, setIncrease] = useState('');

  const rows = useMemo(() => {
    const y = num(years);
    if (!(y > 0) || y > 100 || !(num(rate) >= 0)) return null;
    return growth({
      initial: num(initial) || 0,
      monthly: num(monthly) || 0,
      annualRate: num(rate),
      years: y,
      perYear: Number(freq),
      annualIncrease: num(increase) || 0,
    });
  }, [initial, monthly, rate, years, freq, increase]);

  const inputs = (
    <>
      <MoneyField label="Starting amount" value={initial} onChange={setInitial} />
      <Row>
        <MoneyField label="Monthly contribution" value={monthly} onChange={setMonthly} placeholder="0" />
        <PercentField label="Yearly increase" hint="optional" value={increase} onChange={setIncrease} placeholder="0" />
      </Row>
      <Row>
        <PercentField label="Interest rate" hint="per year" value={rate} onChange={setRate} />
        <NumberField label="Time" suffix="years" value={years} onChange={setYears} max={100} />
      </Row>
      <SelectField label="Compounding" value={freq} onChange={setFreq} options={FREQUENCIES} />
    </>
  );

  const last = rows?.at(-1);
  const results =
    !last || last.balance <= 0 ? (
      <EmptyState />
    ) : (
      <>
        <ResultHero
          label={`After ${years} years you’ll have`}
          value={money(last.balance, { decimals: 0 })}
          sub={`${money(last.interest, { decimals: 0 })} of that is interest 🌱`}
        />
        <StatGrid>
          <Stat label="You put in" value={money(last.contributed, { decimals: 0 })} dot={C.contributions} />
          <Stat label="Interest earned" value={money(last.interest, { decimals: 0 })} dot={C.growth} />
          <Stat label="Growth" value={last.contributed > 0 ? `${((last.balance / last.contributed - 1) * 100).toFixed(0)}%` : '—'} />
        </StatGrid>
        <Panel title="Growth over time">
          <AreaChart
            data={rows.map((r) => ({ x: r.year, contributed: r.contributed, interest: r.interest }))}
            series={[
              { key: 'contributed', label: 'Contributions', color: C.contributions },
              { key: 'interest', label: 'Interest', color: C.growth },
            ]}
            stacked
            yFormat={axis}
            xLabel="Year"
          />
        </Panel>
        <DataTable
          summary="📅 Year-by-year breakdown"
          columns={[
            { key: 'year', label: 'Year' },
            { key: 'contributed', label: 'Contributed', format: (v) => money(v, { decimals: 0 }) },
            { key: 'interest', label: 'Interest', format: (v) => money(v, { decimals: 0 }) },
            { key: 'balance', label: 'Balance', format: (v) => money(v, { decimals: 0 }) },
          ]}
          rows={rows.slice(1)}
        />
      </>
    );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What is compound interest?', 'Interest that is paid on your interest. Each period, the interest you earned is added to your balance, so next time you earn interest on a bigger amount.'],
          ['Does compounding frequency matter much?', 'A little. More frequent compounding gives a slightly higher return for the same headline rate, but the rate and time invested matter far more.'],
          ['What return should I use?', 'Savings accounts typically pay a few percent. Long-term stock market returns have historically averaged more, but they go up and down and are never guaranteed.'],
        ]}
      >
        <p>
          We simulate your balance month by month. Your <strong>contribution</strong> is added at the end of each month,
          and interest is applied at the compounding frequency you choose.
        </p>
        <Formula>A = P(1 + r/n)^(nt)</Formula>
        <p>
          Use <strong>yearly increase</strong> to raise your monthly contribution each year, for example in line with
          pay rises. Results ignore taxes, fees and inflation.
        </p>
      </About>
    </>
  );
}
