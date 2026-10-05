import { describe, expect, it, vi } from "vitest";
import { createGitHubJournalEntry, fetchGitHubJournalSnapshot, JournalConflictError, JournalGitHubError, journalRepositoryPath, type GitHubJournalConfig, updateGitHubJournalDraft } from "./journal-github";
import { serializeJournalEntry, type JournalEntry } from "./journal";

const config: GitHubJournalConfig = { token: "test-token", owner: "johnshandUX", repository: "ledger", branch: "journal-admin-test" };
const existing: JournalEntry = { number: "004", title: "Existing entry", slug: "existing-entry", summary: "An existing Journal entry.", publishedDate: "2026-10-04", status: "published", tags: ["LedgerOS"], body: "Existing body." };
const draft: JournalEntry = { number: "005", title: "Draft entry", slug: "draft-entry", summary: "A draft Journal entry.", publishedDate: "2026-09-30", status: "draft", tags: ["LedgerOS"], body: "Draft body." };

function json(value: unknown, status = 200): Response { return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } }); }

function successfulFetch(graphqlPayload: unknown = { data: { createCommitOnBranch: { commit: { oid: "new-commit", url: "https://github.com/johnshandUX/ledger/commit/new-commit" } } } }) {
  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("/git/ref/heads/")) return json({ object: { sha: "head-oid" } });
    if (url.includes("/git/trees/")) return json({ tree: [{ path: "apps/site/content/journal/existing-entry.md", type: "blob", sha: "blob-oid" }] });
    if (url.includes("/git/blobs/")) return json({ encoding: "base64", content: Buffer.from(serializeJournalEntry(existing)).toString("base64") });
    if (url === "https://api.github.com/graphql") return json(graphqlPayload);
    return json({}, 404);
  }) as unknown as typeof fetch;
}

function draftFetch() {
  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("/git/ref/heads/")) return json({ object: { sha: "draft-head-oid" } });
    if (url.includes("/git/trees/")) return json({ tree: [{ path: "apps/site/content/journal/draft-entry.md", type: "blob", sha: "draft-blob-oid" }] });
    if (url.includes("/git/blobs/")) return json({ encoding: "base64", content: Buffer.from(serializeJournalEntry(draft)).toString("base64") });
    if (url === "https://api.github.com/graphql") return json({ data: { createCommitOnBranch: { commit: { oid: "updated-commit", url: "https://github.com/johnshandUX/ledger/commit/updated-commit" } } } });
    return json({}, 404);
  }) as unknown as typeof fetch;
}

describe("GitHub Journal adapter", () => {
  it("reads and validates Journal entries at a specific branch head", async () => {
    const snapshot = await fetchGitHubJournalSnapshot(config, successfulFetch());
    expect(snapshot.headOid).toBe("head-oid");
    expect(snapshot.entries).toEqual([existing]);
  });

  it("creates the next entry using an expected branch head", async () => {
    const fetcher = successfulFetch();
    const result = await createGitHubJournalEntry({ title: "New entry", summary: "A new Journal entry.", tags: ["LedgerOS"], body: "New body." }, "draft", config, fetcher, new Date("2026-10-05T12:00:00Z"));
    expect(result.entry.number).toBe("005");
    expect(result.entry.slug).toBe("new-entry");
    const graphqlCall = vi.mocked(fetcher).mock.calls.find(([url]) => String(url) === "https://api.github.com/graphql");
    const body = JSON.parse(String((graphqlCall?.[1] as RequestInit).body));
    expect(body.variables.input.expectedHeadOid).toBe("head-oid");
    expect(body.variables.input.fileChanges.additions[0].path).toBe("apps/site/content/journal/new-entry.md");
  });

  it("reports a stale branch head as a conflict", async () => {
    const fetcher = successfulFetch({ errors: [{ message: "Expected branch head oid did not match" }] });
    await expect(createGitHubJournalEntry({ title: "New entry", summary: "A new Journal entry.", tags: ["LedgerOS"], body: "New body." }, "published", config, fetcher)).rejects.toBeInstanceOf(JournalConflictError);
  });

  it("reports GitHub and network failures without exposing raw responses", async () => {
    const failed = vi.fn(async () => json({ message: "sensitive upstream detail" }, 500)) as unknown as typeof fetch;
    await expect(fetchGitHubJournalSnapshot(config, failed)).rejects.toEqual(expect.objectContaining({ message: "GitHub could not complete the Journal operation." }));
    const offline = vi.fn(async () => { throw new Error("network detail"); }) as unknown as typeof fetch;
    await expect(fetchGitHubJournalSnapshot(config, offline)).rejects.toEqual(expect.objectContaining({ message: "GitHub is currently unreachable." }));
  });

  it("constrains repository writes to canonical Journal paths", () => {
    expect(journalRepositoryPath("safe-entry")).toBe("apps/site/content/journal/safe-entry.md");
    expect(() => journalRepositoryPath("../../unsafe")).toThrow(JournalGitHubError);
    expect(() => journalRepositoryPath("unsafe/path")).toThrow(JournalGitHubError);
  });

  it("prevents published entries from being edited", async () => {
    await expect(updateGitHubJournalDraft("existing-entry", { title: "Changed", summary: "Changed summary.", tags: ["LedgerOS"], body: "Changed body." }, "draft", config, successfulFetch())).rejects.toEqual(expect.objectContaining({ message: "Published entries are read-only." }));
  });

  it("updates a renamed draft while retaining its number, date, and expected head", async () => {
    const fetcher = draftFetch();
    const result = await updateGitHubJournalDraft("draft-entry", { title: "Renamed draft", summary: "An updated draft entry.", tags: ["LedgerOS"], body: "Updated body." }, "draft", config, fetcher, new Date("2026-10-05T12:00:00Z"));
    expect(result.entry).toMatchObject({ number: "005", slug: "renamed-draft", publishedDate: "2026-09-30", status: "draft" });
    const graphqlCall = vi.mocked(fetcher).mock.calls.find(([url]) => String(url) === "https://api.github.com/graphql");
    const body = JSON.parse(String((graphqlCall?.[1] as RequestInit).body));
    expect(body.variables.input.expectedHeadOid).toBe("draft-head-oid");
    expect(body.variables.input.fileChanges.additions[0].path).toBe("apps/site/content/journal/renamed-draft.md");
    expect(body.variables.input.fileChanges.deletions).toEqual([{ path: "apps/site/content/journal/draft-entry.md" }]);
  });

  it("sets the publication date only when a draft is first published", async () => {
    const result = await updateGitHubJournalDraft("draft-entry", { title: draft.title, summary: draft.summary, tags: draft.tags, body: draft.body }, "published", config, draftFetch(), new Date("2026-10-05T12:00:00Z"));
    expect(result.entry).toMatchObject({ number: "005", publishedDate: "2026-10-05", status: "published" });
  });

  it("fails without a mutation when the requested draft is missing", async () => {
    const fetcher = successfulFetch();
    await expect(updateGitHubJournalDraft("missing-draft", { title: "Missing", summary: "Missing summary.", tags: ["LedgerOS"], body: "Missing body." }, "draft", config, fetcher)).rejects.toEqual(expect.objectContaining({ message: "This draft no longer exists." }));
    expect(vi.mocked(fetcher).mock.calls.some(([url]) => String(url) === "https://api.github.com/graphql")).toBe(false);
  });

  it("ignores nested Markdown files outside the canonical flat directory", async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/git/ref/heads/")) return json({ object: { sha: "head-oid" } });
      if (url.includes("/git/trees/")) return json({ tree: [{ path: "apps/site/content/journal/archive/nested.md", type: "blob", sha: "nested-blob" }] });
      return json({}, 404);
    }) as unknown as typeof fetch;
    await expect(fetchGitHubJournalSnapshot(config, fetcher)).resolves.toEqual({ headOid: "head-oid", entries: [] });
  });
});
