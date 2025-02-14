export function addMonthsToDate(startDate, monthsToAdd) {
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    return null;
  }
  date.setMonth(date.getMonth() + monthsToAdd);
  return date;
}
