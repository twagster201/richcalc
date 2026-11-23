import { useState } from 'react';
import { BODY_FAT_BANDS, bandFor, bodyFatNavy } from '../../lib/health';
import {
  About, CalcLayout, EmptyState, HeightField, LengthField, Notice, Panel, ResultHero, Row, SexField, Stat, StatGrid,
  UnitsToggle, WeightField, makeHeight, makeLength, makeWeight, num,
} from '../../components/ui';
import { BandGauge } from '../../components/charts';
import { useWeightFormat } from './shared';

export default function BodyFat() {
  const fmtW = useWeightFormat();
  const [sex, setSex] = useState('male');
  const [height, setHeight] = useState(makeHeight(178));
  const [weight, setWeight] = useState(makeWeight(80));
  const [neck, setNeck] = useState(makeLength(38));
  const [waist, setWaist] = useState(makeLength(86));
  const [hip, setHip] = useState(makeLength(98));

  const value = bodyFatNavy({ sex, cm: num(height.cm), neck: num(neck.cm), waist: num(waist.cm), hip: num(hip.cm) });
  const ok = Number.isFinite(value);
  const bands = BODY_FAT_BANDS[sex];
  const band = ok ? bandFor(bands, value) : null;
  const kg = num(weight.kg);
  const fatKg = ok && kg > 0 ? (kg * value) / 100 : NaN;

  const inputs = (
    <>
      <UnitsToggle />
      <SexField value={sex} onChange={setSex} />
      <HeightField value={height} onChange={setHeight} />
      <WeightField value={weight} onChange={setWeight} label="Weight (optional)" />
      <Row>
        <LengthField label="Neck" hint="below the larynx" value={neck} onChange={setNeck} />
        <LengthField label="Waist" hint={sex === 'male' ? 'at the navel' : 'narrowest point'} value={waist} onChange={setWaist} />
      </Row>
      {sex === 'female' && <LengthField label="Hips" hint="widest point" value={hip} onChange={setHip} />}
    </>
  );

  const results = !ok ? (
    <EmptyState>Check your measurements: your waist should be larger than your neck.</EmptyState>
  ) : (
    <>
      <ResultHero label="Estimated body fat" value={`${value.toFixed(1)}%`} sub={band.label} color={band.color} />
      <Panel>
        <BandGauge bands={bands} value={value} min={sex === 'female' ? 8 : 2} max={45} format={(v) => `${v.toFixed(1)}%`} />
      </Panel>
      {Number.isFinite(fatKg) && (
        <StatGrid>
          <Stat label="Fat mass" value={fmtW(fatKg)} dot={band.color} />
          <Stat label="Lean mass" value={fmtW(kg - fatKg)} dot="#38bdf8" />
        </StatGrid>
      )}
      <Notice>
        Tape-measure methods are usually within 3–4% of lab results. Measure on bare skin, relaxed, at the same time
        of day for consistent tracking.
      </Notice>
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['How do I measure correctly?', 'Neck: just below the Adam’s apple, tape sloping slightly down at the front. Waist: men at the navel, women at the narrowest point. Hips (women): at the widest point of the buttocks. Don’t pull the tape tight.'],
          ['What is a healthy body fat percentage?', 'For most men roughly 10–20%, and for most women roughly 18–30%. Ranges vary with age and between organisations.'],
        ]}
      >
        <p>
          The <strong>US Navy method</strong> estimates body fat from your height and a few circumference
          measurements. Women’s results also use <strong>hip</strong> measurement for better accuracy.
        </p>
        <p>
          Categories follow the American Council on Exercise (ACE) guidelines. Add your weight to see how much of it is
          fat and how much is lean mass (muscle, bone, organs and water).
        </p>
      </About>
    </>
  );
}
