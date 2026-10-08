export interface SeededRandom {
  next(): number;
  integer(minimum: number, maximum: number): number;
  pick<T>(values: readonly T[]): T;
}

export function createSeededRandom(seed: number): SeededRandom {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
    throw new RangeError("Seed must be an unsigned 32-bit integer.");
  }

  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };

  return {
    next,
    integer(minimum, maximum) {
      return minimum + Math.floor(next() * (maximum - minimum + 1));
    },
    pick<T>(values: readonly T[]): T {
      if (values.length === 0) throw new RangeError("Cannot pick from an empty list.");
      return values[Math.floor(next() * values.length)]!;
    },
  };
}
