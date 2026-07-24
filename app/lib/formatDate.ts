// Formats a "YYYY-MM-DD" string as a local calendar date without the
// off-by-one that `new Date("2025-07-15")` causes in timezones behind
// UTC (it parses as UTC midnight, which can display as the day before).
export function formatDateOnly(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
