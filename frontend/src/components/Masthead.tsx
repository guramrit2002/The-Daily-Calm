import { NavLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "Today" },
  { to: "/puzzles", label: "Puzzles" },
  { to: "/archive", label: "Archive" },
  { to: "/profile", label: "Profile" },
];

export function Masthead() {
  const { pathname } = useLocation();
  // Section pages are part of today's paper, so "Today" stays highlighted there.
  const onToday = pathname === "/" || pathname.startsWith("/section/");

  return (
    <header className="masthead">
      <NavLink to="/" className="masthead__title">
        The Daily Calm
      </NavLink>
      <nav className="masthead__nav" aria-label="Main">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => ((to === "/" ? onToday : isActive) ? "active" : undefined)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
