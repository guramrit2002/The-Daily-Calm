// Shapes returned by the backend under /api/v1/. Keep in sync with the DRF serializers.

export type Category = "india" | "world" | "tech" | "sports";

export interface SourceLink {
  name: string;
  url: string;
}

export interface Story {
  id: number;
  category: Category;
  headline: string;
  summary: string; // 60–100 words, original wording
  sources: SourceLink[];
}

export interface Edition {
  date: string; // YYYY-MM-DD, Asia/Kolkata
  number: number;
  stories: Story[]; // ordered, always finite (20 for MVP: 5 per category)
  prevDate: string | null; // previous published edition, null for the first
  nextDate: string | null; // next published edition, null for today's (latest)
}

// Puzzles. MVP has a daily sudoku only. The solution is never part of the
// puzzle shape; it only comes back from the submit endpoint.

export type Grid = number[][]; // 9x9, 0 = empty

export interface SudokuPuzzle {
  id: number;
  date: string; // edition date, YYYY-MM-DD
  type: "sudoku";
  difficulty: "easy" | "medium" | "hard";
  givens: Grid;
}

export type SudokuSubmission = { grid: Grid; reveal?: false } | { reveal: true };

export interface SudokuResult {
  solved: boolean;
  wrongCells: number; // filled cells that don't match the solution
  emptyCells: number;
  solution: Grid | null; // only when solved or revealed
}

// Archive: one month of past editions at a time (never an endless list).

export interface ArchiveEntry {
  date: string;
  number: number;
  leadHeadline: string;
}

export interface ArchiveMonth {
  month: string; // YYYY-MM
  editions: ArchiveEntry[]; // newest first; excludes today's edition
  prevMonth: string | null; // YYYY-MM, null when there is no older month
  nextMonth: string | null; // YYYY-MM, null when there is no newer archived month
}

// Reader profile. A day counts as "read" when the reader reaches the end of
// that day's paper (ReaderProgress.completed_at on the backend).

export interface ReaderProfile {
  memberSince: string; // YYYY-MM-DD
  streak: {
    current: number; // consecutive days read, ending today or yesterday
    longest: number;
    lastCompletedDate: string | null;
  };
  readToday: boolean;
  totals: {
    editionsRead: number;
    sudokuSolved: number;
    sudokuRevealed: number;
  };
}

export type SudokuOutcome = "solved" | "revealed" | null;

export interface ReadingDay {
  date: string;
  read: boolean;
  sudoku: SudokuOutcome;
}

export interface ReadingMonth {
  month: string; // YYYY-MM
  days: ReadingDay[]; // every day from membership start (or the 1st) up to today, oldest first
  prevMonth: string | null;
  nextMonth: string | null;
}
