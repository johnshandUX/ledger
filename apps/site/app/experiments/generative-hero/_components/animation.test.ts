import { describe, expect, it } from "vitest";
import { getExperienceForLoop, getLoopSnapshot, getReducedMotionSnapshot, loopTiming } from "./animation";

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
    expect(getLoopSnapshot(2_600).assemblyStep).toBe(2);
    expect(getLoopSnapshot(3_350).assemblyStep).toBe(3);
    expect(getLoopSnapshot(4_150).assemblyStep).toBe(4);
    expect(getLoopSnapshot(4_850).assemblyStep).toBe(5);
  });

  it("alternates experience configuration after each loop", () => {
    expect(getExperienceForLoop(0)).toBe("cash");
    expect(getExperienceForLoop(1)).toBe("payments");
    expect(getExperienceForLoop(2)).toBe("cash");
  });

  it("provides a complete static result for reduced motion", () => {
    expect(getReducedMotionSnapshot()).toEqual({ phase: "complete", assemblyStep: 5, phaseElapsed: 0 });
  });
});
