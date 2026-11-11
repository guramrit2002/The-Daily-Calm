import { describe, expect, it } from "vitest";
import { addDays, addMonths, daysBetween, isDate, isMonth, lastDayOf } from "../dates";

describe("dates", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts days between dates", () => {
    expect(daysBetween("2026-10-01", "2026-11-12")).toBe(42);
  });

  it("steps months and finds the last day", () => {
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(lastDayOf("2028-02")).toBe("2028-02-29");
  });

  it("validates date and month strings", () => {
    expect(isDate("2026-11-12")).toBe(true);
    expect(isDate("nope")).toBe(false);
    expect(isMonth("2026-13")).toBe(false);
    expect(isMonth("2026-09")).toBe(true);
  });
});
