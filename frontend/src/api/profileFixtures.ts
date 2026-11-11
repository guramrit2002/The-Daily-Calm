// Sample reader history for building the Profile page before the backend
// (and sign-in) exist. Streaks and totals are computed from the history so
// the numbers always agree with the calendar.
import { addDays, addMonths, firstDayOf, lastDayOf, monthOf } from "../dates";
import { FIRST_SAMPLE_DATE } from "./archiveFixtures";
import { sampleEdition } from "./fixtures";
import type { ReaderProfile, ReadingDay, ReadingMonth, SudokuOutcome } from "./types";

const TODAY = sampleEdition.date;
const MEMBER_SINCE = FIRST_SAMPLE_DATE;
const MISSED = new Set(["2026-10-05", "2026-10-14", "2026-10-15", "2026-10-27", "2026-11-03"]);
const READ_TODAY = false; // it's morning; today's paper hasn't been finished yet

function sampleDay(date: string): ReadingDay {
  const read = date === TODAY ? READ_TODAY : !MISSED.has(date);
  const n = Number(date.slice(8));
  let sudoku: SudokuOutcome = null;
  if (date !== TODAY) {
    if (n % 7 === 0) sudoku = "revealed";
    else if (n % 3 !== 0) sudoku = "solved";
  }
  return { date, read, sudoku };
}

function allDays(): ReadingDay[] {
  const days: ReadingDay[] = [];
  for (let d = MEMBER_SINCE; d <= TODAY; d = addDays(d, 1)) days.push(sampleDay(d));
  return days;
}

export function sampleProfile(): ReaderProfile {
  const days = allDays();

  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.read ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  // Current streak ends today if today is read, otherwise yesterday.
  let current = 0;
  let i = days.length - 1;
  if (!days[i].read) i -= 1;
  while (i >= 0 && days[i].read) {
    current += 1;
    i -= 1;
  }

  const readDays = days.filter((d) => d.read);
  return {
    memberSince: MEMBER_SINCE,
    streak: { current, longest, lastCompletedDate: readDays[readDays.length - 1]?.date ?? null },
    readToday: READ_TODAY,
    totals: {
      editionsRead: readDays.length,
      sudokuSolved: days.filter((d) => d.sudoku === "solved").length,
      sudokuRevealed: days.filter((d) => d.sudoku === "revealed").length,
    },
  };
}

export function sampleReadingMonth(month?: string): ReadingMonth {
  const m = month ?? monthOf(TODAY);
  const days: ReadingDay[] = [];
  for (let d = firstDayOf(m); d <= lastDayOf(m); d = addDays(d, 1)) {
    if (d >= MEMBER_SINCE && d <= TODAY) days.push(sampleDay(d));
  }
  const prev = addMonths(m, -1);
  const next = addMonths(m, 1);
  return {
    month: m,
    days,
    prevMonth: lastDayOf(prev) >= MEMBER_SINCE ? prev : null,
    nextMonth: firstDayOf(next) <= TODAY ? next : null,
  };
}
