import type { Category, Edition, Story } from "./api/types";

export const PRODUCT_TZ = "Asia/Kolkata";

export const CATEGORY_ORDER: Category[] = ["india", "world", "tech", "sports"];

export const CATEGORY_LABEL: Record<Category, string> = {
  india: "India",
  world: "World",
  tech: "Tech",
  sports: "Sports",
};

export function isCategory(value: string): value is Category {
  return (CATEGORY_ORDER as string[]).includes(value);
}

/** "Thursday, 12 November 2026" for a YYYY-MM-DD edition date. */
export function formatEditionDate(date: string): string {
  // Noon UTC keeps the calendar day stable when rendered in Asia/Kolkata.
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: PRODUCT_TZ,
  }).format(new Date(`${date}T12:00:00Z`));
}

/** Reading time in whole minutes at ~200 words per minute. */
export function readingMinutes(stories: Story[]): number {
  const words = stories.reduce((n, s) => n + s.summary.split(/\s+/).length, 0);
  return Math.max(1, Math.round(words / 200));
}

export function editionCategories(edition: Edition): Category[] {
  return CATEGORY_ORDER.filter((cat) => edition.stories.some((s) => s.category === cat));
}

export function storiesIn(edition: Edition, cat: Category): Story[] {
  return edition.stories.filter((s) => s.category === cat);
}

/**
 * Where an edition's pages live: "" for today (/, /section/india) or
 * "/archive/2026-11-10" for a past edition.
 */
export const editionBase = (date?: string): string => (date ? `/archive/${date}` : "");
