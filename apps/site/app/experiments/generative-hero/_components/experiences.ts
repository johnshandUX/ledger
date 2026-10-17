import type { ExperienceId } from "./types";

export const experienceConfigurations = {
  cash: {
    id: "cash",
    prompt: "Show me today’s cash position across my business accounts.",
    eyebrow: "Generated cash position",
    heading: "Today’s cash position",
  },
  payments: {
    id: "payments",
    prompt: "Show me payments requiring attention.",
    eyebrow: "Generated payment workspace",
    heading: "Payments requiring attention",
  },
} as const satisfies Record<ExperienceId, { id: ExperienceId; prompt: string; eyebrow: string; heading: string }>;

export function getExperienceConfiguration(id: ExperienceId) {
  return experienceConfigurations[id];
}
