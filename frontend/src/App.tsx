import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Masthead } from "./components/Masthead";
import { ArchiveEditionPage } from "./pages/ArchiveEditionPage";
import { ArchivePage } from "./pages/ArchivePage";
import { ProfilePage } from "./pages/ProfilePage";
import { PuzzlesPage } from "./pages/PuzzlesPage";
import { SectionPage } from "./pages/SectionPage";
import { TodayPage } from "./pages/TodayPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="paper">
        <Masthead />
        <main>
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/section/:category" element={<SectionPage />} />
            <Route path="/puzzles" element={<PuzzlesPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/archive/:date" element={<ArchiveEditionPage />} />
            <Route path="/archive/:date/section/:category" element={<SectionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
