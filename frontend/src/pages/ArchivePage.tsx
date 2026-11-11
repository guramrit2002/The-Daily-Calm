import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getArchiveMonth } from "../api/client";
import type { ArchiveMonth } from "../api/types";
import { isMonth } from "../dates";
import { editionBase } from "../format";

type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; archive: ArchiveMonth };

const monthLabel = (month: string) =>
  new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${month}-01T00:00:00Z`),
  );

const dayLabel = (date: string) => {
  const d = new Date(`${date}T00:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" }).format(d),
    day: d.getUTCDate(),
  };
};

/** Past editions, one month per page. Older months are reached by turning pages, never by endless scrolling. */
export function ArchivePage() {
  const [params] = useSearchParams();
  const requested = params.get("month");
  const month = requested && isMonth(requested) ? requested : undefined;

  const [state, setState] = useState<State>({ status: "loading" });
  const [loadedFor, setLoadedFor] = useState(month);
  if (loadedFor !== month) {
    setLoadedFor(month);
    setState({ status: "loading" });
  }

  useEffect(() => {
    let active = true;
    getArchiveMonth(month)
      .then((archive) => {
        if (active) setState({ status: "ready", archive });
      })
      .catch((err: unknown) => {
        if (active) setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
      });
    window.scrollTo(0, 0);
    return () => {
      active = false;
    };
  }, [month]);

  return (
    <section className="archive" aria-labelledby="archive-title">
      <h1 id="archive-title" className="section-page__title archive__title">
        Archive
      </h1>

      {state.status === "loading" && <p className="notice">Fetching the archive.</p>}
      {state.status === "error" && (
        <p className="notice">
          The archive couldn't be loaded ({state.message}). Check your connection and reload the page.
        </p>
      )}
      {state.status === "ready" && <ArchiveMonthView archive={state.archive} />}
    </section>
  );
}

function ArchiveMonthView({ archive }: { archive: ArchiveMonth }) {
  const { month, editions, prevMonth, nextMonth } = archive;
  return (
    <>
      <nav className="archive__months" aria-label="Months">
        <span>{prevMonth && <Link to={`/archive?month=${prevMonth}`}>Earlier: {monthLabel(prevMonth)}</Link>}</span>
        <h2 className="archive__month">{monthLabel(month)}</h2>
        <span>{nextMonth && <Link to={`/archive?month=${nextMonth}`}>Later: {monthLabel(nextMonth)}</Link>}</span>
      </nav>

      {editions.length === 0 ? (
        <p className="notice">
          No editions were published in {monthLabel(month)}.{" "}
          {prevMonth || nextMonth ? "Try another month above." : <Link to="/">Read today's paper</Link>}
        </p>
      ) : (
        <ol className="archive__list">
          {editions.map((e) => {
            const { weekday, day } = dayLabel(e.date);
            return (
              <li key={e.date}>
                <Link to={editionBase(e.date)} className="archive__row">
                  <span className="archive__day">{day}</span>
                  <span className="archive__weekday">{weekday}</span>
                  <span className="archive__headline">{e.leadHeadline}</span>
                  <span className="archive__number">No. {e.number}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
