import Link from "next/link";
import { requireJournalAdmin } from "../../../../lib/journal-auth";
import { fetchGitHubJournalSnapshot } from "../../../../lib/journal-github";
import { getNextJournalNumber } from "../../../../lib/journal";
import { createJournalEntryAction } from "../actions";
import { JournalEntryForm } from "../_components/JournalEntryForm";

export const metadata = { title: "New Journal entry" };
export const dynamic = "force-dynamic";

export default async function NewJournalEntryPage() {
  await requireJournalAdmin();
  let number = "Next";
  try { number = getNextJournalNumber((await fetchGitHubJournalSnapshot()).entries); } catch { /* Form reports configuration and GitHub errors on submission. */ }
  return <main id="main-content" className="page-shell inner-page journal-admin-page"><Link className="journal-back-link" href="/journal/admin">← Entries</Link><JournalEntryForm action={createJournalEntryAction} journalNumber={number} mode="new" /></main>;
}
