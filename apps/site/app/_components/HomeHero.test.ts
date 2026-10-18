import { describe, expect, it } from "vitest";
import { homeHeroCopy, homeHeroRevealTiming } from "./HomeHero";

describe("homepage generative hero", () => {
  it("preserves the approved copy exactly", () => {
    expect(homeHeroCopy).toEqual({
      eyebrow: "Introducing LedgerOS",
      headline: "Finance experiences, generated.",
      subtitle: "An agentic, money focused design system",
    });
  });

  it("uses a smooth, overlapping reveal for the title, subtitle, and frame", () => {
    expect(homeHeroRevealTiming.headline.delay).toBe(0);
    expect(homeHeroRevealTiming.subtitle.delay).toBeLessThan(homeHeroRevealTiming.headline.duration);
    expect(homeHeroRevealTiming.frame.delay).toBeLessThan(homeHeroRevealTiming.subtitle.duration);
    expect(homeHeroRevealTiming.frame.delay + homeHeroRevealTiming.frame.duration).toBe(1.08);
  });
});
