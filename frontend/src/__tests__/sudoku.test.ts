import { describe, expect, it } from "vitest";
import { submitSudoku } from "../api/client";
import { sampleSudoku, sampleSudokuSolution } from "../api/puzzleFixtures";
import type { Grid } from "../api/types";
import { findConflicts } from "../sudoku";

const clone = (g: Grid): Grid => g.map((row) => [...row]);

describe("sample sudoku", () => {
  it("has givens that agree with the solution", () => {
    sampleSudoku.givens.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v) expect(v).toBe(sampleSudokuSolution[r][c]);
      }),
    );
  });

  it("has a valid solution with no conflicts", () => {
    expect(findConflicts(sampleSudokuSolution).size).toBe(0);
    for (const row of sampleSudokuSolution) expect([...row].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("findConflicts", () => {
  it("flags repeats in a row, column and box", () => {
    const g = clone(sampleSudoku.givens);
    g[0][4] = 7; // row 0 already has a 7 at (0,0); box 1 has a 7 at (2,3)
    expect(findConflicts(g)).toEqual(new Set(["0-0", "0-4", "2-3"]));
  });
});

describe("mock sudoku check (fixtures mode)", () => {
  it("counts wrong and empty cells without revealing the solution", async () => {
    const g = clone(sampleSudoku.givens);
    g[0][1] = 9; // correct
    g[0][4] = 1; // wrong (solution is 5)
    const res = await submitSudoku(sampleSudoku.id, { grid: g });
    expect(res).toMatchObject({ solved: false, wrongCells: 1, emptyCells: 49, solution: null });
  });

  it("returns the solution once solved", async () => {
    const res = await submitSudoku(sampleSudoku.id, { grid: clone(sampleSudokuSolution) });
    expect(res.solved).toBe(true);
    expect(res.solution).toEqual(sampleSudokuSolution);
  });

  it("returns the solution on reveal", async () => {
    const res = await submitSudoku(sampleSudoku.id, { reveal: true });
    expect(res.solution).toEqual(sampleSudokuSolution);
  });
});
