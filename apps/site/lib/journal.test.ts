import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getJournalEntries, getNextJournalNumber, getPublishedJournalEntries, parseJournalMarkdown, serializeJournalEntry, slugifyJournalTitle, validateJournalEntries } from "./journal";

const temporaryDirectories: string[] = [];

function createJournalDirectory(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "ledger-journal-"));
  temporaryDirectories.push(directory);
  return directory;
}

function journalMarkdown(overrides: Record<string, string> = {}, body = "A clear Journal entry."): string {
  const metadata = {
    number: '"001"',
    title: '"Why I started LedgerOS"',
    slug: '"why-i-started-ledgeros"',
    summary: '"The reason for beginning the LedgerOS project."',
    publishedDate: '"2026-10-04"',
    status: '"published"',
    ...overrides,
  };

  return `---\n${Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join("\n")}\ntags:\n  - LedgerOS\n---\n\n${body}\n`;
}

function writeEntry(directory: string, fileName: string, content: string): void {
  fs.writeFileSync(path.join(directory, fileName), content);
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("Journal content model", () => {
  it("accepts valid metadata and body content", () => {
    const directory = createJournalDirectory();
    writeEntry(directory, "why-i-started-ledgeros.md", journalMarkdown());

    expect(getJournalEntries(directory)).toEqual([
      expect.objectContaining({
        number: "001",
        title: "Why I started LedgerOS",
        slug: "why-i-started-ledgeros",
        status: "published",
        tags: ["LedgerOS"],
        body: "A clear Journal entry.",
      }),
    ]);
  });

  it.each(["number", "title", "slug", "summary", "publishedDate", "status"])(
    "requires non-empty %s metadata",
    (field) => {
      const directory = createJournalDirectory();
      writeEntry(directory, "why-i-started-ledgeros.md", journalMarkdown({ [field]: '""' }));

      expect(() => getJournalEntries(directory)).toThrow(`must define a non-empty ${field}`);
    },
  );

  it("rejects duplicate Journal numbers", () => {
    const directory = createJournalDirectory();
    writeEntry(directory, "why-i-started-ledgeros.md", journalMarkdown());
    writeEntry(
      directory,
      "another-entry.md",
      journalMarkdown({ title: '"Another entry"', slug: '"another-entry"' }),
    );

    expect(() => getJournalEntries(directory)).toThrow("Journal number 001 is used more than once");
  });

  it.each(["2026-02-30", "2026-13-01", "04-10-2026"])("rejects invalid date %s", (date) => {
    const directory = createJournalDirectory();
    writeEntry(
      directory,
      "why-i-started-ledgeros.md",
      journalMarkdown({ publishedDate: `"${date}"` }),
    );

    expect(() => getJournalEntries(directory)).toThrow("must use a YYYY-MM-DD publishedDate");
  });

  it("rejects unsupported status values", () => {
    const directory = createJournalDirectory();
    writeEntry(
      directory,
      "why-i-started-ledgeros.md",
      journalMarkdown({ status: '"scheduled"' }),
    );

    expect(() => getJournalEntries(directory)).toThrow("has an unsupported status");
  });

  it("rejects filename and slug mismatches", () => {
    const directory = createJournalDirectory();
    writeEntry(directory, "different-file-name.md", journalMarkdown());

    expect(() => getJournalEntries(directory)).toThrow("must use the filename as its slug");
  });

  it("excludes drafts and includes published entries in public results", () => {
    const directory = createJournalDirectory();
    writeEntry(directory, "why-i-started-ledgeros.md", journalMarkdown());
    writeEntry(
      directory,
      "unpublished-notes.md",
      journalMarkdown({ number: '"002"', slug: '"unpublished-notes"', status: '"draft"' }),
    );

    expect(getPublishedJournalEntries(directory).map((entry) => entry.slug)).toEqual([
      "why-i-started-ledgeros",
    ]);
  });

  it("orders entries by Journal number from newest to oldest", () => {
    const directory = createJournalDirectory();
    writeEntry(directory, "first-entry.md", journalMarkdown({ number: '"001"', slug: '"first-entry"' }));
    writeEntry(directory, "third-entry.md", journalMarkdown({ number: '"003"', slug: '"third-entry"' }));
    writeEntry(directory, "second-entry.md", journalMarkdown({ number: '"002"', slug: '"second-entry"' }));

    expect(getJournalEntries(directory).map((entry) => entry.number)).toEqual(["003", "002", "001"]);
  });

  it("fails clearly when frontmatter is malformed", () => {
    const directory = createJournalDirectory();
    writeEntry(directory, "broken-entry.md", "---\ntitle: [unterminated\n---\nBroken content");

    expect(() => getJournalEntries(directory)).toThrow();
  });

  it("serializes entries that round-trip through the shared parser", () => {
    const entry = parseJournalMarkdown(journalMarkdown(), "why-i-started-ledgeros.md");
    expect(parseJournalMarkdown(serializeJournalEntry(entry), "why-i-started-ledgeros.md")).toEqual(entry);
  });

  it("generates canonical slugs from titles", () => {
    expect(slugifyJournalTitle("What makes a design system agentic?")).toBe("what-makes-a-design-system-agentic");
    expect(slugifyJournalTitle("  LedgerOS: People & agents  ")).toBe("ledgeros-people-agents");
  });

  it("generates the next three-digit Journal number", () => {
    const entry = parseJournalMarkdown(journalMarkdown(), "why-i-started-ledgeros.md");
    expect(getNextJournalNumber([entry, { ...entry, number: "009", slug: "ninth-entry" }])).toBe("010");
  });

  it("rejects duplicate slugs in a collection", () => {
    const entry = parseJournalMarkdown(journalMarkdown(), "why-i-started-ledgeros.md");
    expect(() => validateJournalEntries([entry, { ...entry, number: "002" }])).toThrow("slug why-i-started-ledgeros is used more than once");
  });
});
