// Sample archive for building the UI before the backend exists.
//
// Every day from FIRST_SAMPLE_DATE up to today has an edition. Past editions
// reuse the sample stories, rotated within each section by edition number so
// each day leads with a different headline.
import { addDays, addMonths, daysBetween, firstDayOf, lastDayOf, monthOf } from "../dates";
import { CATEGORY_ORDER } from "../format";
import { sampleEdition } from "./fixtures";
import type { ArchiveMonth, Edition } from "./types";

export const FIRST_SAMPLE_DATE = "2026-10-01";
const TODAY = sampleEdition.date;

export const editionNumberFor = (date: string): number => daysBetween(FIRST_SAMPLE_DATE, date) + 1;

/** The sample edition for a date, or null if there is none. */
export function sampleEditionFor(date: string): Edition | null {
  if (date < FIRST_SAMPLE_DATE || date > TODAY) return null;
  if (date === TODAY) return sampleEdition;
  const number = editionNumberFor(date);
  const stories = CATEGORY_ORDER.flatMap((cat) => {
    const inCat = sampleEdition.stories.filter((s) => s.category === cat);
    const k = number % inCat.length;
    return [...inCat.slice(k), ...inCat.slice(0, k)];
  });
  return {
    date,
    number,
    stories,
    prevDate: date > FIRST_SAMPLE_DATE ? addDays(date, -1) : null,
    nextDate: addDays(date, 1),
  };
}

/** Archive listing for a month (defaults to the month of the latest past edition). */
export function sampleArchiveMonth(month?: string): ArchiveMonth {
  const latest = addDays(TODAY, -1);
  const m = month ?? monthOf(latest);
  const editions = [];
  for (let d = lastDayOf(m); d >= firstDayOf(m); d = addDays(d, -1)) {
    if (d < FIRST_SAMPLE_DATE || d > latest) continue;
    const edition = sampleEditionFor(d);
    if (edition) editions.push({ date: d, number: edition.number, leadHeadline: edition.stories[0].headline });
  }
  const prev = addMonths(m, -1);
  const next = addMonths(m, 1);
  return {
    month: m,
    editions,
    prevMonth: lastDayOf(prev) >= FIRST_SAMPLE_DATE ? prev : null,
    nextMonth: firstDayOf(next) <= latest ? next : null,
  };
}
