// Calendar-date helpers for YYYY-MM-DD and YYYY-MM strings. Dates are treated
// as plain calendar days (computed in UTC), never as instants, so the browser's
// own time zone can't shift them.

const DAY_MS = 86_400_000;

const toUtc = (date: string): number => Date.parse(`${date}T00:00:00Z`);
const fromUtc = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

export function addDays(date: string, days: number): string {
  return fromUtc(toUtc(date) + days * DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

export const monthOf = (date: string): string => date.slice(0, 7);

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export const firstDayOf = (month: string): string => `${month}-01`;
export const lastDayOf = (month: string): string => addDays(firstDayOf(addMonths(month, 1)), -1);

export const isDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toUtc(value));
export const isMonth = (value: string): boolean => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
