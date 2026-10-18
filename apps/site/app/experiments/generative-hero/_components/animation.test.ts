import { describe, expect, it } from "vitest";
import { chartReveal, contentReveal, getExperienceForLoop, getLoopSnapshot, getReducedMotionSnapshot, initialPlayback, loopTiming } from "./animation";

describe("generative hero loop orchestration", () => {
  it("uses an eight-and-a-half-second thinking, assembly, and complete cycle", () => {
    expect(loopTiming.total).toBe(8_500);
    expect(getLoopSnapshot(0)).toMatchObject({ phase: "thinking", assemblyStep: 0 });
    expect(getLoopSnapshot(2_499).phase).toBe("thinking");
    expect(getLoopSnapshot(2_500)).toMatchObject({ phase: "assembling", assemblyStep: 1 });
    expect(getLoopSnapshot(6_500)).toMatchObject({ phase: "complete", assemblyStep: 5 });
    expect(getLoopSnapshot(8_500).phase).toBe("thinking");
  });

  it("reveals components in five deterministic assembly steps", () => {
    expect(getLoopSnapshot(3_100).assemblyStep).toBe(2);
    expect(getLoopSnapshot(3_850).assemblyStep).toBe(3);
    expect(getLoopSnapshot(4_650).assemblyStep).toBe(4);
    expect(getLoopSnapshot(5_350).assemblyStep).toBe(5);
  });

  it("alternates experience configuration after each loop", () => {
    expect(getExperienceForLoop(0)).toBe("cash");
    expect(getExperienceForLoop(1)).toBe("payments");
    expect(getExperienceForLoop(2)).toBe("cash");
  });

  it("presents the first interface before using thinking as the bridge to the second", () => {
    expect(getExperienceForLoop(initialPlayback.loop)).toBe("cash");
    expect(getLoopSnapshot(initialPlayback.elapsed).phase).toBe("assembling");
    expect(getLoopSnapshot(6_500).phase).toBe("complete");

    expect(getExperienceForLoop(1)).toBe("payments");
    expect(getLoopSnapshot(0).phase).toBe("thinking");
    expect(getLoopSnapshot(2_500).phase).toBe("assembling");
    expect(getLoopSnapshot(6_500).phase).toBe("complete");

    expect(getExperienceForLoop(2)).toBe("cash");
    expect(getLoopSnapshot(0).phase).toBe("thinking");
  });

  it("provides a complete static result for reduced motion", () => {
    expect(getReducedMotionSnapshot()).toEqual({ phase: "complete", assemblyStep: 5, phaseElapsed: 0 });
  });

  it("uses restrained fluid transitions for generated content and charts", () => {
    expect(contentReveal.initial.filter).toBe("blur(5px)");
    expect(contentReveal.transition.duration).toBe(.65);
    expect(chartReveal.duration).toBe(1.1);
    expect(chartReveal.stagger).toBe(.07);
    expect(chartReveal.seriesOffset).toBe(.16);
  });
});
