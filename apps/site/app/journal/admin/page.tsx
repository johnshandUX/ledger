import Link from "next/link";
import { signOut } from "../../../auth";
import { requireJournalAdmin } from "../../../lib/journal-auth";
import { fetchGitHubJournalSnapshot, JournalConfigurationError, JournalGitHubError } from "../../../lib/journal-github";

export const metadata = { title: "Journal admin" };
export const dynamic = "force-dynamic";

export default async function JournalAdminPage() {
  await requireJournalAdmin();
  let entries = null; let error = "";
  try { entries = (await fetchGitHubJournalSnapshot()).entries; } catch (reason) { error = reason instanceof JournalConfigurationError ? "Add the required environment variables before using Journal admin." : reason instanceof JournalGitHubError ? reason.message : "Entries could not be loaded."; }
  return <main id="main-content" className="page-shell inner-page journal-admin-page"><header className="journal-admin-header"><div><p className="eyebrow">Journal admin</p><h1>Entries</h1><p>Create, review and publish LedgerOS Journal entries.</p></div><div className="journal-admin-header__actions"><Link className="button-link" href="/journal/admin/new">New entry</Link><form action={async () => { "use server"; await signOut({ redirectTo: "/journal/admin-sign-in" }); }}><button className="text-link journal-admin-sign-out" type="submit">Sign out</button></form></div></header>
    {error ? <div className="journal-admin-message journal-admin-message--error" role="alert"><p>{error}</p></div> : <ol className="journal-admin-list">{entries?.map((entry) => <li key={entry.slug}><span className="journal-entry-number">Journal {entry.number}</span><div><h2>{entry.title}</h2><span className={`journal-admin-status journal-admin-status--${entry.status}`}>{entry.status}</span></div>{entry.status === "draft" ? <Link className="text-link" href={`/journal/admin/${entry.slug}`}>Edit draft</Link> : <Link className="text-link" href={`/journal/${entry.slug}`}>View entry</Link>}</li>)}</ol>}
  </main>;
}
