import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../lib/settings';
import { ACTIVITY_LEVELS, bmr } from '../../lib/health';
import {
  About, CalcLayout, EmptyState, Formula, HeightField, NumberField, Panel, ResultHero, Row, SexField, UnitsToggle,
  WeightField, makeHeight, makeWeight, num,
} from '../../components/ui';
import { kcalToKj } from './shared';

export default function BMR() {
  const { number } = useSettings();
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('35');
  const [height, setHeight] = useState(makeHeight(178));
  const [weight, setWeight] = useState(makeWeight(80));

  const value = bmr({ sex, kg: num(weight.kg), cm: num(height.cm), age: num(age) });

  const inputs = (
    <>
      <UnitsToggle />
      <Row>
        <SexField value={sex} onChange={setSex} />
        <NumberField label="Age" suffix="years" value={age} onChange={setAge} max={120} />
      </Row>
      <HeightField value={height} onChange={setHeight} />
      <WeightField value={weight} onChange={setWeight} />
    </>
  );

  const results = !(value > 0) ? (
    <EmptyState />
  ) : (
    <>
      <ResultHero
        label="Your BMR"
        value={`${number(value)} kcal`}
        sub={`per day at complete rest · ${number(kcalToKj(value))} kJ`}
      />
      <Panel title="Calories burned per day by activity level">
        <ul className="grid gap-2">
          {ACTIVITY_LEVELS.map((a) => (
            <li key={a.value} className="flex items-center justify-between gap-3 rounded-2xl bg-accent-soft/30 px-4 py-3">
              <span>
                <span className="block font-extrabold text-ink">{a.label}</span>
                <span className="text-sm font-semibold text-muted">{a.hint}</span>
              </span>
              <span className="whitespace-nowrap text-lg font-black text-ink">
                {number(value * Number(a.value))} <span className="text-xs font-bold text-muted">kcal</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-bold text-muted">
          Want targets for losing or gaining weight? Try the{' '}
          <Link to="/calories" className="text-accent-strong underline">
            Calorie Calculator
          </Link>
          .
        </p>
      </Panel>
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What is BMR?', 'Basal Metabolic Rate is the energy your body uses just to stay alive at rest: breathing, circulation and keeping warm. It’s usually 60–70% of what you burn in a day.'],
          ['Can I raise my BMR?', 'Building muscle raises it a little, because muscle uses more energy than fat. BMR naturally falls slowly with age.'],
        ]}
      >
        <p>
          We use the <strong>Mifflin–St Jeor</strong> equation, which research has found to be the most accurate
          everyday formula for most adults.
        </p>
        <Formula>BMR = 10 × kg + 6.25 × cm − 5 × age + 5 (men) or − 161 (women)</Formula>
      </About>
    </>
  );
}
