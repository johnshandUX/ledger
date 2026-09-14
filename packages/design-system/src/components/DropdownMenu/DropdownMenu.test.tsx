import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { DropdownMenu, DropdownMenuTrigger, type DropdownMenuItemProps } from "./DropdownMenu";
describe("DropdownMenu", () => {
  it("exposes a menu trigger", () => { const html = renderToStaticMarkup(<DropdownMenu><DropdownMenuTrigger>Actions</DropdownMenuTrigger></DropdownMenu>); expect(html).toContain('aria-haspopup="menu"'); });
  it("limits intent to approved values", () => { expectTypeOf<DropdownMenuItemProps["intent"]>().toEqualTypeOf<"default" | "destructive" | undefined>(); });
});
