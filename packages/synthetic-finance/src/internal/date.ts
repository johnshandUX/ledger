import type { IsoDate, IsoDateTime } from "../domain/index.js";

export function getUtcCalendarDate(value: IsoDate | IsoDateTime): IsoDate {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|([+-])(\d{2}):(\d{2}))$/.exec(
    value,
  );
  if (match === null) {
    throw new RangeError(`Expected an ISO date or timezone-qualified datetime: ${value}`);
  }

  let year = Number(match[1]);
  let month = Number(match[2]);
  let day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const offsetMinutes = match[6] === "Z"
    ? 0
    : (match[7] === "+" ? 1 : -1) *
      (Number(match[8]) * 60 + Number(match[9]));
  const utcMinutes = hour * 60 + minute - offsetMinutes;

  if (utcMinutes < 0) {
    day -= 1;
    if (day === 0) {
      month -= 1;
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      day = daysInMonth(year, month);
    }
  } else if (utcMinutes >= 24 * 60) {
    day += 1;
    if (day > daysInMonth(year, month)) {
      day = 1;
      month += 1;
      if (month === 13) {
        month = 1;
        year += 1;
      }
    }
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function addUtcDays(value: IsoDate | IsoDateTime, dayDelta: number): IsoDate {
  if (!Number.isInteger(dayDelta)) {
    throw new RangeError("Day delta must be an integer.");
  }

  const [yearPart, monthPart, dayPart] = getUtcCalendarDate(value).split("-");
  let year = Number(yearPart);
  let month = Number(monthPart);
  let day = Number(dayPart);
  const direction = dayDelta < 0 ? -1 : 1;

  for (let remaining = Math.abs(dayDelta); remaining > 0; remaining -= 1) {
    day += direction;
    if (day === 0) {
      month -= 1;
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      day = daysInMonth(year, month);
    } else if (day > daysInMonth(year, month)) {
      day = 1;
      month += 1;
      if (month === 13) {
        month = 1;
        year += 1;
      }
    }
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
