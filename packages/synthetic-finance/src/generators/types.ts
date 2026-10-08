import type { IsoDate, IsoDateTime } from "../domain/index.js";
import type { SeededRandom } from "./random.js";

export interface GenerationContext {
  asOf: IsoDateTime;
  asOfDate: IsoDate;
  random: SeededRandom;
}

export function generatedId(prefix: string, index: number): string {
  return `${prefix}-gen-${String(index).padStart(6, "0")}`;
}

export function generatedTimestamp(
  date: IsoDate,
  hour: number,
  minute: number,
): IsoDateTime {
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`;
}
