import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  getPublishedJournalEntries,
  getPublishedJournalEntryBySlug,
} from "../../../lib/journal";

export const dynamicParams = false;

type JournalEntryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublishedJournalEntries().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: JournalEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPublishedJournalEntryBySlug(slug);

  if (!entry) return { title: "Journal entry not found" };

  return {
    title: entry.title,
    description: entry.summary,
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.summary,
      tags: entry.tags,
      images: [{ url: "/og.png", width: 1730, height: 909, alt: "LedgerOS, the Ledger Design System and Ledger Bank" }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.summary,
      images: ["/og.png"],
    },
  };
}

export default async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { slug } = await params;
  const entry = getPublishedJournalEntryBySlug(slug);

  if (!entry) notFound();

  return (
    <main id="main-content" className="page-shell journal-article-page">
      <Link className="journal-back-link" href="/journal">← Journal index</Link>

      <article className="journal-article">
        <header className="journal-article-header">
          <p className="journal-article-number">Journal {entry.number}</p>
          <h1>{entry.title}</h1>
          <p className="journal-article-summary">{entry.summary}</p>
          <div className="journal-article-meta">
            {entry.tags.length > 0 && (
              <ul aria-label="Topics">
                {entry.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            )}
          </div>
        </header>

        <div className="journal-prose">
          <ReactMarkdown>{entry.body}</ReactMarkdown>
        </div>
      </article>

      <footer className="journal-article-footer">
        <p>Continue through the record of LedgerOS as it is built.</p>
        <Link className="text-link" href="/journal">View all Journal entries</Link>
      </footer>
    </main>
  );
}
