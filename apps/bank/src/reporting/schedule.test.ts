import { describe, expect, it } from "vitest";
import { calendarDateInTimeZone, getNextMonthlyRun, previousCalendarMonth } from "./schedule";

describe("monthly reporting schedule", () => {
  it("handles selected days, last days, year boundaries and leap years", () => {
    expect(getNextMonthlyRun(new Date("2026-11-30T20:00:00Z"), "1", "06:00")).toBe("2026-12-01T06:00:00.000Z");
    expect(getNextMonthlyRun(new Date("2026-12-20T12:00:00Z"), "5", "09:00")).toBe("2027-01-05T09:00:00.000Z");
    expect(getNextMonthlyRun(new Date("2028-02-01T00:00:00Z"), "last", "18:00")).toBe("2028-02-29T18:00:00.000Z");
  });

  it("converts Europe/London execution time across both DST transitions", () => {
    expect(getNextMonthlyRun(new Date("2026-03-20T00:00:00Z"), "last", "06:00")).toBe("2026-03-31T05:00:00.000Z");
    expect(getNextMonthlyRun(new Date("2026-10-20T00:00:00Z"), "last", "06:00")).toBe("2026-10-31T06:00:00.000Z");
  });

  it("derives the previous complete calendar month", () => {
    expect(previousCalendarMonth(new Date("2027-01-05T09:00:00Z"))).toEqual({ from: "2026-12-01", to: "2026-12-31" });
  });

  it("moves to the following month at and immediately after the execution instant", () => {
    expect(getNextMonthlyRun(new Date("2026-11-05T08:59:59Z"), "5", "09:00")).toBe("2026-11-05T09:00:00.000Z");
    expect(getNextMonthlyRun(new Date("2026-11-05T09:00:00Z"), "5", "09:00")).toBe("2026-12-05T09:00:00.000Z");
  });

  it("uses the Europe/London calendar when UTC is still on the previous month", () => {
    expect(calendarDateInTimeZone(new Date("2026-06-30T23:30:00Z"))).toBe("2026-07-01");
  });
});
