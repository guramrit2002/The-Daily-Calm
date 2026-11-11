import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { submitSudoku } from "../api/client";
import type { Grid, SudokuPuzzle, SudokuResult } from "../api/types";
import { findConflicts, sameBox } from "../sudoku";
import type { Cell } from "../sudoku";

type Status = "playing" | "checking" | "solved" | "revealed";

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const cloneGrid = (g: Grid): Grid => g.map((row) => [...row]);

// Progress lives in this browser only. Storage can be missing or blocked
// (private windows), so every access is wrapped and failure is harmless.
function loadSaved(puzzle: SudokuPuzzle): Grid | null {
  try {
    const raw = localStorage.getItem(`sudoku:${puzzle.id}`);
    const g = raw ? (JSON.parse(raw) as Grid) : null;
    return g && g.length === 9 && g.every((row) => row.length === 9) ? g : null;
  } catch {
    return null;
  }
}

function save(puzzle: SudokuPuzzle, grid: Grid) {
  try {
    localStorage.setItem(`sudoku:${puzzle.id}`, JSON.stringify(grid));
  } catch {
    /* ignore */
  }
}

export function Sudoku({ puzzle }: { puzzle: SudokuPuzzle }) {
  const [grid, setGrid] = useState<Grid>(() => loadSaved(puzzle) ?? cloneGrid(puzzle.givens));
  const [selected, setSelected] = useState<Cell | null>(null);
  const [status, setStatus] = useState<Status>("playing");
  const [result, setResult] = useState<SudokuResult | null>(null);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isGiven = (r: number, c: number) => puzzle.givens[r][c] !== 0;
  const locked = status === "solved" || status === "revealed";
  const conflicts = useMemo(() => findConflicts(grid), [grid]);
  const emptyCount = grid.flat().filter((v) => v === 0).length;

  useEffect(() => {
    if (status === "playing") save(puzzle, grid);
  }, [grid, puzzle, status]);

  function setDigit(value: number) {
    if (!selected || locked || isGiven(selected.r, selected.c)) return;
    setGrid((g) => {
      const next = cloneGrid(g);
      next[selected.r][selected.c] = value;
      return next;
    });
    setResult(null); // an earlier check no longer applies
  }

  function moveTo(r: number, c: number) {
    const cell = { r: (r + 9) % 9, c: (c + 9) % 9 };
    setSelected(cell);
    cellRefs.current[cell.r * 9 + cell.c]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!selected) return;
    const { r, c } = selected;
    if (/^[1-9]$/.test(e.key)) setDigit(Number(e.key));
    else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") setDigit(0);
    else if (e.key === "ArrowUp") moveTo(r - 1, c);
    else if (e.key === "ArrowDown") moveTo(r + 1, c);
    else if (e.key === "ArrowLeft") moveTo(r, c - 1);
    else if (e.key === "ArrowRight") moveTo(r, c + 1);
    else return;
    e.preventDefault();
  }

  async function check() {
    setStatus("checking");
    setError(null);
    try {
      const res = await submitSudoku(puzzle.id, { grid });
      setResult(res);
      setStatus(res.solved ? "solved" : "playing");
      if (res.solved) setSelected(null);
    } catch (err) {
      setStatus("playing");
      setError(`The puzzle couldn't be checked (${err instanceof Error ? err.message : String(err)}). Try again.`);
    }
  }

  async function reveal() {
    setConfirmReveal(false);
    setError(null);
    try {
      const res = await submitSudoku(puzzle.id, { reveal: true });
      if (res.solution) setGrid(cloneGrid(res.solution));
      setResult(res);
      setStatus("revealed");
      setSelected(null);
    } catch (err) {
      setError(`The solution couldn't be loaded (${err instanceof Error ? err.message : String(err)}). Try again.`);
    }
  }

  function startOver() {
    setGrid(cloneGrid(puzzle.givens));
    setResult(null);
    setStatus("playing");
  }

  return (
    <div className="sudoku">
      <div
        className={`sudoku__grid${locked ? " sudoku__grid--locked" : ""}`}
        role="grid"
        aria-label="Sudoku grid"
        onKeyDown={onKeyDown}
      >
        {grid.map((row, r) => (
          <div role="row" key={r} className="sudoku__row">
            {row.map((value, c) => {
              const given = isGiven(r, c);
              const sel = selected?.r === r && selected?.c === c;
              const peer =
                !!selected && !sel && (selected.r === r || selected.c === c || sameBox(selected, { r, c }));
              const sameDigit = !!selected && !sel && value !== 0 && grid[selected.r][selected.c] === value;
              const classes = [
                "sudoku__cell",
                given && "is-given",
                !given && status === "revealed" && "is-revealed",
                sel && "is-selected",
                peer && "is-peer",
                sameDigit && "is-same",
                conflicts.has(`${r}-${c}`) && !locked && "is-conflict",
                c % 3 === 2 && c < 8 && "box-right",
                r % 3 === 2 && r < 8 && "box-bottom",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={c}
                  type="button"
                  role="gridcell"
                  ref={(el) => {
                    cellRefs.current[r * 9 + c] = el;
                  }}
                  className={classes}
                  aria-selected={sel}
                  aria-label={`Row ${r + 1}, column ${c + 1}, ${value || "empty"}${given ? ", given" : ""}`}
                  tabIndex={sel || (!selected && r === 0 && c === 0) ? 0 : -1}
                  onClick={() => setSelected({ r, c })}
                  disabled={locked}
                >
                  {value || ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sudoku__side">
        {!locked && (
          <div className="sudoku__pad" aria-label="Number pad">
            {DIGITS.map((d) => (
              <button key={d} type="button" onClick={() => setDigit(d)} disabled={!selected}>
                {d}
              </button>
            ))}
            <button type="button" className="sudoku__erase" onClick={() => setDigit(0)} disabled={!selected}>
              Erase
            </button>
          </div>
        )}

        <div className="sudoku__status" aria-live="polite">
          {status === "solved" && (
            <>
              <p className="sudoku__verdict">Solved.</p>
              <p>That's today's puzzle done. A new one arrives with tomorrow's paper.</p>
            </>
          )}
          {status === "revealed" && (
            <>
              <p className="sudoku__verdict">Here's the solution.</p>
              <p>A new puzzle arrives with tomorrow's paper.</p>
            </>
          )}
          {status !== "solved" && status !== "revealed" && result && (
            <p>
              {result.wrongCells === 0
                ? `Everything so far is right. ${result.emptyCells} ${result.emptyCells === 1 ? "square is" : "squares are"} still empty.`
                : `${result.wrongCells} ${result.wrongCells === 1 ? "square doesn't" : "squares don't"} match the solution${
                    result.emptyCells ? `, and ${result.emptyCells} ${result.emptyCells === 1 ? "is" : "are"} still empty` : ""
                  }.`}
            </p>
          )}
          {!result && status === "playing" && (
            <p>
              {emptyCount} {emptyCount === 1 ? "square" : "squares"} left to fill.
            </p>
          )}
          {error && <p className="sudoku__error">{error}</p>}
        </div>

        <div className="sudoku__actions">
          {!locked && (
            <button type="button" className="button" onClick={check} disabled={status === "checking"}>
              {status === "checking" ? "Checking…" : "Check puzzle"}
            </button>
          )}
          {!locked && !confirmReveal && (
            <button type="button" className="button button--quiet" onClick={() => setConfirmReveal(true)}>
              Reveal solution
            </button>
          )}
          {!locked && confirmReveal && (
            <span className="sudoku__confirm">
              Show the full solution?{" "}
              <button type="button" className="button button--quiet" onClick={reveal}>
                Show it
              </button>{" "}
              <button type="button" className="button button--quiet" onClick={() => setConfirmReveal(false)}>
                Keep solving
              </button>
            </span>
          )}
          {status === "playing" && emptyCount < 81 - puzzle.givens.flat().filter(Boolean).length && (
            <button type="button" className="button button--quiet" onClick={startOver}>
              Clear my entries
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
