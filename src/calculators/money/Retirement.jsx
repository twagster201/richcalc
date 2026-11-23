import { useMemo, useState } from 'react';
import { useSettings } from '../../lib/settings';
import { growth, toTodaysMoney } from '../../lib/finance';
import { C } from '../../lib/colors';
import {
  About, CalcLayout, EmptyState, MoneyField, Notice, NumberField, Panel, PercentField, ResultHero, Row, Stat,
  StatGrid, num,
} from '../../components/ui';
import { AreaChart } from '../../components/charts';
import { useMoneyAxis } from './shared';

export default function Retirement() {
  const { money } = useSettings();
  const axis = useMoneyAxis();
  const [age, setAge] = useState('35');
  const [retireAge, setRetireAge] = useState('67');
  const [saved, setSaved] = useState('40000');
  const [monthly, setMonthly] = useState('400');
  const [increase, setIncrease] = useState('2');
  const [ret, setRet] = useState('6');
  const [infl, setInfl] = useState('2.5');
  const [withdraw, setWithdraw] = useState('4');

  const r = useMemo(() => {
    const years = num(retireAge) - num(age);
    if (!(years > 0) || years > 80) return null;
    const rows = growth({
      initial: num(saved) || 0,
      monthly: num(monthly) || 0,
      annualRate: num(ret) || 0,
      years,
      perYear: 12,
      annualIncrease: num(increase) || 0,
    });
    const last = rows.at(-1);
    const inflation = num(infl) || 0;
    const real = toTodaysMoney(last.balance, inflation, years);
    const income = (real * (num(withdraw) || 0)) / 100;
    return { years, rows, last, real, income };
  }, [age, retireAge, saved, monthly, increase, ret, infl, withdraw]);

  const inputs = (
    <>
      <Row>
        <NumberField label="Your age" suffix="years" value={age} onChange={setAge} />
        <NumberField label="Retirement age" suffix="years" value={retireAge} onChange={setRetireAge} />
      </Row>
      <MoneyField label="Saved so far" value={saved} onChange={setSaved} placeholder="0" />
      <Row>
        <MoneyField label="Monthly saving" hint="incl. employer" value={monthly} onChange={setMonthly} placeholder="0" />
        <PercentField label="Yearly increase" value={increase} onChange={setIncrease} placeholder="0" />
      </Row>
      <Row>
        <PercentField label="Investment return" hint="per year" value={ret} onChange={setRet} />
        <PercentField label="Inflation" hint="per year" value={infl} onChange={setInfl} />
      </Row>
      <PercentField label="Withdrawal rate" hint="per year in retirement" value={withdraw} onChange={setWithdraw} />
    </>
  );

  const results = !r ? (
    <EmptyState>Enter a retirement age that’s later than your current age.</EmptyState>
  ) : (
    <>
      <ResultHero
        label={`Pot at age ${retireAge}`}
        value={money(r.last.balance, { decimals: 0 })}
        sub={`≈ ${money(r.real, { decimals: 0 })} in today’s money`}
      />
      <StatGrid>
        <Stat label="Yearly income" value={money(r.income, { decimals: 0 })} />
        <Stat label="Monthly income" value={money(r.income / 12, { decimals: 0 })} />
        <Stat label="Years to go" value={r.years} />
        <Stat label="You pay in" value={money(r.last.contributed, { decimals: 0 })} dot={C.contributions} />
        <Stat label="Investment growth" value={money(r.last.interest, { decimals: 0 })} dot={C.growth} />
      </StatGrid>
      <Notice>
        Income figures are in <strong>today’s money</strong>, so you can compare them with what you live on now. They
        don’t include state pensions or social security.
      </Notice>
      <Panel title="Your pot over time">
        <AreaChart
          data={r.rows.map((x) => ({ x: num(age) + x.year, contributed: x.contributed, interest: x.interest }))}
          series={[
            { key: 'contributed', label: 'Contributions', color: C.contributions },
            { key: 'interest', label: 'Growth', color: C.growth },
          ]}
          stacked
          yFormat={axis}
          xLabel="Age"
        />
      </Panel>
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What is the 4% rule?', 'A rule of thumb from US research suggesting you can withdraw about 4% of your pot in the first year of retirement, then adjust for inflation, with a good chance of the money lasting 30 years. Many planners now suggest 3–4%.'],
          ['Why show “today’s money”?', 'Prices rise over time, so a big number in 30 years buys less than it would today. Adjusting for inflation shows what your pot is really worth.'],
          ['Does this include my state pension?', 'No. Add any state pension, social security or defined-benefit pension on top of the income shown here.'],
        ]}
      >
        <p>
          We grow your <strong>savings</strong> and <strong>monthly contributions</strong> at your chosen investment
          return until retirement, then convert the result into today’s money using your inflation rate.
        </p>
        <p>
          Your estimated income is that pot multiplied by the <strong>withdrawal rate</strong>. Investments can fall as
          well as rise, so treat this as a rough guide, not financial advice.
        </p>
      </About>
    </>
  );
}
