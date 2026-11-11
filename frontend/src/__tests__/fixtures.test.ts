import { describe, expect, it } from "vitest";
import { sampleArchiveMonth, sampleEditionFor } from "../api/archiveFixtures";
import { sampleEdition } from "../api/fixtures";
import { sampleProfile, sampleReadingMonth } from "../api/profileFixtures";
import { CATEGORY_ORDER, storiesIn } from "../format";

describe("sample edition", () => {
  it("has 20 stories, 5 in each category", () => {
    expect(sampleEdition.stories).toHaveLength(20);
    for (const cat of CATEGORY_ORDER) expect(storiesIn(sampleEdition, cat)).toHaveLength(5);
  });

  it("keeps summaries within 40–100 words", () => {
    for (const s of sampleEdition.stories) {
      const words = s.summary.split(/\s+/).length;
      expect(words, s.headline).toBeGreaterThanOrEqual(40);
      expect(words, s.headline).toBeLessThanOrEqual(100);
    }
  });
});

describe("sample archive", () => {
  it("excludes today and lists newest first", () => {
    const nov = sampleArchiveMonth("2026-11");
    expect(nov.editions[0].date).toBe("2026-11-11");
    expect(nov.editions.some((e) => e.date === sampleEdition.date)).toBe(false);
    expect(nov.nextMonth).toBeNull();
    expect(nov.prevMonth).toBe("2026-10");
  });

  it("stops at the first edition", () => {
    const oct = sampleArchiveMonth("2026-10");
    expect(oct.editions).toHaveLength(31);
    expect(oct.prevMonth).toBeNull();
    expect(sampleEditionFor("2026-10-01")?.prevDate).toBeNull();
    expect(sampleEditionFor("2026-09-30")).toBeNull();
  });

  it("lead headline matches the edition's first story", () => {
    const entry = sampleArchiveMonth("2026-11").editions[1];
    expect(sampleEditionFor(entry.date)?.stories[0].headline).toBe(entry.leadHeadline);
  });
});

describe("sample profile", () => {
  it("agrees with the reading history", () => {
    const profile = sampleProfile();
    const days = [...sampleReadingMonth("2026-10").days, ...sampleReadingMonth("2026-11").days];
    expect(profile.totals.editionsRead).toBe(days.filter((d) => d.read).length);
    expect(profile.streak).toMatchObject({ current: 8, longest: 11, lastCompletedDate: "2026-11-11" });
  });
});
