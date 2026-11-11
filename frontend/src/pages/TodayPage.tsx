import { Link } from "react-router-dom";
import { useEdition } from "../api/useEdition";
import { EditionStatus, EditionView } from "../components/EditionView";

export function TodayPage() {
  const state = useEdition();
  if (state.status !== "ready") return <EditionStatus state={state} />;

  return (
    <>
      <EditionView edition={state.edition} base="" />
      <footer className="endnote">
        <p className="endnote__title">That's today's paper.</p>
        <p>
          The next edition arrives tomorrow at 6 am. Until then, try <Link to="/puzzles">today's puzzle</Link>.
        </p>
      </footer>
    </>
  );
}
