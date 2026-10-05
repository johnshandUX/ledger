import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type JournalEntryStatus = "draft" | "published";
export type JournalEntry = { number: string; title: string; slug: string; summary: string; publishedDate: string; status: JournalEntryStatus; tags: string[]; body: string };
export type JournalAuthorInput = Pick<JournalEntry, "title" | "summary" | "tags" | "body">;

export class JournalValidationError extends Error {
  constructor(message: string, readonly field?: keyof JournalEntry) { super(message); this.name = "JournalValidationError"; }
}

export const journalContentDirectory = "apps/site/content/journal";
const localJournalDirectory = path.join(process.cwd(), "content", "journal");
const requiredStringFields = ["number", "title", "slug", "summary", "publishedDate", "status"] as const;
const limits = { title: 160, summary: 320, body: 50_000, tags: 8, tag: 48 } as const;

export function slugifyJournalTitle(title: string): string {
  const slug = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[\u2018\u2019']/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) throw new JournalValidationError("Title must produce a usable URL slug.", "title");
  return slug;
}

export function getNextJournalNumber(entries: JournalEntry[]): string {
  const next = entries.reduce((maximum, entry) => Math.max(maximum, Number(entry.number)), 0) + 1;
  if (next > 999) throw new JournalValidationError("Journal numbering has reached its three-digit limit.", "number");
  return String(next).padStart(3, "0");
}

export function getLondonDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function validateJournalAuthorInput(input: JournalAuthorInput): JournalAuthorInput {
  const title = input.title.trim();
  const summary = input.summary.trim();
  const body = input.body.trim();
  const tags = input.tags.map((tag) => tag.trim()).filter(Boolean);
  if (!title) throw new JournalValidationError("Title is required.", "title");
  if (title.length > limits.title) throw new JournalValidationError(`Title must be ${limits.title} characters or fewer.`, "title");
  if (!summary) throw new JournalValidationError("Summary is required.", "summary");
  if (summary.length > limits.summary) throw new JournalValidationError(`Summary must be ${limits.summary} characters or fewer.`, "summary");
  if (!body) throw new JournalValidationError("Body is required.", "body");
  if (body.length > limits.body) throw new JournalValidationError(`Body must be ${limits.body.toLocaleString()} characters or fewer.`, "body");
  if (tags.length === 0) throw new JournalValidationError("Add at least one tag.", "tags");
  if (tags.length > limits.tags) throw new JournalValidationError(`Use no more than ${limits.tags} tags.`, "tags");
  if (tags.some((tag) => tag.length > limits.tag)) throw new JournalValidationError(`Tags must be ${limits.tag} characters or fewer.`, "tags");
  return { title, summary, body, tags: [...new Set(tags)] };
}

export function validateJournalEntry(entry: JournalEntry, fileName = `${entry.slug}.md`): JournalEntry {
  for (const field of requiredStringFields) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") throw new JournalValidationError(`Journal entry ${fileName} must define a non-empty ${field}.`, field);
  }
  if (!/^\d{3}$/.test(entry.number)) throw new JournalValidationError(`Journal entry ${fileName} must use a three-digit number.`, "number");
  if (entry.status !== "draft" && entry.status !== "published") throw new JournalValidationError(`Journal entry ${fileName} has an unsupported status.`, "status");
  const date = new Date(`${entry.publishedDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.publishedDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== entry.publishedDate) throw new JournalValidationError(`Journal entry ${fileName} must use a YYYY-MM-DD publishedDate.`, "publishedDate");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) throw new JournalValidationError(`Journal entry ${fileName} has an invalid slug.`, "slug");
  if (entry.slug !== fileName.replace(/\.md$/, "")) throw new JournalValidationError(`Journal entry ${fileName} must use the filename as its slug.`, "slug");
  if (!Array.isArray(entry.tags) || entry.tags.some((tag) => typeof tag !== "string")) throw new JournalValidationError(`Journal entry ${fileName} must define tags as a list of strings.`, "tags");
  return { ...entry, ...validateJournalAuthorInput(entry) };
}

export function parseJournalMarkdown(raw: string, fileName: string): JournalEntry {
  let parsed: matter.GrayMatterFile<string>;
  try { parsed = matter(raw); } catch { throw new JournalValidationError(`Journal entry ${fileName} has malformed frontmatter.`); }
  const data = parsed.data as Partial<JournalEntry>;
  return validateJournalEntry({ number: data.number as string, title: data.title as string, slug: data.slug as string, summary: data.summary as string, publishedDate: data.publishedDate as string, status: data.status as JournalEntryStatus, tags: data.tags as string[], body: parsed.content.trim() }, fileName);
}

export function serializeJournalEntry(entry: JournalEntry): string {
  const value = validateJournalEntry(entry);
  const tags = value.tags.map((tag) => `  - ${JSON.stringify(tag)}`).join("\n");
  return `---\nnumber: ${JSON.stringify(value.number)}\ntitle: ${JSON.stringify(value.title)}\nslug: ${JSON.stringify(value.slug)}\nsummary: ${JSON.stringify(value.summary)}\npublishedDate: ${JSON.stringify(value.publishedDate)}\nstatus: ${JSON.stringify(value.status)}\ntags:\n${tags}\n---\n\n${value.body}\n`;
}

export function validateJournalEntries(entries: JournalEntry[]): JournalEntry[] {
  const numbers = new Set<string>(); const slugs = new Set<string>();
  for (const entry of entries) {
    if (numbers.has(entry.number)) throw new JournalValidationError(`Journal number ${entry.number} is used more than once.`, "number");
    if (slugs.has(entry.slug)) throw new JournalValidationError(`Journal slug ${entry.slug} is used more than once.`, "slug");
    numbers.add(entry.number); slugs.add(entry.slug);
  }
  return [...entries].sort((a, b) => Number(b.number) - Number(a.number));
}

export function getJournalEntries(directory = localJournalDirectory): JournalEntry[] {
  if (!fs.existsSync(directory)) return [];
  return validateJournalEntries(fs.readdirSync(directory).filter((fileName) => fileName.endsWith(".md")).map((fileName) => parseJournalMarkdown(fs.readFileSync(path.join(directory, fileName), "utf8"), fileName)));
}

export function getPublishedJournalEntries(directory = localJournalDirectory): JournalEntry[] { return getJournalEntries(directory).filter((entry) => entry.status === "published"); }
export function getPublishedJournalEntryBySlug(slug: string, directory = localJournalDirectory): JournalEntry | undefined { return getPublishedJournalEntries(directory).find((entry) => entry.slug === slug); }
