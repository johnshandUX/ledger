import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const lightThemeUrl = new URL("./light.css", import.meta.url);
const darkThemeUrl = new URL("./dark.css", import.meta.url);

const lightMappings = {
  border: "var(--ledger-color-neutral-200)",
  "header-surface": "var(--ledger-color-neutral-50)",
  "header-hover": "var(--ledger-color-neutral-100)",
  "row-zebra": "var(--ledger-color-neutral-50)",
};

const darkMappings = {
  border: "var(--ledger-color-neutral-800)",
  "header-surface": "var(--ledger-color-neutral-900)",
  "header-hover": "var(--ledger-color-neutral-800)",
  "row-zebra": "var(--ledger-color-neutral-900)",
};

function countMapping(css, role, value) {
  const escapedValue = value.replace(/[()]/g, "\\$&");
  return css.match(new RegExp(`--ledger-color-table-${role}:\\s*${escapedValue}`, "g"))?.length ?? 0;
}

test("table colour roles map to governed light and dark primitives", async () => {
  const [lightCss, darkCss] = await Promise.all([
    readFile(lightThemeUrl, "utf8"),
    readFile(darkThemeUrl, "utf8"),
  ]);

  for (const [role, value] of Object.entries(lightMappings)) {
    assert.equal(countMapping(lightCss, role, value), 1, `Expected one light table ${role} mapping`);
  }

  for (const [role, value] of Object.entries(darkMappings)) {
    assert.equal(countMapping(darkCss, role, value), 2, `Expected matching dark table ${role} mappings`);
  }
});
