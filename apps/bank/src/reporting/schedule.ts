import type { RecurringReportSchedule } from "./types";

export function getNextMonthlyRun(now: Date, executionDay: RecurringReportSchedule["executionDay"], executionTime: string, timezone = "Europe/London") {
  const localNow = zonedParts(now, timezone);
  for (let offset = 0; offset < 3; offset += 1) {
    const monthIndex = localNow.month - 1 + offset;
    const year = localNow.year + Math.floor(monthIndex / 12);
    const month = ((monthIndex % 12) + 12) % 12 + 1;
    const day = executionDay === "last" ? daysInMonth(year, month) : Number(executionDay);
    const [hour, minute] = executionTime.split(":").map(Number);
    const candidate = zonedDateTimeToUtc({ year, month, day, hour, minute }, timezone);
    if (candidate.getTime() > now.getTime()) return candidate.toISOString();
  }
  throw new Error("Unable to calculate the next monthly reporting run.");
}

export function previousCalendarMonth(executionDate: Date, timezone = "Europe/London") {
  const local = zonedParts(executionDate, timezone);
  const end = new Date(Date.UTC(local.year, local.month - 1, 0));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  return { from: isoDate(start), to: isoDate(end) };
}

export function calendarDateInTimeZone(date: Date, timezone = "Europe/London") {
  const local = zonedParts(date, timezone);
  return `${local.year}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
}

function zonedDateTimeToUtc(parts: { year: number; month: number; day: number; hour: number; minute: number }, timezone: string) {
  let candidate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute));
  const desired = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = zonedParts(candidate, timezone);
    const correction = desired - Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute);
    if (correction === 0) return candidate;
    candidate = new Date(candidate.getTime() + correction);
  }
  return candidate;
}
function zonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute") };
}
function daysInMonth(year: number, month: number) { return new Date(Date.UTC(year, month, 0)).getUTCDate(); }
function isoDate(date: Date) { return date.toISOString().slice(0, 10); }
