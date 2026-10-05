import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("../../../lib/journal-auth", () => ({ assertJournalAdmin: mocks.authorize }));
vi.mock("../../../lib/journal-github", async () => {
  const actual = await vi.importActual<typeof import("../../../lib/journal-github")>("../../../lib/journal-github");
  return { ...actual, createGitHubJournalEntry: mocks.create, updateGitHubJournalDraft: mocks.update };
});

import { createJournalEntryAction, updateJournalDraftAction } from "./actions";
import { initialJournalActionState } from "./action-state";
import { JournalGitHubError } from "../../../lib/journal-github";

function form(intent: string | null = "draft") {
  const value = new FormData();
  value.set("title", "Test entry");
  value.set("summary", "Test entry summary.");
  value.set("tags", "LedgerOS");
  value.set("body", "Test body.");
  if (intent !== null) value.set("intent", intent);
  return value;
}

describe("Journal server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockResolvedValue({ user: { githubId: "123" } });
    mocks.update.mockResolvedValue({ oid: "published-commit", url: "https://github.com/johnshandUX/ledger/commit/published-commit" });
  });

  it("stops before GitHub access when creation authorization fails", async () => {
    mocks.authorize.mockRejectedValue(new Error("Unauthorized"));
    const result = await createJournalEntryAction(initialJournalActionState, form());
    expect(result.status).toBe("error");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("stops before GitHub access when update authorization fails", async () => {
    mocks.authorize.mockRejectedValue(new Error("Unauthorized"));
    const result = await updateJournalDraftAction("test-entry", initialJournalActionState, form());
    expect(result.status).toBe("error");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([null, "unsupported"])("rejects invalid intent %s before GitHub access", async (intent) => {
    const result = await createJournalEntryAction(initialJournalActionState, form(intent));
    expect(result).toEqual(expect.objectContaining({ status: "error", message: expect.stringContaining("Choose Save draft or Publish") }));
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns publish success feedback and the commit link for an existing draft", async () => {
    const result = await updateJournalDraftAction("test-entry", initialJournalActionState, form("published"));
    expect(mocks.update).toHaveBeenCalledWith("test-entry", expect.objectContaining({ title: "Test entry" }), "published");
    expect(result).toEqual(expect.objectContaining({ status: "success", intent: "published", message: "Commit created — deployment pending", commitUrl: "https://github.com/johnshandUX/ledger/commit/published-commit" }));
    expect(mocks.revalidate).toHaveBeenCalledWith("/journal/admin");
  });

  it("returns user-visible feedback when publishing an existing draft fails", async () => {
    mocks.update.mockRejectedValue(new JournalGitHubError("The draft could not be published."));
    const result = await updateJournalDraftAction("test-entry", initialJournalActionState, form("published"));
    expect(result).toEqual(expect.objectContaining({ status: "error", message: "The draft could not be published." }));
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
