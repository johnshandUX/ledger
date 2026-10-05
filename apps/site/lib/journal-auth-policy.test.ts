import { describe, expect, it } from "vitest";
import { isAllowedGitHubUserId } from "./journal-auth-policy";

describe("Journal admin authorization", () => {
  it("allows only the configured immutable GitHub user ID", () => {
    expect(isAllowedGitHubUserId(12345, "12345")).toBe(true);
    expect(isAllowedGitHubUserId(54321, "12345")).toBe(false);
  });

  it("fails closed when the allowlist is not configured", () => {
    expect(isAllowedGitHubUserId(12345, undefined)).toBe(false);
    expect(isAllowedGitHubUserId(undefined, "12345")).toBe(false);
  });
});
