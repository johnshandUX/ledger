import { describe, expect, it } from "vitest";
import { getExperienceConfiguration } from "./experiences";

describe("experience configurations", () => {
  it("selects both experiences deterministically", () => {
    expect(getExperienceConfiguration("cash").prompt).toContain("cash position");
    expect(getExperienceConfiguration("payments").prompt).toContain("requiring attention");
  });
});
