import { useState } from 'react';
import { useSettings } from '../../lib/settings';
import {
  About, CalcLayout, EmptyState, MoneyField, NumberField, PercentField, ResultHero, Segmented, Stat, StatGrid, num,
} from '../../components/ui';

const PRESETS = ['0', '10', '12.5', '15', '18', '20'];

export default function Tip() {
  const { money } = useSettings();
  const [bill, setBill] = useState('86.50');
  const [tip, setTip] = useState('15');
  const [people, setPeople] = useState('2');
  const [round, setRound] = useState('no');

  const b = num(bill);
  const n = Math.max(1, Math.floor(num(people) || 1));
  const tipAmount = (b * (num(tip) || 0)) / 100;
  let each = (b + tipAmount) / n;
  if (round === 'yes') each = Math.ceil(each);
  const total = each * n;

  const inputs = (
    <>
      <MoneyField label="Bill total" value={bill} onChange={setBill} />
      <Segmented
        label="Tip"
        value={PRESETS.includes(tip) ? tip : ''}
        onChange={setTip}
        options={PRESETS.map((p) => ({ value: p, label: p === '0' ? 'None' : `${p}%` }))}
      />
      <PercentField label="Custom tip" value={tip} onChange={setTip} />
      <NumberField label="Split between" suffix="people" value={people} onChange={setPeople} min={1} step="1" />
      <Segmented
        label="Round up each share?"
        value={round}
        onChange={setRound}
        options={[
          { value: 'no', label: 'Exact' },
          { value: 'yes', label: 'Round up' },
        ]}
      />
    </>
  );

  const results = !(b > 0) ? (
    <EmptyState>Enter the bill to get started.</EmptyState>
  ) : (
    <>
      <ResultHero
        label={n > 1 ? 'Each person pays' : 'Total to pay'}
        value={money(each)}
        sub={n > 1 ? `${n} people · ${money(total)} in total 🍽️` : `including ${money(total - b)} tip`}
      />
      <StatGrid>
        <Stat label="Tip" value={money(total - b)} />
        <Stat label="Total" value={money(total)} />
        {n > 1 && <Stat label="Tip each" value={money((total - b) / n)} />}
      </StatGrid>
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['How much should I tip?', 'It depends on the country. In the US 15–20% is usual in restaurants. In the UK 10–12.5% is common (check whether a service charge is already added). In much of Europe people round up, and in Japan tipping isn’t expected.'],
          ['Should I tip on the total before or after tax?', 'Either is fine; tipping on the pre-tax amount is common in the US. Enter whichever total you prefer.'],
        ]}
      >
        <p>
          We add the <strong>tip</strong> to the bill and divide by the number of people. Choose{' '}
          <strong>Round up</strong> to make each share a whole number, which leaves a little extra tip.
        </p>
      </About>
    </>
  );
}
