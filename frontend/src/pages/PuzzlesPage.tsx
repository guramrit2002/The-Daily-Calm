import { useEffect, useState } from "react";
import { getTodaySudoku } from "../api/client";
import type { SudokuPuzzle } from "../api/types";
import { Sudoku } from "../components/Sudoku";
import { formatEditionDate } from "../format";

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; puzzle: SudokuPuzzle };

const DIFFICULTY_LABEL: Record<SudokuPuzzle["difficulty"], string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function PuzzlesPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getTodaySudoku()
      .then((puzzle) => {
        if (active) setState({ status: "ready", puzzle });
      })
      .catch((err: unknown) => {
        if (active) setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
      });
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") return <p className="notice">Fetching today's puzzle.</p>;
  if (state.status === "error")
    return (
      <p className="notice">
        Today's puzzle couldn't be loaded ({state.message}). Check your connection and reload the page.
      </p>
    );

  const { puzzle } = state;
  return (
    <>
      <div className="dateline">
        <span>{formatEditionDate(puzzle.date)}</span>
        <span>{DIFFICULTY_LABEL[puzzle.difficulty]}</span>
      </div>

      <section className="puzzle-page" aria-labelledby="puzzle-title">
        <header className="puzzle-page__head">
          <h1 id="puzzle-title" className="section-page__title">
            Sudoku
          </h1>
          <p className="puzzle-page__rules">
            Fill every row, column and 3×3 box with the numbers 1 to 9, each used once. Pick a square, then type a
            number or use the pad.
          </p>
        </header>
        <Sudoku puzzle={puzzle} />
      </section>
    </>
  );
}
