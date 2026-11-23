import { useState } from 'react';
import { healthyWeightRange, idealWeights } from '../../lib/health';
import {
  About, CalcLayout, EmptyState, HeightField, Notice, Panel, ResultHero, SexField, Stat, StatGrid, UnitsToggle,
  makeHeight, num,
} from '../../components/ui';
import { useHeightFormat, useWeightFormat } from './shared';

export default function IdealWeight() {
  const fmtW = useWeightFormat();
  const fmtH = useHeightFormat();
  const [sex, setSex] = useState('female');
  const [height, setHeight] = useState(makeHeight(165));

  const cm = num(height.cm);
  const list = cm > 100 && cm < 250 ? idealWeights({ sex, cm }) : null;
  const avg = list ? list.reduce((s, x) => s + x.kg, 0) / list.length : 0;
  const max = list ? Math.max(...list.map((x) => x.kg)) : 0;
  const range = list ? healthyWeightRange(cm) : null;

  const inputs = (
    <>
      <UnitsToggle />
      <SexField value={sex} onChange={setSex} />
      <HeightField value={height} onChange={setHeight} />
    </>
  );

  const results = !list ? (
    <EmptyState>Enter your height to see your ideal weight.</EmptyState>
  ) : (
    <>
      <ResultHero label="Ideal weight (average)" value={fmtW(avg)} sub={`for a height of ${fmtH(cm)}`} />
      <Panel title="By formula">
        <ul className="grid gap-3">
          {list.map((f) => (
            <li key={f.name}>
              <div className="mb-1 flex justify-between font-bold">
                <span className="text-muted">{f.name}</span>
                <span className="text-ink">{fmtW(f.kg)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-accent-soft/60">
                <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(f.kg / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      <StatGrid>
        <Stat label="Healthy BMI range" value={`${fmtW(range.min, 0)} – ${fmtW(range.max, 0)}`} dot="#22c55e" />
      </StatGrid>
      {cm < 152.4 && (
        <Notice tone="warn">These formulas were designed for people over 5 ft (152 cm), so results may be less reliable.</Notice>
      )}
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['Why are there different answers?', 'Each formula was created by different researchers for different purposes (several were originally for working out medicine doses). Looking at the range is more useful than any single number.'],
          ['Does this account for muscle or frame size?', 'No. People with more muscle or a larger frame can be perfectly healthy above these numbers.'],
        ]}
      >
        <p>
          We compare four classic formulas (<strong>Robinson, Miller, Devine</strong> and <strong>Hamwi</strong>). Each
          starts from a base weight at 5 ft and adds a set amount for every inch above that.
        </p>
        <p>We also show the weight range that gives a healthy BMI (18.5–24.9) at your height.</p>
      </About>
    </>
  );
}
