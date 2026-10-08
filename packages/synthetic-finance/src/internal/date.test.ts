import { describe, expect, it } from "vitest";

import { addUtcDays, getUtcCalendarDate } from "./date.js";

describe("getUtcCalendarDate", () => {
  it("normalises timezone-qualified datetimes across UTC date boundaries", () => {
    expect(getUtcCalendarDate("2026-10-08T00:30:00+01:00")).toBe("2026-10-07");
    expect(getUtcCalendarDate("2026-10-07T23:30:00-02:00")).toBe("2026-10-08");
    expect(getUtcCalendarDate("2026-01-01T00:15:00+01:00")).toBe("2025-12-31");
    expect(getUtcCalendarDate("2024-03-01T00:15:00+01:00")).toBe("2024-02-29");
  });

  it("preserves ISO dates and UTC datetimes", () => {
    expect(getUtcCalendarDate("2026-10-07")).toBe("2026-10-07");
    expect(getUtcCalendarDate("2026-10-07T09:00:00Z")).toBe("2026-10-07");
  });

  it("adds calendar days without a runtime clock", () => {
    expect(addUtcDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addUtcDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addUtcDays("2024-02-29", 1)).toBe("2024-03-01");
  });
});
