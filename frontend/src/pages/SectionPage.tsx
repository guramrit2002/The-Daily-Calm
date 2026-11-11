import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEdition } from "../api/useEdition";
import { ArchiveStrip } from "../components/ArchiveStrip";
import { EditionHeader, EditionStatus, StoryItem } from "../components/EditionView";
import { isDate } from "../dates";
import { CATEGORY_LABEL, editionBase, editionCategories, isCategory, storiesIn } from "../format";

/** One section of an edition: today's (/section/:category) or a past one (/archive/:date/section/:category). */
export function SectionPage() {
  const { category = "", date } = useParams();
  const validDate = date === undefined || isDate(date);
  const state = useEdition(validDate ? date : "invalid");
  const base = editionBase(date);

  const { hash } = useLocation();
  const ready = state.status === "ready";

  // Start each section at the top, like turning a page, unless the link
  // points at a story (#story-12 from a front-page headline). Wait until the
  // stories have rendered so the target exists.
  useEffect(() => {
    if (!ready) return;
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ behavior: "instant" });
    else window.scrollTo(0, 0);
  }, [category, date, hash, ready]);

  if (!validDate)
    return (
      <p className="notice">
        "{date}" isn't a date. <Link to="/archive">Browse the archive</Link>.
      </p>
    );
  if (state.status !== "ready") return <EditionStatus state={state} date={date} />;
  const { edition } = state;
  const strip = date ? <ArchiveStrip date={date} /> : null;

  const sections = editionCategories(edition);
  if (!isCategory(category) || !sections.includes(category)) {
    return (
      <>
        {strip}
        <EditionHeader edition={edition} base={base} />
        <p className="notice">
          This paper has no section called "{category}". <Link to={base || "/"}>Go to the front page</Link>.
        </p>
      </>
    );
  }

  const index = sections.indexOf(category);
  const prev = sections[index - 1];
  const next = sections[index + 1];
  const [lead, ...rest] = storiesIn(edition, category);

  return (
    <>
      {strip}
      <EditionHeader edition={edition} base={base} />

      <section className="section-page" aria-labelledby="section-title">
        <h1 id="section-title" className="section-page__title">
          {CATEGORY_LABEL[category]}
        </h1>
        <StoryItem story={lead} lead />
        {rest.length > 0 && (
          <div className="section-page__stories">
            {rest.map((s) => (
              <StoryItem key={s.id} story={s} lead={false} />
            ))}
          </div>
        )}
      </section>

      <nav className="page-turn" aria-label="Other sections">
        <span>{prev && <Link to={`${base}/section/${prev}`}>Previous: {CATEGORY_LABEL[prev]}</Link>}</span>
        <span>
          {next ? (
            <Link to={`${base}/section/${next}`}>Next: {CATEGORY_LABEL[next]}</Link>
          ) : date ? (
            <>
              That's the last section. <Link to={base}>Back to the front page</Link>
            </>
          ) : (
            <>
              That's the last section. <Link to="/puzzles">Try today's puzzle</Link>
            </>
          )}
        </span>
      </nav>
    </>
  );
}
