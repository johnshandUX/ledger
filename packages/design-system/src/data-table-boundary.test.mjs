import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps DataTable out of the server-safe root entry", async () => {
  const rootEntry = await readFile(new URL("./index.ts", import.meta.url), "utf8");
  const clientEntry = await readFile(new URL("./data-table.ts", import.meta.url), "utf8");
  assert.doesNotMatch(rootEntry, /DataTable|data-table/);
  assert.match(clientEntry, /^"use client";/);
});
