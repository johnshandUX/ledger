import type { ExperienceId } from "./types";

export const loopTiming = {
  thinking: 2_500,
  assembling: 4_000,
  complete: 2_000,
  total: 8_500,
  assembly: { heading: 0, primary: 600, secondary: 1_350, tertiary: 2_150, content: 2_850 },
} as const;

export const initialPlayback = { elapsed: loopTiming.thinking, loop: 0 } as const;

export type GenerationPhase = "thinking" | "assembling" | "complete";
export type AssemblyStep = 0 | 1 | 2 | 3 | 4 | 5;
export type LoopSnapshot = { phase: GenerationPhase; assemblyStep: AssemblyStep; phaseElapsed: number };

export const assemblySpring = { type: "spring" as const, stiffness: 210, damping: 24 };
export const componentEntry = {
  initial: { opacity: 0, y: 24, scale: 0.975, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, scale: 0.985, filter: "blur(3px)" },
};

export const contentReveal = {
  initial: { opacity: 0, y: 7, filter: "blur(5px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: .65, ease: [0.22, 1, 0.36, 1] as const },
} as const;

export const chartReveal = {
  duration: 1.1,
  ease: [0.16, 1, 0.3, 1] as const,
  stagger: .07,
  seriesOffset: .16,
} as const;

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
