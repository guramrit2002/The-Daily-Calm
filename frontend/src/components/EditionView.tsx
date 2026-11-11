import { Link, NavLink } from "react-router-dom";
import type { EditionState } from "../api/useEdition";
import type { Edition, Story } from "../api/types";
import { CATEGORY_LABEL, editionCategories, formatEditionDate, readingMinutes, storiesIn } from "../format";

export function StoryItem({ story, lead }: { story: Story; lead: boolean }) {
  return (
    <article id={`story-${story.id}`} className={lead ? "story story--lead" : "story"}>
      <h3 className="story__headline">{story.headline}</h3>
      <p className="story__summary">{story.summary}</p>
      <p className="story__sources">
        Source:{" "}
        {story.sources.map((s, i) => (
          <span key={s.url + i}>
            {i > 0 && ", "}
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
          </span>
        ))}
      </p>
    </article>
  );
}

type Props = { edition: Edition; base: string };

/** Dateline strip plus the section index (Front page, India, World, ...). */
export function EditionHeader({ edition, base }: Props) {
  const minutes = readingMinutes(edition.stories);
  return (
    <>
      <div className="dateline">
        <span>{formatEditionDate(edition.date)}</span>
        <span>No. {edition.number}</span>
        <span>
          {edition.stories.length} stories, about {minutes} min
        </span>
      </div>
      <nav className="section-index" aria-label="Sections in this edition">
        <NavLink to={base || "/"} end>
          Front page
        </NavLink>
        {editionCategories(edition).map((cat) => (
          <NavLink key={cat} to={`${base}/section/${cat}`}>
            {CATEGORY_LABEL[cat]}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

/**
 * The front page: each section shows its lead story in full and the rest as
 * headlines that open the section page at that story.
 */
export function EditionView({ edition, base }: Props) {
  return (
    <>
      <EditionHeader edition={edition} base={base} />
      <div className="sections">
        {editionCategories(edition).map((cat) => {
          const [lead, ...rest] = storiesIn(edition, cat);
          return (
            <section key={cat} className="section" aria-labelledby={`sec-${cat}`}>
              <h2 id={`sec-${cat}`} className="section__name">
                <Link to={`${base}/section/${cat}`}>{CATEGORY_LABEL[cat]}</Link>
              </h2>
              <StoryItem story={lead} lead />
              {rest.length > 0 && (
                <ul className="briefs" aria-label={`More in ${CATEGORY_LABEL[cat]}`}>
                  {rest.map((s) => (
                    <li key={s.id}>
                      <Link to={`${base}/section/${cat}#story-${s.id}`}>{s.headline}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

/** Shared loading / missing / error states for pages that show an edition. */
export function EditionStatus({
  state,
  date,
}: {
  state: Exclude<EditionState, { status: "ready" }>;
  date?: string;
}) {
  const what = date ? `The paper for ${formatEditionDate(date)}` : "Today's paper";
  if (state.status === "loading") return <p className="notice">Fetching {date ? "the paper" : "today's paper"}.</p>;
  if (state.status === "missing")
    return (
      <p className="notice">
        {date ? `There's no edition for ${formatEditionDate(date)}.` : "Today's edition isn't out yet."}{" "}
        <Link to="/archive">Browse the archive</Link>.
      </p>
    );
  return (
    <p className="notice">
      {what} couldn't be loaded ({state.message}). Check your connection and reload the page.
    </p>
  );
}
