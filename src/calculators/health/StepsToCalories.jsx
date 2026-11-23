import { useState } from 'react';
import { useSettings } from '../../lib/settings';
import { WALKING_PACES, stepsToCalories } from '../../lib/health';
import {
  About, CalcLayout, EmptyState, HeightField, NumberField, Panel, ResultHero, Segmented, Stat, StatGrid,
  UnitsToggle, WeightField, makeHeight, makeWeight, num,
} from '../../components/ui';

const KM_PER_MI = 1.609344;

export default function StepsToCalories() {
  const { number, imperial } = useSettings();
  const [steps, setSteps] = useState('10000');
  const [height, setHeight] = useState(makeHeight(170));
  const [weight, setWeight] = useState(makeWeight(70));
  const [pace, setPace] = useState('moderate');

  const r = stepsToCalories({ steps: num(steps), cm: num(height.cm), kg: num(weight.kg), pace });
  const dist = (km) => (imperial ? `${number(km / KM_PER_MI, 2)} mi` : `${number(km, 2)} km`);

  const inputs = (
    <>
      <NumberField label="Steps" value={steps} onChange={setSteps} step="100" />
      <Segmented
        label="Walking pace"
        value={pace}
        onChange={setPace}
        options={WALKING_PACES.map((p) => ({ value: p.value, label: p.label }))}
      />
      <UnitsToggle />
      <HeightField value={height} onChange={setHeight} />
      <WeightField value={weight} onChange={setWeight} />
    </>
  );

  const minutes = r ? Math.round(r.minutes) : 0;
  const results = !r ? (
    <EmptyState />
  ) : (
    <>
      <ResultHero label="Calories burned" value={`${number(r.kcal)} kcal`} sub={`from ${number(num(steps))} steps 👟`} />
      <StatGrid>
        <Stat label="Distance" value={dist(r.km)} />
        <Stat label="Walking time" value={minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`} />
        <Stat label="Stride length" value={imperial ? `${number(r.strideM * 39.37, 0)} in` : `${number(r.strideM * 100, 0)} cm`} />
      </StatGrid>
      <Panel title="Popular step goals">
        <ul className="grid gap-2">
          {[5000, 7500, 10000, 15000].map((s) => {
            const x = stepsToCalories({ steps: s, cm: num(height.cm), kg: num(weight.kg), pace });
            return (
              <li key={s} className="flex items-center justify-between rounded-2xl bg-accent-soft/30 px-4 py-3 font-bold">
                <span className="text-ink">{number(s)} steps</span>
                <span className="text-muted">
                  {dist(x.km)} · <span className="font-black text-ink">{number(x.kcal)} kcal</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['Do I need 10,000 steps a day?', 'Not necessarily. Research suggests health benefits start well below that, around 6,000–8,000 steps for many adults, and more is generally better.'],
          ['Why does weight matter?', 'Moving a heavier body takes more energy, so the same walk burns more calories for a heavier person.'],
        ]}
      >
        <p>
          We estimate your <strong>stride length</strong> as about 41% of your height, work out the distance, and then
          use MET values from the Compendium of Physical Activities for your <strong>pace</strong>.
        </p>
        <p>
          Calories = MET × weight (kg) × hours walked. Hills, stairs and carrying a bag will burn more.
        </p>
      </About>
    </>
  );
}
