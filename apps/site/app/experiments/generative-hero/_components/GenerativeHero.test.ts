import { describe, expect, it } from "vitest";
import { initialPlayback } from "./animation";
import { shouldRenderGeneration } from "./GenerativeHero";

describe("generative hero playback coordination", () => {
  it("withholds production generation until the presentation frame has settled", () => {
    expect(shouldRenderGeneration(true, false, false)).toBe(false);
    expect(shouldRenderGeneration(true, true, false)).toBe(true);
  });

  it("keeps the experiment visible and reduced motion immediate", () => {
    expect(shouldRenderGeneration(false, true, false)).toBe(true);
    expect(shouldRenderGeneration(true, false, true)).toBe(true);
  });

  it("opens with the first banking interface assembly before the generating screen", () => {
    expect(initialPlayback).toEqual({ elapsed: 2_500, loop: 0 });
  });
});
