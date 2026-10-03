import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const darkThemeUrl = new URL("./dark.css", import.meta.url);

function extractRuleBody(css, selector, fromIndex = 0) {
  const selectorIndex = css.indexOf(selector, fromIndex);
  assert.notEqual(selectorIndex, -1, `Expected dark.css to contain ${selector}`);

  const openingBrace = css.indexOf("{", selectorIndex + selector.length);
  assert.notEqual(openingBrace, -1, `Expected ${selector} to have a declaration block`);

  let depth = 1;
  for (let index = openingBrace + 1; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(openingBrace + 1, index);
  }

  assert.fail(`Expected ${selector} to have a closing brace`);
}

function extractSemanticProperties(ruleBody, selector) {
  const properties = new Map();
  const declarationPattern = /(--ledger-[\w-]+)\s*:\s*([^;]+);/g;

  for (const match of ruleBody.matchAll(declarationPattern)) {
    const [, property, value] = match;
    assert(!properties.has(property), `${selector} declares ${property} more than once`);
    properties.set(property, value.trim());
  }

  assert(properties.size > 0, `Expected ${selector} to contain Ledger semantic properties`);
  return Object.fromEntries([...properties].sort(([left], [right]) => left.localeCompare(right)));
}

test("system dark and explicit dark semantic mappings stay identical", async () => {
  const css = await readFile(darkThemeUrl, "utf8");
  const mediaStart = css.indexOf("@media (prefers-color-scheme: dark)");
  assert.notEqual(mediaStart, -1, "Expected dark.css to contain the system dark media query");

  const systemSelector = ":root:not([data-theme])";
  const explicitSelector = ':root[data-theme="dark"]';
  const systemProperties = extractSemanticProperties(
    extractRuleBody(css, systemSelector, mediaStart),
    systemSelector,
  );
  const explicitProperties = extractSemanticProperties(
    extractRuleBody(css, explicitSelector),
    explicitSelector,
  );

  assert.deepEqual(
    explicitProperties,
    systemProperties,
    "Dark theme parity failed: system-dark and explicit-dark properties or values differ",
  );
});
