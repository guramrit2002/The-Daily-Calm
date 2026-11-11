// Typed API client. Until the backend exists, it serves sample fixtures.
// Set VITE_USE_FIXTURES=false to call the real API (proxied to Django in dev).
import { sampleArchiveMonth, sampleEditionFor } from "./archiveFixtures";
import { sampleEdition } from "./fixtures";
import { sampleProfile, sampleReadingMonth } from "./profileFixtures";
import { sampleSudoku, sampleSudokuSolution } from "./puzzleFixtures";
import type {
  ArchiveMonth,
  Edition,
  ReaderProfile,
  ReadingMonth,
  SudokuPuzzle,
  SudokuResult,
  SudokuSubmission,
} from "./types";

const API_BASE = "/api/v1";
const useFixtures = import.meta.env.VITE_USE_FIXTURES !== "false";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const isNotFound = (err: unknown): boolean => err instanceof ApiError && err.status === 404;

async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `${method} ${path} failed with ${res.status}`);
  }
  return (await res.json()) as T;
}

export function getTodayEdition(): Promise<Edition> {
  if (useFixtures) return Promise.resolve(sampleEdition);
  return request<Edition>("GET", "/editions/today");
}

export function getEdition(date: string): Promise<Edition> {
  if (useFixtures) {
    const edition = sampleEditionFor(date);
    return edition ? Promise.resolve(edition) : Promise.reject(new ApiError(404, `No edition for ${date}`));
  }
  return request<Edition>("GET", `/editions/${date}`);
}

/** One month of past editions; omit `month` for the most recent month. */
export function getArchiveMonth(month?: string): Promise<ArchiveMonth> {
  if (useFixtures) return Promise.resolve(sampleArchiveMonth(month));
  return request<ArchiveMonth>("GET", `/editions/archive${month ? `?month=${month}` : ""}`);
}

/** The signed-in reader's streak and totals. */
export function getProfile(): Promise<ReaderProfile> {
  if (useFixtures) return Promise.resolve(sampleProfile());
  return request<ReaderProfile>("GET", "/me");
}

/** One month of the reader's history; omit `month` for the current month. */
export function getReadingMonth(month?: string): Promise<ReadingMonth> {
  if (useFixtures) return Promise.resolve(sampleReadingMonth(month));
  return request<ReadingMonth>("GET", `/me/history${month ? `?month=${month}` : ""}`);
}

export function getTodaySudoku(): Promise<SudokuPuzzle> {
  if (useFixtures) return Promise.resolve(sampleSudoku);
  return request<SudokuPuzzle>("GET", "/puzzles/today");
}

export function submitSudoku(puzzleId: number, submission: SudokuSubmission): Promise<SudokuResult> {
  if (useFixtures) return Promise.resolve(mockCheckSudoku(submission));
  return request<SudokuResult>("POST", `/puzzles/${puzzleId}/submit`, submission);
}

// Mock server check (fixtures mode only). The real check runs on the server,
// which keeps the solution private until the puzzle is solved or revealed.
function mockCheckSudoku(submission: SudokuSubmission): SudokuResult {
  const solution = sampleSudokuSolution;
  if (submission.reveal) {
    return { solved: false, wrongCells: 0, emptyCells: 0, solution };
  }
  let wrongCells = 0;
  let emptyCells = 0;
  submission.grid.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v === 0) emptyCells += 1;
      else if (v !== solution[r][c]) wrongCells += 1;
    }),
  );
  const solved = wrongCells === 0 && emptyCells === 0;
  return { solved, wrongCells, emptyCells, solution: solved ? solution : null };
}
