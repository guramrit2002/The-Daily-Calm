import type { Grid } from "./api/types";

export type Cell = { r: number; c: number };

export const sameBox = (a: Cell, b: Cell): boolean =>
  Math.floor(a.r / 3) === Math.floor(b.r / 3) && Math.floor(a.c / 3) === Math.floor(b.c / 3);

/** Keys ("row-col") of filled cells whose digit repeats in the same row, column or box. */
export function findConflicts(grid: Grid): Set<string> {
  const out = new Set<string>();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (!v) continue;
      for (let r2 = 0; r2 < 9; r2++) {
        for (let c2 = 0; c2 < 9; c2++) {
          if ((r2 === r && c2 === c) || grid[r2][c2] !== v) continue;
          if (r2 === r || c2 === c || sameBox({ r, c }, { r: r2, c: c2 })) out.add(`${r}-${c}`);
        }
      }
    }
  }
  return out;
}
