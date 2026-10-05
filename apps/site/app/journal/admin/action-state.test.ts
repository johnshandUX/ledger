import { describe, expect, it } from "vitest";
import { getJournalActionAvailability, initialJournalActionState } from "./action-state";

describe("Journal submission availability", () => {
  it("prevents duplicate submissions while an action is pending", () => {
    expect(getJournalActionAvailability("draft", initialJournalActionState, true)).toEqual({ saveDisabled: true, publishDisabled: true });
  });

  it("allows an existing saved draft to be published without allowing a duplicate save", () => {
    expect(getJournalActionAvailability("draft", { status: "success", intent: "draft" }, false)).toEqual({ saveDisabled: true, publishDisabled: false });
  });

  it("prevents another submission after publication succeeds", () => {
    expect(getJournalActionAvailability("draft", { status: "success", intent: "published" }, false)).toEqual({ saveDisabled: true, publishDisabled: true });
  });

  it("prevents a create action being repeated after a new draft is saved", () => {
    expect(getJournalActionAvailability("new", { status: "success", intent: "draft" }, false)).toEqual({ saveDisabled: true, publishDisabled: true });
  });

  it("re-enables both actions after a failure", () => {
    expect(getJournalActionAvailability("draft", { status: "error", message: "Failed" }, false)).toEqual({ saveDisabled: false, publishDisabled: false });
  });
});
