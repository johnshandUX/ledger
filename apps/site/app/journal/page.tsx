import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedJournalEntries } from "../../lib/journal";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes, decisions and observations from building LedgerOS, Ledger Bank and the Ledger Design System.",
};

export default function JournalPage() {
  const entries = getPublishedJournalEntries();

  return (
    <main id="main-content" className="page-shell inner-page journal-page">
      <header className="journal-index-header">
        <p className="eyebrow">Journal</p>
        <h1>A record of LedgerOS in the making.</h1>
        <p className="page-intro">
          Notes, decisions and observations from building a code-first design system,
          a banking prototype and the tools that connect them.
        </p>
      </header>

      <section className="journal-index" aria-labelledby="journal-entries-heading">
        <div className="journal-index__heading">
          <h2 id="journal-entries-heading">Entries</h2>
          <p>{entries.length} published</p>
        </div>

        {entries.length > 0 ? (
          <ol className="journal-entry-list">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <Link className="journal-entry-link" href={`/journal/${entry.slug}`}>
                  <span className="journal-entry-number">Journal {entry.number}</span>
                  <span className="journal-entry-copy">
                    <h3 className="journal-entry-title">{entry.title}</h3>
                    <span className="journal-entry-summary">{entry.summary}</span>
                  </span>
                  <span className="journal-entry-meta">
                    {entry.tags.length > 0 && <span>{entry.tags.join(" · ")}</span>}
                  </span>
                  <span className="journal-entry-arrow" aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="journal-index__empty">No entries have been published yet.</p>
        )}
      </section>
    </main>
  );
}
