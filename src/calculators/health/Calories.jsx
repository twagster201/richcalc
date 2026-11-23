import { useState } from 'react';
import { useSettings } from '../../lib/settings';
import { ACTIVITY_LEVELS, bmr } from '../../lib/health';
import {
  About, CalcLayout, EmptyState, HeightField, Notice, NumberField, Panel, ResultHero, Row, SelectField, SexField,
  Stat, StatGrid, UnitsToggle, WeightField, makeHeight, makeWeight, num,
} from '../../components/ui';
import { kcalToKj } from './shared';

const GOALS = [
  { label: 'Lose 0.5 kg / 1 lb a week', delta: -500, emoji: '⬇️' },
  { label: 'Lose 0.25 kg / ½ lb a week', delta: -250, emoji: '↘️' },
  { label: 'Maintain weight', delta: 0, emoji: '⚖️' },
  { label: 'Gain 0.25 kg / ½ lb a week', delta: 250, emoji: '↗️' },
  { label: 'Gain 0.5 kg / 1 lb a week', delta: 500, emoji: '⬆️' },
];

export default function Calories() {
  const { number } = useSettings();
  const [sex, setSex] = useState('female');
  const [age, setAge] = useState('30');
  const [height, setHeight] = useState(makeHeight(165));
  const [weight, setWeight] = useState(makeWeight(65));
  const [activity, setActivity] = useState('1.375');

  const base = bmr({ sex, kg: num(weight.kg), cm: num(height.cm), age: num(age) });
  const tdee = base * Number(activity);
  const floor = sex === 'female' ? 1200 : 1500;

  const inputs = (
    <>
      <UnitsToggle />
      <Row>
        <SexField value={sex} onChange={setSex} />
        <NumberField label="Age" suffix="years" value={age} onChange={setAge} max={120} />
      </Row>
      <HeightField value={height} onChange={setHeight} />
      <WeightField value={weight} onChange={setWeight} />
      <SelectField
        label="Activity level"
        value={activity}
        onChange={setActivity}
        options={ACTIVITY_LEVELS.map((a) => ({ value: a.value, label: `${a.label} – ${a.hint}` }))}
      />
    </>
  );

  const results = !(tdee > 0) ? (
    <EmptyState />
  ) : (
    <>
      <ResultHero
        label="Calories to maintain your weight"
        value={`${number(tdee)} kcal`}
        sub={`per day · ${number(kcalToKj(tdee))} kJ`}
      />
      <Panel title="Daily calories for your goal">
        <ul className="grid gap-2">
          {GOALS.map((g) => {
            const kcal = tdee + g.delta;
            const low = kcal < floor;
            return (
              <li
                key={g.label}
                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
                  g.delta === 0 ? 'bg-accent-soft' : 'bg-accent-soft/30'
                }`}
              >
                <span className="flex items-center gap-2 font-bold text-ink">
                  <span aria-hidden>{g.emoji}</span> {g.label}
                </span>
                <span className="text-right">
                  <span className={`text-lg font-black ${low ? 'text-amber-600 dark:text-amber-400' : 'text-ink'}`}>
                    {number(kcal)}
                  </span>
                  <span className="ml-1 text-xs font-bold text-muted">kcal</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
      <StatGrid>
        <Stat label="BMR (at rest)" value={`${number(base)} kcal`} />
        <Stat label="Activity burn" value={`${number(tdee - base)} kcal`} />
      </StatGrid>
      {tdee - 500 < floor && (
        <Notice tone="warn">
          Eating under about {number(floor)} kcal a day makes it hard to get enough nutrients. Talk to a doctor or
          dietitian before cutting this low.
        </Notice>
      )}
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What is TDEE?', 'Total Daily Energy Expenditure: everything you burn in a day, including your resting metabolism, digestion and activity. Eating this much keeps your weight steady.'],
          ['Why kcal and kJ?', 'Most countries label food in kilocalories (kcal, often just called “calories”). Australia, New Zealand and parts of Europe use kilojoules (kJ). 1 kcal = 4.184 kJ.'],
          ['How accurate is it?', 'Most people land within about 10% of the estimate. Track your weight for a few weeks and adjust up or down if needed.'],
        ]}
      >
        <p>
          We estimate your resting burn (<strong>BMR</strong>) with the Mifflin–St Jeor equation, then multiply it by an{' '}
          <strong>activity factor</strong> to get your total daily needs.
        </p>
        <p>
          A deficit of about 500 kcal a day leads to roughly 0.5 kg (1 lb) of weight loss a week. Slower changes are
          easier to sustain.
        </p>
      </About>
    </>
  );
}
