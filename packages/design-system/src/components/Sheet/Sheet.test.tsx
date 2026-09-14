import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Sheet, SheetTrigger, type SheetContentProps } from "./Sheet";
describe("Sheet", () => {
  it("exposes a dialog trigger", () => { const html = renderToStaticMarkup(<Sheet><SheetTrigger>Open sheet</SheetTrigger></Sheet>); expect(html).toContain('aria-haspopup="dialog"'); });
  it("requires title and intentionally limits sides", () => { expectTypeOf<SheetContentProps>().toMatchTypeOf<{ title: ReactNode; side?: "left" | "right" }>(); });
});
