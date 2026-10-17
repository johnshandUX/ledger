import type { ExperienceId } from "./types";

export const loopTiming = {
  thinking: 2_000,
  assembling: 4_000,
  complete: 2_000,
  total: 8_000,
  assembly: { heading: 0, primary: 600, secondary: 1_350, tertiary: 2_150, content: 2_850 },
} as const;

export type GenerationPhase = "thinking" | "assembling" | "complete";
export type AssemblyStep = 0 | 1 | 2 | 3 | 4 | 5;
export type LoopSnapshot = { phase: GenerationPhase; assemblyStep: AssemblyStep; phaseElapsed: number };

export const assemblySpring = { type: "spring" as const, stiffness: 210, damping: 24 };
export const componentEntry = {
  initial: { opacity: 0, y: 24, scale: 0.975 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.985 },
};

export function getLoopSnapshot(elapsed: number): LoopSnapshot {
  const position = ((elapsed % loopTiming.total) + loopTiming.total) % loopTiming.total;
  if (position < loopTiming.thinking) return { phase: "thinking", assemblyStep: 0, phaseElapsed: position };
  if (position >= loopTiming.thinking + loopTiming.assembling) {
    return { phase: "complete", assemblyStep: 5, phaseElapsed: position - loopTiming.thinking - loopTiming.assembling };
  }
  const assemblyElapsed = position - loopTiming.thinking;
  const thresholds = loopTiming.assembly;
  const assemblyStep: AssemblyStep = assemblyElapsed >= thresholds.content ? 5
    : assemblyElapsed >= thresholds.tertiary ? 4
      : assemblyElapsed >= thresholds.secondary ? 3
        : assemblyElapsed >= thresholds.primary ? 2
          : 1;
  return { phase: "assembling", assemblyStep, phaseElapsed: assemblyElapsed };
}

export function getExperienceForLoop(loop: number): ExperienceId {
  return loop % 2 === 0 ? "cash" : "payments";
}

export function getReducedMotionSnapshot(): LoopSnapshot {
  return { phase: "complete", assemblyStep: 5, phaseElapsed: 0 };
}
