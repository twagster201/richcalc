import { useSettings } from '../../lib/settings';
import { DataTable } from '../../components/ui';

/** Axis formatter: compact on the axis, exact in the tooltip. */
export function useMoneyAxis() {
  const { money } = useSettings();
  return (v, full) => (full ? money(v, { decimals: 0 }) : money(v, { compact: true }));
}

/** "4 years 3 months" style duration. */
export function formatDuration(months) {
  if (!Number.isFinite(months)) return 'Never';
  const m = Math.ceil(months);
  const y = Math.floor(m / 12);
  const r = m % 12;
  const parts = [];
  if (y) parts.push(`${y} ${y === 1 ? 'year' : 'years'}`);
  if (r || !y) parts.push(`${r} ${r === 1 ? 'month' : 'months'}`);
  return parts.join(' ');
}

export function YearlySchedule({ years, summary = 'Year-by-year schedule' }) {
  const { money } = useSettings();
  const m = (v) => money(v, { decimals: 0 });
  return (
    <DataTable
      summary={`📅 ${summary}`}
      columns={[
        { key: 'year', label: 'Year' },
        { key: 'payment', label: 'Paid', format: m },
        { key: 'principal', label: 'Principal', format: m },
        { key: 'interest', label: 'Interest', format: m },
        { key: 'balance', label: 'Balance', format: m },
      ]}
      rows={years}
    />
  );
}
