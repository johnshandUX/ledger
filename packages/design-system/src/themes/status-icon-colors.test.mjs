import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const lightThemeUrl = new URL("./light.css", import.meta.url);
const darkThemeUrl = new URL("./dark.css", import.meta.url);

const expectedLightMappings = {
  info: "var(--ledger-color-blue-900)",
  success: "var(--ledger-color-green-800)",
  warning: "var(--ledger-color-amber-800)",
  error: "var(--ledger-color-red-800)",
};

const expectedDarkMappings = {
  info: "var(--ledger-color-blue-300)",
  success: "var(--ledger-color-green-300)",
  warning: "var(--ledger-color-amber-300)",
  error: "var(--ledger-color-red-300)",
};

function countMapping(css, meaning, value) {
  return css.match(new RegExp(`--ledger-color-icon-status-${meaning}:\\s*${value.replace(/[()]/g, "\\$&")}`, "g"))?.length ?? 0;
}

test("status icon semantics map to governed light and dark primitives", async () => {
  const [lightCss, darkCss] = await Promise.all([
    readFile(lightThemeUrl, "utf8"),
    readFile(darkThemeUrl, "utf8"),
  ]);

  for (const [meaning, value] of Object.entries(expectedLightMappings)) {
    assert.equal(countMapping(lightCss, meaning, value), 1, `Expected one light ${meaning} icon mapping`);
  }

  for (const [meaning, value] of Object.entries(expectedDarkMappings)) {
    assert.equal(countMapping(darkCss, meaning, value), 2, `Expected matching system and explicit dark ${meaning} icon mappings`);
  }

  assert.equal(countMapping(lightCss, "foreground", "var(--ledger-color-neutral-0)"), 1);
  assert.equal(countMapping(darkCss, "foreground", "var(--ledger-color-neutral-0)"), 2);
});
