import { useState } from 'react';
import { useSettings } from '../../lib/settings';
import { C } from '../../lib/colors';
import {
  About, CalcLayout, EmptyState, MoneyField, Panel, PercentField, ResultHero, Row, Stat, StatGrid, num,
} from '../../components/ui';
import { Donut } from '../../components/charts';

export default function Discount() {
  const { money } = useSettings();
  const [price, setPrice] = useState('120');
  const [off, setOff] = useState('25');
  const [extra, setExtra] = useState('');
  const [tax, setTax] = useState('');

  const p = num(price);
  const afterFirst = p * (1 - (num(off) || 0) / 100);
  const afterExtra = afterFirst * (1 - (num(extra) || 0) / 100);
  const taxAmount = afterExtra * ((num(tax) || 0) / 100);
  const final = afterExtra + taxAmount;
  const saved = p - afterExtra;
  const effective = p > 0 ? (saved / p) * 100 : 0;

  const inputs = (
    <>
      <MoneyField label="Original price" value={price} onChange={setPrice} />
      <Row>
        <PercentField label="Discount" value={off} onChange={setOff} />
        <PercentField label="Extra discount" hint="optional" value={extra} onChange={setExtra} placeholder="0" />
      </Row>
      <PercentField label="Sales tax / VAT" hint="if not included" value={tax} onChange={setTax} placeholder="0" />
    </>
  );

  const results = !(p > 0) ? (
    <EmptyState />
  ) : (
    <>
      <ResultHero label="You pay" value={money(final)} sub={`You save ${money(saved)} 🏷️`} />
      <StatGrid>
        <Stat label="Total discount" value={`${effective.toFixed(1)}%`} />
        <Stat label="Price before tax" value={money(afterExtra)} />
        {taxAmount > 0 && <Stat label="Tax" value={money(taxAmount)} />}
      </StatGrid>
      <Panel title="Original price">
        <Donut
          segments={[
            { label: 'You pay', value: afterExtra, color: C.principal, display: money(afterExtra) },
            { label: 'You save', value: saved, color: C.deposit, display: money(saved) },
          ]}
          centerLabel="Was"
          centerValue={money(p)}
        />
      </Panel>
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['Is 20% off then 10% off the same as 30% off?', 'No. The second discount applies to the already-reduced price, so 20% then 10% is 28% off in total.'],
          ['Should I add tax?', 'In the UK, EU and Australia, shelf prices usually include VAT/GST already, so leave tax at 0. In the US, sales tax is usually added at the till.'],
        ]}
      >
        <p>
          We take the <strong>discount</strong> off the original price, then any <strong>extra discount</strong> off
          the reduced price, and finally add <strong>sales tax</strong> if you enter it.
        </p>
      </About>
    </>
  );
}
