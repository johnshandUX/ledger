import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const lightThemeUrl = new URL("./light.css", import.meta.url);
const darkThemeUrl = new URL("./dark.css", import.meta.url);
const colorTokensUrl = new URL("../tokens/colors.css", import.meta.url);

const expectedLightMappings = {
  info: "var(--ledger-color-blue-600)",
  success: "var(--ledger-color-green-600)",
  warning: "var(--ledger-color-amber-600)",
  error: "var(--ledger-color-red-600)",
};

const expectedDarkMappings = expectedLightMappings;

const statusPrimitives = {
  info: "blue-600",
  success: "green-600",
  warning: "amber-600",
  error: "red-600",
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

function channelToLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((channel) => channelToLinear(Number.parseInt(channel, 16)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test("status icon fills maintain non-text contrast with their glyph and theme surfaces", async () => {
  const colorCss = await readFile(colorTokensUrl, "utf8");
  const tokenValue = (name) => colorCss.match(new RegExp(`--ledger-color-${name}:\\s*(#[a-f\\d]{6})`, "i"))?.[1];

  for (const [meaning, primitive] of Object.entries(statusPrimitives)) {
    const fill = tokenValue(primitive);
    assert.ok(fill, `Expected ${primitive} to be defined`);
    assert.ok(contrast(fill, "#ffffff") >= 3, `${meaning} must contrast with the light glyph and surface`);
    assert.ok(contrast(fill, "#171717") >= 3, `${meaning} must contrast with the dark surface`);
  }
});
