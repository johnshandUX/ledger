import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Popover, PopoverTrigger } from "./Popover";
describe("Popover", () => { it("exposes an accessible Radix trigger", () => { const html = renderToStaticMarkup(<Popover><PopoverTrigger>Open</PopoverTrigger></Popover>); expect(html).toContain('aria-haspopup="dialog"'); expect(html).toContain('data-slot="popover-trigger"'); }); });
