import { describe, expect, it } from "vitest";
import { chartReveal, contentReveal, getExperienceForLoop, getLoopSnapshot, getPanelGenerationStage, getReducedMotionSnapshot, initialPlayback, loopTiming } from "./animation";

describe("generative hero loop orchestration", () => {
  it("uses an eight-second thinking, assembly, and complete cycle", () => {
    expect(loopTiming.total).toBe(8_000);
    expect(getLoopSnapshot(0)).toMatchObject({ phase: "thinking", assemblyStep: 0 });
    expect(getLoopSnapshot(1_999).phase).toBe("thinking");
    expect(getLoopSnapshot(2_000)).toMatchObject({ phase: "assembling", assemblyStep: 1 });
    expect(getLoopSnapshot(6_000)).toMatchObject({ phase: "complete", assemblyStep: 5 });
    expect(getLoopSnapshot(8_000).phase).toBe("thinking");
  });

  it("reveals components in five deterministic assembly steps", () => {
    expect(getLoopSnapshot(2_450).assemblyStep).toBe(2);
    expect(getLoopSnapshot(3_100).assemblyStep).toBe(3);
    expect(getLoopSnapshot(3_800).assemblyStep).toBe(4);
    expect(getLoopSnapshot(4_450).assemblyStep).toBe(5);
  });

  it("progresses each panel independently from skeleton through resolution", () => {
    expect(getPanelGenerationStage(450, 450)).toBe("skeleton");
    expect(getPanelGenerationStage(930, 450)).toBe("resolving");
    expect(getPanelGenerationStage(1_350, 450)).toBe("generated");
    expect(getPanelGenerationStage(1_250, 1_100)).toBe("skeleton");
  });

  it("alternates experience configuration after each loop", () => {
    expect(getExperienceForLoop(0)).toBe("cash");
    expect(getExperienceForLoop(1)).toBe("payments");
    expect(getExperienceForLoop(2)).toBe("cash");
  });

  it("presents the first interface before using thinking as the bridge to the second", () => {
    expect(getExperienceForLoop(initialPlayback.loop)).toBe("cash");
    expect(getLoopSnapshot(initialPlayback.elapsed).phase).toBe("assembling");
    expect(getLoopSnapshot(6_000).phase).toBe("complete");

    expect(getExperienceForLoop(1)).toBe("payments");
    expect(getLoopSnapshot(0).phase).toBe("thinking");
    expect(getLoopSnapshot(2_000).phase).toBe("assembling");
    expect(getLoopSnapshot(6_000).phase).toBe("complete");

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
