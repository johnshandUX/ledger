import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const typography = await readFile(new URL("./typography.css", import.meta.url), "utf8");

test("publishes the three typography family roles", () => {
  assert.match(typography, /--ledger-font-family-product:\s*"Inter"/);
  assert.match(typography, /--ledger-font-family-brand-display:\s*"Instrument Serif"/);
  assert.match(typography, /--ledger-font-family-brand-mono:\s*"IBM Plex Mono"/);
});

test("keeps the established sans token aligned with the product family", () => {
  assert.match(
    typography,
    /--ledger-font-family-sans:\s*var\(--ledger-font-family-product\)/,
  );
});
