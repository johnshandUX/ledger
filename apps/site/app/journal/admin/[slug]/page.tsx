import Link from "next/link";
import { notFound } from "next/navigation";
import { requireJournalAdmin } from "../../../../lib/journal-auth";
import { fetchGitHubJournalSnapshot } from "../../../../lib/journal-github";
import { updateJournalDraftAction } from "../actions";
import { JournalEntryForm } from "../_components/JournalEntryForm";

export const metadata = { title: "Edit Journal draft" };
export const dynamic = "force-dynamic";

export default async function EditJournalDraftPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireJournalAdmin();
  const { slug } = await params;
  const entry = (await fetchGitHubJournalSnapshot()).entries.find((item) => item.slug === slug);
  if (!entry || entry.status !== "draft") notFound();
  const action = updateJournalDraftAction.bind(null, entry.slug);
  return <main id="main-content" className="page-shell inner-page journal-admin-page"><Link className="journal-back-link" href="/journal/admin">← Entries</Link><JournalEntryForm key={`draft-${entry.slug}`} action={action} journalNumber={entry.number} mode="draft" initialValues={{ title: entry.title, summary: entry.summary, tags: entry.tags.join(", "), body: entry.body }} /></main>;
}
