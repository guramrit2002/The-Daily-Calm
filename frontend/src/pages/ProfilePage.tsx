import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile, getReadingMonth } from "../api/client";
import type { ReaderProfile, ReadingDay, ReadingMonth } from "../api/types";
import { addDays, firstDayOf, lastDayOf } from "../dates";
import { editionBase, formatEditionDate } from "../format";

type Load<T> = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));
const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;

const monthLabel = (month: string) =>
  new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${month}-01T00:00:00Z`),
  );

export function ProfilePage() {
  const [profile, setProfile] = useState<Load<ReaderProfile>>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getProfile()
      .then((data) => {
        if (active) setProfile({ status: "ready", data });
      })
      .catch((err: unknown) => {
        if (active) setProfile({ status: "error", message: errorMessage(err) });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="profile" aria-labelledby="profile-title">
      <h1 id="profile-title" className="section-page__title">
        Profile
      </h1>
      {profile.status === "loading" && <p className="notice">Fetching your reading record.</p>}
      {profile.status === "error" && (
        <p className="notice">
          Your reading record couldn't be loaded ({profile.message}). Check your connection and reload the page.
        </p>
      )}
      {profile.status === "ready" && (
        <>
          <Summary profile={profile.data} />
          <ReadingCalendar />
        </>
      )}
    </section>
  );
}

function Summary({ profile }: { profile: ReaderProfile }) {
  const { streak, totals, readToday, memberSince } = profile;
  return (
    <div className="profile__summary">
      <div className="profile__streak">
        <p className="profile__lede">
          {streak.current > 0 ? (
            <>You've read the paper {days(streak.current)} in a row.</>
          ) : (
            <>You're between runs at the moment.</>
          )}
        </p>
        <p className="profile__sub">
          {streak.longest > 0 && <>Your longest run is {days(streak.longest)}. </>}
          {readToday ? (
            "You've read today's paper."
          ) : (
            <>
              <Link to="/">Today's paper</Link> is there whenever you're ready.
            </>
          )}{" "}
          Missing a day is fine; the paper will be here tomorrow.
        </p>
      </div>

      <dl className="profile__facts">
        <div>
          <dt>Papers read</dt>
          <dd>{totals.editionsRead}</dd>
        </div>
        <div>
          <dt>Sudokus solved</dt>
          <dd>{totals.sudokuSolved}</dd>
        </div>
        <div>
          <dt>Solutions revealed</dt>
          <dd>{totals.sudokuRevealed}</dd>
        </div>
        <div>
          <dt>Reading since</dt>
          <dd>{formatEditionDate(memberSince).replace(/^\w+, /, "")}</dd>
        </div>
      </dl>
    </div>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ReadingCalendar() {
  const [month, setMonth] = useState<string | undefined>(undefined);
  const [state, setState] = useState<Load<ReadingMonth>>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getReadingMonth(month)
      .then((data) => {
        if (active) setState({ status: "ready", data });
      })
      .catch((err: unknown) => {
        if (active) setState({ status: "error", message: errorMessage(err) });
      });
    return () => {
      active = false;
    };
  }, [month]);

  if (state.status === "loading") return <p className="notice">Fetching your calendar.</p>;
  if (state.status === "error")
    return <p className="notice">Your calendar couldn't be loaded ({state.message}). Reload the page to try again.</p>;

  const { data } = state;
  const byDate = new Map(data.days.map((d) => [d.date, d]));
  // In the current month the last listed day is today, whose paper lives at "/".
  const today = data.nextMonth === null ? data.days[data.days.length - 1]?.date : undefined;

  // Pad the first week so the 1st lands under its weekday (weeks start Monday).
  const first = firstDayOf(data.month);
  const offset = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let d = first; d <= lastDayOf(data.month); d = addDays(d, 1)) cells.push(d);

  const go = (m: string) => {
    setState({ status: "loading" });
    setMonth(m);
  };

  return (
    <section className="calendar" aria-labelledby="calendar-title">
      <div className="archive__months">
        <span>
          {data.prevMonth && (
            <button type="button" className="link-button" onClick={() => go(data.prevMonth!)}>
              Earlier: {monthLabel(data.prevMonth)}
            </button>
          )}
        </span>
        <h2 id="calendar-title" className="archive__month">
          {monthLabel(data.month)}
        </h2>
        <span>
          {data.nextMonth && (
            <button type="button" className="link-button" onClick={() => go(data.nextMonth!)}>
              Later: {monthLabel(data.nextMonth)}
            </button>
          )}
        </span>
      </div>

      <div className="calendar__grid" role="table" aria-label={`Reading record for ${monthLabel(data.month)}`}>
        <div role="row" className="calendar__week">
          {WEEKDAYS.map((w) => (
            <span role="columnheader" key={w} className="calendar__weekday">
              {w}
            </span>
          ))}
        </div>
        {Array.from({ length: Math.ceil(cells.length / 7) }, (_, week) => (
          <div role="row" className="calendar__week" key={week}>
            {cells.slice(week * 7, week * 7 + 7).map((date, i) => (
              <DayCell key={date ?? `pad-${i}`} date={date} day={date ? byDate.get(date) : undefined} isToday={date === today} />
            ))}
          </div>
        ))}
      </div>

      <ul className="calendar__legend" aria-label="Key">
        <li>
          <span className="mark mark--read" aria-hidden="true" /> Read the paper
        </li>
        <li>
          <span className="mark mark--solved" aria-hidden="true" /> Solved the sudoku
        </li>
        <li>
          <span className="mark mark--revealed" aria-hidden="true" /> Revealed the solution
        </li>
      </ul>
    </section>
  );
}

function DayCell({ date, day, isToday }: { date: string | null; day?: ReadingDay; isToday: boolean }) {
  if (!date) return <span role="cell" className="calendar__day calendar__day--pad" />;
  const n = Number(date.slice(8));
  if (!day) {
    return (
      <span role="cell" className="calendar__day calendar__day--off">
        <span className="calendar__num">{n}</span>
      </span>
    );
  }

  const parts = [day.read ? "read" : "not read"];
  if (day.sudoku === "solved") parts.push("sudoku solved");
  if (day.sudoku === "revealed") parts.push("sudoku solution revealed");

  return (
    <span role="cell" className={isToday ? "calendar__day calendar__day--today" : "calendar__day"}>
      <Link
        to={isToday ? "/" : editionBase(date)}
        className="calendar__link"
        aria-label={`${isToday ? "Today, " : ""}${formatEditionDate(date)}: ${parts.join(", ")}`}
      >
        <span className="calendar__num">{n}</span>
        <span className="calendar__marks" aria-hidden="true">
          {day.read && <span className="mark mark--read" />}
          {day.sudoku && <span className={`mark mark--${day.sudoku}`} />}
        </span>
      </Link>
    </span>
  );
}
