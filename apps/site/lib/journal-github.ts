import {
  getLondonDate,
  getNextJournalNumber,
  journalContentDirectory,
  parseJournalMarkdown,
  serializeJournalEntry,
  slugifyJournalTitle,
  validateJournalAuthorInput,
  validateJournalEntries,
  type JournalAuthorInput,
  type JournalEntry,
  type JournalEntryStatus,
} from "./journal";

export type GitHubJournalConfig = { token: string; owner: string; repository: string; branch: string };
export type JournalSnapshot = { headOid: string; entries: JournalEntry[] };
export type JournalCommitResult = { oid: string; url: string; entry: JournalEntry };

export class JournalConfigurationError extends Error { constructor() { super("Journal publishing is not configured."); this.name = "JournalConfigurationError"; } }
export class JournalGitHubError extends Error { constructor(message = "GitHub could not complete the Journal operation.") { super(message); this.name = "JournalGitHubError"; } }
export class JournalConflictError extends JournalGitHubError { constructor() { super("The repository changed while this entry was being saved. Refresh and try again."); this.name = "JournalConflictError"; } }

type Fetcher = typeof fetch;

export function getGitHubJournalConfig(): GitHubJournalConfig {
  const token = process.env.JOURNAL_GITHUB_TOKEN;
  const owner = process.env.JOURNAL_GITHUB_OWNER;
  const repository = process.env.JOURNAL_GITHUB_REPOSITORY;
  const branch = process.env.JOURNAL_GITHUB_BRANCH;
  if (!token || !owner || !repository || !branch) throw new JournalConfigurationError();
  return { token, owner, repository, branch };
}

export function journalRepositoryPath(slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new JournalGitHubError("The generated Journal path is invalid.");
  const value = `${journalContentDirectory}/${slug}.md`;
  if (!value.startsWith(`${journalContentDirectory}/`) || value.includes("..") || value.includes("\\")) throw new JournalGitHubError("The generated Journal path is invalid.");
  return value;
}

async function githubJson<T>(url: string, config: GitHubJournalConfig, fetcher: Fetcher): Promise<T> {
  let response: Response;
  try {
    response = await fetcher(url, { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${config.token}`, "X-GitHub-Api-Version": "2022-11-28" }, cache: "no-store" });
  } catch { throw new JournalGitHubError("GitHub is currently unreachable."); }
  if (!response.ok) throw new JournalGitHubError();
  return response.json() as Promise<T>;
}

export async function fetchGitHubJournalSnapshot(config = getGitHubJournalConfig(), fetcher: Fetcher = fetch): Promise<JournalSnapshot> {
  const api = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repository)}`;
  const branchPath = config.branch.split("/").map(encodeURIComponent).join("/");
  const ref = await githubJson<{ object: { sha: string } }>(`${api}/git/ref/heads/${branchPath}`, config, fetcher);
  const tree = await githubJson<{ tree: Array<{ path: string; type: string; sha: string }> }>(`${api}/git/trees/${ref.object.sha}?recursive=1`, config, fetcher);
  const journalFilename = new RegExp(`^${journalContentDirectory.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[^/]+\\.md$`);
  const files = tree.tree.filter((item) => item.type === "blob" && journalFilename.test(item.path));
  const entries = await Promise.all(files.map(async (file) => {
    const blob = await githubJson<{ content: string; encoding: string }>(`${api}/git/blobs/${file.sha}`, config, fetcher);
    if (blob.encoding !== "base64") throw new JournalGitHubError("GitHub returned an unsupported Journal file encoding.");
    return parseJournalMarkdown(Buffer.from(blob.content.replace(/\n/g, ""), "base64").toString("utf8"), file.path.split("/").at(-1)!);
  }));
  return { headOid: ref.object.sha, entries: validateJournalEntries(entries) };
}

type CommitChanges = { additions: Array<{ path: string; contents: string }>; deletions?: Array<{ path: string }> };

async function createGitHubCommit(config: GitHubJournalConfig, expectedHeadOid: string, message: string, changes: CommitChanges, fetcher: Fetcher): Promise<{ oid: string; url: string }> {
  const query = `mutation CreateJournalCommit($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input: $input) { commit { oid url } } }`;
  let response: Response;
  try {
    response = await fetcher("https://api.github.com/graphql", {
      method: "POST",
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { input: { branch: { repositoryNameWithOwner: `${config.owner}/${config.repository}`, branchName: config.branch }, expectedHeadOid, message: { headline: message }, fileChanges: changes } } }),
    });
  } catch { throw new JournalGitHubError("GitHub is currently unreachable."); }
  if (!response.ok) throw new JournalGitHubError();
  const payload = await response.json() as { data?: { createCommitOnBranch?: { commit: { oid: string; url: string } } }; errors?: Array<{ message: string; type?: string }> };
  if (payload.errors?.length) {
    const conflict = payload.errors.some((error) => /head|oid|fast.forward|branch.*changed/i.test(error.message));
    if (conflict) throw new JournalConflictError();
    throw new JournalGitHubError();
  }
  const commit = payload.data?.createCommitOnBranch?.commit;
  if (!commit) throw new JournalGitHubError();
  return commit;
}

function encodeEntry(entry: JournalEntry): string {
  const markdown = serializeJournalEntry(entry);
  parseJournalMarkdown(markdown, `${entry.slug}.md`);
  return Buffer.from(markdown, "utf8").toString("base64");
}

export async function createGitHubJournalEntry(input: JournalAuthorInput, status: JournalEntryStatus, config = getGitHubJournalConfig(), fetcher: Fetcher = fetch, now = new Date()): Promise<JournalCommitResult> {
  const authorInput = validateJournalAuthorInput(input);
  const snapshot = await fetchGitHubJournalSnapshot(config, fetcher);
  const entry: JournalEntry = { ...authorInput, number: getNextJournalNumber(snapshot.entries), slug: slugifyJournalTitle(authorInput.title), publishedDate: getLondonDate(now), status };
  validateJournalEntries([...snapshot.entries, entry]);
  const commit = await createGitHubCommit(config, snapshot.headOid, `${status === "published" ? "Publish" : "Save draft"} Journal ${entry.number}: ${entry.title}`, { additions: [{ path: journalRepositoryPath(entry.slug), contents: encodeEntry(entry) }] }, fetcher);
  return { ...commit, entry };
}

export async function updateGitHubJournalDraft(originalSlug: string, input: JournalAuthorInput, status: JournalEntryStatus, config = getGitHubJournalConfig(), fetcher: Fetcher = fetch, now = new Date()): Promise<JournalCommitResult> {
  journalRepositoryPath(originalSlug);
  const authorInput = validateJournalAuthorInput(input);
  const snapshot = await fetchGitHubJournalSnapshot(config, fetcher);
  const existing = snapshot.entries.find((entry) => entry.slug === originalSlug);
  if (!existing) throw new JournalGitHubError("This draft no longer exists.");
  if (existing.status !== "draft") throw new JournalGitHubError("Published entries are read-only.");
  const entry: JournalEntry = { ...existing, ...authorInput, slug: existing.slug, status, publishedDate: status === "published" ? getLondonDate(now) : existing.publishedDate };
  validateJournalEntries([...snapshot.entries.filter((item) => item.slug !== originalSlug), entry]);
  const oldPath = journalRepositoryPath(originalSlug); const newPath = journalRepositoryPath(entry.slug);
  const changes: CommitChanges = { additions: [{ path: newPath, contents: encodeEntry(entry) }] };
  if (oldPath !== newPath) changes.deletions = [{ path: oldPath }];
  const commit = await createGitHubCommit(config, snapshot.headOid, `${status === "published" ? "Publish" : "Update draft"} Journal ${entry.number}: ${entry.title}`, changes, fetcher);
  return { ...commit, entry };
}
import "server-only";
