import { useEffect, useState } from "react";
import { getEdition, getTodayEdition, isNotFound } from "./client";
import type { Edition } from "./types";

export type EditionState =
  | { status: "loading" }
  | { status: "missing" } // no edition exists for that date
  | { status: "error"; message: string }
  | { status: "ready"; edition: Edition };

/** Loads today's edition, or a past one when `date` (YYYY-MM-DD) is given. */
export function useEdition(date?: string): EditionState {
  const [state, setState] = useState<EditionState>({ status: "loading" });
  const [loadedFor, setLoadedFor] = useState(date);

  // Switching dates shows the loading state instead of the previous edition.
  if (loadedFor !== date) {
    setLoadedFor(date);
    setState({ status: "loading" });
  }

  useEffect(() => {
    let active = true;
    (date ? getEdition(date) : getTodayEdition())
      .then((edition) => {
        if (active) setState({ status: "ready", edition });
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (isNotFound(err)) setState({ status: "missing" });
        else setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
      });
    return () => {
      active = false;
    };
  }, [date]);

  return state;
}
