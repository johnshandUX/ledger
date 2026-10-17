import { describe, expect, it } from "vitest";
import { bankingCanvasSize, getCompositionScale } from "./ScaledComposition";

describe("scaled banking composition", () => {
  it("preserves the desktop size and scales narrower canvases proportionally", () => {
    expect(getCompositionScale(bankingCanvasSize.width)).toBe(1);
    expect(getCompositionScale(bankingCanvasSize.width * 2)).toBe(1);
    expect(getCompositionScale(bankingCanvasSize.width / 2)).toBe(.5);
  });
});
