import { describe, expect, it } from "vitest";
import { parseJournalActionIntent } from "./action-contract";

describe("Journal action intent", () => {
  it.each(["draft", "published"] as const)("accepts the explicit %s intent", (intent) => {
    expect(parseJournalActionIntent(intent)).toBe(intent);
  });

  it.each([null, "", "publish", "future-status"])("rejects unsupported intent %s", (intent) => {
    expect(() => parseJournalActionIntent(intent)).toThrow("Choose Save draft or Publish");
  });
});
