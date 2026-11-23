import { useState } from 'react';
import { BMI_BANDS, bandFor, bmi, healthyWeightRange } from '../../lib/health';
import {
  About, CalcLayout, EmptyState, Formula, HeightField, Notice, Panel, ResultHero, Stat, StatGrid, UnitsToggle,
  WeightField, makeHeight, makeWeight, num,
} from '../../components/ui';
import { BandGauge } from '../../components/charts';
import { useWeightFormat } from './shared';

export default function BMI() {
  const [height, setHeight] = useState(makeHeight(172));
  const [weight, setWeight] = useState(makeWeight(70));
  const fmtW = useWeightFormat();

  const cm = num(height.cm);
  const kg = num(weight.kg);
  const value = bmi(kg, cm);
  const ok = Number.isFinite(value) && value > 5 && value < 100;
  const band = ok ? bandFor(BMI_BANDS, value) : null;
  const range = ok ? healthyWeightRange(cm) : null;

  const inputs = (
    <>
      <UnitsToggle />
      <HeightField value={height} onChange={setHeight} />
      <WeightField value={weight} onChange={setWeight} />
    </>
  );

  const results = !ok ? (
    <EmptyState>Enter your height and weight to see your BMI.</EmptyState>
  ) : (
    <>
      <ResultHero label="Your BMI" value={value.toFixed(1)} sub={band.label} color={band.color} />
      <Panel>
        <BandGauge bands={BMI_BANDS} value={value} min={15} max={40} />
      </Panel>
      <StatGrid>
        <Stat label="Healthy range" value={`${fmtW(range.min, 0)} – ${fmtW(range.max, 0)}`} dot="#22c55e" />
        {kg < range.min && <Stat label="To reach range" value={`+${fmtW(range.min - kg)}`} />}
        {kg > range.max && <Stat label="To reach range" value={`−${fmtW(kg - range.max)}`} />}
        {kg >= range.min && kg <= range.max && <Stat label="Status" value="In range 🎉" />}
      </StatGrid>
      <Notice>
        BMI doesn’t tell muscle from fat, so it can mislead for athletes, older adults, during pregnancy and for some
        ethnic groups. It isn’t designed for children; use a growth chart instead.
      </Notice>
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What is a healthy BMI?', 'For most adults, a BMI from 18.5 to 24.9 is considered a healthy weight, according to the World Health Organization.'],
          ['Are the ranges the same everywhere?', 'Some health bodies use lower thresholds for people of South Asian, Chinese and other Asian backgrounds (for example, overweight from 23). Speak to a doctor about what’s right for you.'],
        ]}
      >
        <p>
          Body Mass Index compares your <strong>weight</strong> to your <strong>height</strong>. It’s a quick
          screening tool, not a diagnosis.
        </p>
        <Formula>BMI = weight (kg) ÷ height (m)²</Formula>
        <p>
          Below 18.5 is underweight, 18.5–24.9 healthy, 25–29.9 overweight and 30 or above obese (WHO adult
          categories).
        </p>
      </About>
    </>
  );
}
