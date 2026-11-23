/** Parse "YYYY-MM-DD" as a local date (avoids the UTC off-by-one of new Date(string)). */
export function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date) ? null : date;
}

export function toInputDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const today = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

/** Add months, clamping to the end of the month (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date, months) {
  const total = date.getMonth() + months;
  const y = date.getFullYear() + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return new Date(y, m, Math.min(date.getDate(), daysInMonth(y, m)));
}

/** Calendar difference in years, months and days. */
export function diffYMD(from, to) {
  if (!from || !to || to < from) return null;
  // Whole months first (anchored with end-of-month clamping), then leftover days.
  let total = (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth();
  if (addMonths(from, total) > to) total -= 1;
  const days = daysBetween(addMonths(from, total), to);
  return { years: Math.floor(total / 12), months: total % 12, days };
}

export function daysBetween(from, to) {
  return Math.round((to - from) / 86400000);
}

/** Next birthday on or after `from`. 29 Feb birthdays fall on 28 Feb in non-leap years. */
export function nextBirthday(dob, from) {
  const make = (y) => new Date(y, dob.getMonth(), Math.min(dob.getDate(), daysInMonth(y, dob.getMonth())));
  let next = make(from.getFullYear());
  if (next < from) next = make(from.getFullYear() + 1);
  return next;
}
