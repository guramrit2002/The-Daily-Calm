import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useEdition } from "../api/useEdition";
import { ArchiveStrip } from "../components/ArchiveStrip";
import { EditionStatus, EditionView } from "../components/EditionView";
import { isDate } from "../dates";
import { editionBase, formatEditionDate } from "../format";

const shortDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

/** A past edition's front page, read-only, with links to the days either side. */
export function ArchiveEditionPage() {
  const { date = "" } = useParams();
  const valid = isDate(date);
  const state = useEdition(valid ? date : "invalid");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [date]);

  if (!valid)
    return (
      <p className="notice">
        "{date}" isn't a date. <Link to="/archive">Browse the archive</Link>.
      </p>
    );
  if (state.status !== "ready") return <EditionStatus state={state} date={date} />;

  // The latest edition is today's paper, which lives at the front page.
  const { prevDate, nextDate } = state.edition;
  if (nextDate === null) return <Navigate to="/" replace />;

  return (
    <>
      <ArchiveStrip date={date} />
      <EditionView edition={state.edition} base={editionBase(date)} />
      <footer className="endnote">
        <p className="endnote__title">That's the paper for {formatEditionDate(date)}.</p>
      </footer>
      <nav className="page-turn" aria-label="Other editions">
        <span>
          {prevDate ? (
            <Link to={editionBase(prevDate)}>Previous edition: {shortDate(prevDate)}</Link>
          ) : (
            "This was the first edition."
          )}
        </span>
        <span>
          <Link to={editionBase(nextDate)}>Next edition: {shortDate(nextDate)}</Link>
        </span>
      </nav>
    </>
  );
}
