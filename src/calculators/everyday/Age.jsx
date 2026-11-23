import { useState } from 'react';
import { useSettings } from '../../lib/settings';
import { daysBetween, diffYMD, nextBirthday, parseDate, toInputDate, today } from '../../lib/dates';
import { About, CalcLayout, DateField, EmptyState, Notice, ResultHero, Stat, StatGrid } from '../../components/ui';

export default function Age() {
  const { number, date } = useSettings();
  const [dob, setDob] = useState('1990-06-15');
  const [at, setAt] = useState(toInputDate(today()));

  const from = parseDate(dob);
  const to = parseDate(at);
  const age = diffYMD(from, to);

  const inputs = (
    <>
      <DateField label="Date of birth" value={dob} onChange={setDob} max={at} />
      <DateField label="Age on" hint="defaults to today" value={at} onChange={setAt} />
    </>
  );

  let results;
  if (!from || !to) results = <EmptyState>Pick a date of birth.</EmptyState>;
  else if (!age) results = <Notice tone="warn">The date of birth must be before the “age on” date.</Notice>;
  else {
    const days = daysBetween(from, to);
    const next = nextBirthday(from, to);
    const until = daysBetween(to, next);
    results = (
      <>
        <ResultHero
          label="Age"
          value={`${age.years} ${age.years === 1 ? 'year' : 'years'}`}
          sub={`${age.months} ${age.months === 1 ? 'month' : 'months'} and ${age.days} ${age.days === 1 ? 'day' : 'days'}`}
        />
        <StatGrid>
          <Stat label="Total months" value={number(age.years * 12 + age.months)} />
          <Stat label="Total weeks" value={number(Math.floor(days / 7))} />
          <Stat label="Total days" value={number(days)} />
          <Stat label="Born on a" value={date(from, { weekday: 'long' })} />
          <Stat
            label="Next birthday"
            value={until === 0 ? 'Today! 🎉' : `in ${number(until)} ${until === 1 ? 'day' : 'days'}`}
          />
          <Stat label="Turning" value={`${age.years + (until === 0 ? 0 : 1)} on ${date(next, { weekday: 'short', day: 'numeric', month: 'short' })}`} />
        </StatGrid>
      </>
    );
  }

  return (
    <>
      <CalcLayout inputs={inputs} results={results} />
      <About
        faqs={[
          ['What about people born on 29 February?', 'In years without a 29 February we count the birthday as 28 February.'],
          ['Can I find the time between any two dates?', 'Yes. Enter the earlier date as the date of birth and the later date in “Age on”.'],
        ]}
      >
        <p>
          We count whole <strong>years</strong>, then whole <strong>months</strong>, then the remaining{' '}
          <strong>days</strong>, the same way people usually state their age. Dates use your local calendar.
        </p>
      </About>
    </>
  );
}
