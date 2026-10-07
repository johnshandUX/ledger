import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const lightThemeUrl = new URL("./light.css", import.meta.url);
const darkThemeUrl = new URL("./dark.css", import.meta.url);

function luminance(hex) {
  const channels = hex.match(/../g).map((channel) => Number.parseInt(channel, 16) / 255);
  const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("control boundaries preserve their distinct semantic roles and contrast", async () => {
  const [lightCss, darkCss] = await Promise.all([readFile(lightThemeUrl, "utf8"), readFile(darkThemeUrl, "utf8")]);

  assert.match(lightCss, /--ledger-color-control-border:\s*var\(--ledger-color-neutral-500\)/);
  assert.match(darkCss, /--ledger-color-control-border:\s*var\(--ledger-color-neutral-400\)/g);
  assert.match(lightCss, /--ledger-color-control-border-resting:\s*color-mix\(in srgb, var\(--ledger-color-neutral-400\) 60%, var\(--ledger-color-neutral-500\)\)/);
  assert.match(darkCss, /--ledger-color-control-border-resting:\s*color-mix\(in srgb, var\(--ledger-color-neutral-500\) 65%, var\(--ledger-color-neutral-600\)\)/g);

  assert.ok(contrast("909090", "ffffff") >= 3, "Light resting boundary must reach 3:1 against the control background");
  assert.ok(contrast("676767", "171717") >= 3, "Dark resting boundary must reach 3:1 against the control background");
  assert.ok(contrast("737373", "ffffff") >= 3, "Light general control boundary must remain accessible");
  assert.ok(contrast("a3a3a3", "171717") >= 3, "Dark general control boundary must remain accessible");
});
