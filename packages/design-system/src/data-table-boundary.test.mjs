import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps DataTable out of the server-safe root entry", async () => {
  const rootEntry = await readFile(new URL("./index.ts", import.meta.url), "utf8");
  const clientEntry = await readFile(new URL("./data-table.ts", import.meta.url), "utf8");
  assert.doesNotMatch(rootEntry, /DataTable|data-table/);
  assert.match(clientEntry, /^"use client";/);
});

test("keeps Batch 1C Radix components behind dedicated client entries", async () => {
  const rootEntry = await readFile(new URL("./index.ts", import.meta.url), "utf8");
  const progressEntry = await readFile(new URL("./progress.ts", import.meta.url), "utf8");
  const avatarEntry = await readFile(new URL("./avatar.ts", import.meta.url), "utf8");
  assert.doesNotMatch(rootEntry, /export \* from ["'](?:\.\/components\/(Progress|Avatar)|\.\/(progress|avatar))/);
  assert.match(progressEntry, /^"use client";/);
  assert.match(avatarEntry, /^"use client";/);
});

test("marks shared examples as client-aware in source and published output", async () => {
  const sourceEntry = await readFile(new URL("./examples.ts", import.meta.url), "utf8");
  const builtEntry = await readFile(new URL("../dist/examples.js", import.meta.url), "utf8");
  assert.match(sourceEntry, /^"use client";/);
  assert.match(builtEntry, /^"use client";/);
});

test("keeps Application Navigation behind its dedicated client entry", async () => {
  const rootEntry = await readFile(new URL("./index.ts", import.meta.url), "utf8");
  const clientEntry = await readFile(new URL("./application-navigation.ts", import.meta.url), "utf8");
  const builtEntry = await readFile(new URL("../dist/application-navigation.js", import.meta.url), "utf8");
  assert.doesNotMatch(rootEntry, /export \* from ["'](?:\.\/components\/ApplicationNavigation|\.\/application-navigation)/);
  assert.match(clientEntry, /^"use client";/);
  assert.match(builtEntry, /^"use client";/);
});
