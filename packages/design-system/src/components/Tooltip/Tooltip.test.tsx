import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Tooltip, type TooltipProps } from "./Tooltip";

describe("Tooltip", () => {
  it("uses the existing element as its trigger", () => {
    const html = renderToStaticMarkup(<Tooltip content="More information"><button>Help</button></Tooltip>);
    expect(html).toContain("<button");
    expect(html).not.toContain("tooltip-trigger");
  });
  it("requires content", () => { expectTypeOf<TooltipProps>().toHaveProperty("content"); });
});
