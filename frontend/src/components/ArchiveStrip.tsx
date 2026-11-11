import { Link } from "react-router-dom";
import { monthOf } from "../dates";

/** Marks a page as a past edition and links back to its month in the archive. */
export function ArchiveStrip({ date }: { date: string }) {
  const month = monthOf(date);
  const label = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${month}-01T00:00:00Z`),
  );
  return (
    <p className="archive-strip">
      From the archive. <Link to={`/archive?month=${month}`}>Back to {label}</Link>
    </p>
  );
}
