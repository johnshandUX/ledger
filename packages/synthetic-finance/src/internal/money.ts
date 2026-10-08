import type { MinorUnitAmount } from "../domain/index.js";

export function addMinorUnits(
  left: MinorUnitAmount,
  right: MinorUnitAmount,
): MinorUnitAmount {
  const total = left + right;
  if (!Number.isSafeInteger(total)) {
    throw new RangeError("Derived minor-unit total exceeds the safe integer range.");
  }
  return total;
}
