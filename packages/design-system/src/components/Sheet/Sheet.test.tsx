import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Sheet, SheetTrigger, type SheetContentProps } from "./Sheet";
describe("Sheet", () => {
  it("exposes a dialog trigger", () => { const html = renderToStaticMarkup(<Sheet><SheetTrigger>Open sheet</SheetTrigger></Sheet>); expect(html).toContain('aria-haspopup="dialog"'); });
  it("requires title and intentionally limits sides", () => { expectTypeOf<SheetContentProps>().toMatchTypeOf<{ title: ReactNode; side?: "bottom" | "left" | "right" }>(); });
  it("layers modal sheets above application navigation overlays", () => {
    const css = readFileSync(new URL("./Sheet.css", import.meta.url), "utf8");
    expect(css).toMatch(/ledger-sheet__overlay \{[^}]*z-index: 1100/);
    expect(css).toMatch(/ledger-sheet__content \{[^}]*z-index: 1101/);
  });
});
import { readFileSync } from "node:fs";
